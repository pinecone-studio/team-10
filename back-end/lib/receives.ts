import { and, asc, eq } from "drizzle-orm";
import {
  conditionStatusValues,
  orderItems,
  orders,
  receiveItems,
  receiveStatusValues,
  receives,
  receivedConditionValues,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import {
  parseIntegerId,
  resolveOfficeId,
  resolveOrderId,
  resolveUserId,
} from "./reference-resolvers.ts";

type ReceiveStatus = (typeof receiveStatusValues)[number];
type ConditionStatus = (typeof conditionStatusValues)[number];
type ReceivedCondition = (typeof receivedConditionValues)[number];

type ReceiveRow = {
  id: number;
  orderId: number;
  receivedByUserId: number;
  officeId: number;
  status: ReceiveStatus;
  receivedAt: string;
  receiveNote: string | null;
  orderItemId: number;
  quantityReceived: number;
  conditionStatus: ConditionStatus;
  itemNote: string | null;
  receivedCondition: ReceivedCondition | null;
  storageLocation: string | null;
  serialNumbersJson: string | null;
};

export type ReceiveRecord = {
  id: string;
  orderId: string;
  receivedByUserId: string;
  officeId: string;
  status: ReceiveStatus;
  receivedAt: string;
  note: string | null;
  orderItemId: string;
  quantityReceived: number;
  conditionStatus: ConditionStatus;
  receivedCondition: ReceivedCondition | null;
  storageLocation: string | null;
  serialNumbers: string[];
};

export type CreateReceiveInput = {
  orderId?: string | null;
  orderItemId?: string | null;
  quantityReceived?: number | null;
  conditionStatus?: string | null;
  receivedAt?: string | null;
  receivedCondition?: string | null;
  note?: string | null;
  storageLocation?: string | null;
  serialNumbers?: string[] | null;
};

export type UpdateReceiveInput = {
  orderId?: string | null;
  orderItemId?: string | null;
  quantityReceived?: number | null;
  conditionStatus?: string | null;
  receivedAt?: string | null;
  receivedCondition?: string | null;
  note?: string | null;
  storageLocation?: string | null;
  serialNumbers?: string[] | null;
};

const receiveSelection = {
  id: receives.id,
  orderId: receives.orderId,
  receivedByUserId: receives.receivedByUserId,
  officeId: receives.officeId,
  status: receives.status,
  receivedAt: receives.receivedAt,
  receiveNote: receives.note,
  orderItemId: receiveItems.orderItemId,
  quantityReceived: receiveItems.quantityReceived,
  conditionStatus: receiveItems.conditionStatus,
  itemNote: receiveItems.note,
  receivedCondition: orders.receivedCondition,
  storageLocation: orders.storageLocation,
  serialNumbersJson: orders.serialNumbersJson,
};

function parseStringArray(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function mapReceive(row: ReceiveRow): ReceiveRecord {
  return {
    id: String(row.id),
    orderId: String(row.orderId),
    receivedByUserId: String(row.receivedByUserId),
    officeId: String(row.officeId),
    status: row.status,
    receivedAt: row.receivedAt,
    note: row.itemNote ?? row.receiveNote,
    orderItemId: String(row.orderItemId),
    quantityReceived: row.quantityReceived,
    conditionStatus: row.conditionStatus,
    receivedCondition: row.receivedCondition,
    storageLocation: row.storageLocation,
    serialNumbers: parseStringArray(row.serialNumbersJson),
  };
}

function parseConditionStatus(
  conditionStatus?: string | null,
): ConditionStatus {
  const normalized = conditionStatus?.trim() ?? "good";

  if (!conditionStatusValues.includes(normalized as ConditionStatus)) {
    throw new Error(
      `Condition status must be one of: ${conditionStatusValues.join(", ")}.`,
    );
  }

  return normalized as ConditionStatus;
}

function parseReceivedCondition(
  receivedCondition?: string | null,
): ReceivedCondition | null {
  if (receivedCondition === undefined || receivedCondition === null) {
    return null;
  }

  if (!receivedConditionValues.includes(receivedCondition as ReceivedCondition)) {
    throw new Error(
      `Received condition must be one of: ${receivedConditionValues.join(", ")}.`,
    );
  }

  return receivedCondition as ReceivedCondition;
}

function deriveReceiveStatus(
  quantityReceived: number,
  orderedQuantity: number,
): ReceiveStatus {
  return quantityReceived >= orderedQuantity ? "received" : "partiallyReceived";
}

function mapReceiveStatusToOrderStatus(status: ReceiveStatus) {
  if (status === "received") return "received";
  if (status === "partiallyReceived") return "partiallyReceived";
  return "ordered";
}

async function getOrderItemContext(
  db: AppDb,
  orderId: number,
  orderItemId?: string | null,
) {
  if (!orderItemId) {
    throw new Error("orderItemId is required.");
  }

  const numericOrderItemId = parseIntegerId("orderItemId", orderItemId);

  const [row] = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(
      and(eq(orderItems.id, numericOrderItemId), eq(orderItems.orderId, orderId)),
    )
    .limit(1);

  if (!row) {
    throw new Error(`Order item ${orderItemId} does not exist for order ${orderId}.`);
  }

  return row;
}

async function getReceiveRowById(
  db: AppDb,
  id: string,
): Promise<ReceiveRow | null> {
  const numericId = parseIntegerId("Receive id", id);

  const [row] = await db
    .select(receiveSelection)
    .from(receives)
    .innerJoin(receiveItems, eq(receives.id, receiveItems.receiveId))
    .innerJoin(orders, eq(receives.orderId, orders.id))
    .where(eq(receives.id, numericId))
    .limit(1);

  return row ?? null;
}

export async function listReceives(db: AppDb): Promise<ReceiveRecord[]> {
  const rows = await db
    .select(receiveSelection)
    .from(receives)
    .innerJoin(receiveItems, eq(receives.id, receiveItems.receiveId))
    .innerJoin(orders, eq(receives.orderId, orders.id))
    .orderBy(asc(receives.id), asc(receiveItems.id));

  return rows.map(mapReceive);
}

export async function getReceiveById(
  db: AppDb,
  id: string,
): Promise<ReceiveRecord | null> {
  const row = await getReceiveRowById(db, id);
  return row ? mapReceive(row) : null;
}

export async function createReceive(
  db: AppDb,
  input: CreateReceiveInput,
  currentUserId?: string | null,
): Promise<ReceiveRecord> {
  const orderId = await resolveOrderId(db, input.orderId, currentUserId);
  const orderItem = await getOrderItemContext(db, orderId, input.orderItemId);
  const receivedByUserId = await resolveUserId(db, undefined, currentUserId);
  const officeId = await resolveOfficeId(db);
  const quantityReceived = Number(input.quantityReceived);

  if (!Number.isInteger(quantityReceived) || quantityReceived <= 0) {
    throw new Error("quantityReceived must be a positive integer.");
  }

  if (quantityReceived > orderItem.quantity) {
    throw new Error("quantityReceived cannot exceed the ordered quantity.");
  }

  const status = deriveReceiveStatus(quantityReceived, orderItem.quantity);
  const receivedAt = input.receivedAt ?? new Date().toISOString();

  const [receiveRow] = await db
    .insert(receives)
    .values({
      orderId,
      receivedByUserId,
      officeId,
      status,
      receivedAt,
      note: input.note?.trim() || null,
    })
    .returning({ id: receives.id });

  await db
    .insert(receiveItems)
    .values({
      receiveId: receiveRow.id,
      orderItemId: orderItem.id,
      quantityReceived,
      conditionStatus: parseConditionStatus(input.conditionStatus),
      note: input.note?.trim() || null,
    })
    .run();

  await db
    .update(orders)
    .set({
      status: mapReceiveStatusToOrderStatus(status),
      receivedAt,
      receivedCondition: parseReceivedCondition(input.receivedCondition),
      receivedNote: input.note?.trim() || null,
      storageLocation: input.storageLocation?.trim() || null,
      serialNumbersJson: JSON.stringify(input.serialNumbers ?? []),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, orderId))
    .run();

  const createdReceive = await getReceiveById(db, String(receiveRow.id));
  if (!createdReceive) {
    throw new Error("Failed to load created receive.");
  }

  return createdReceive;
}

export async function updateReceive(
  db: AppDb,
  id: string,
  input: UpdateReceiveInput,
  currentUserId?: string | null,
): Promise<ReceiveRecord | null> {
  const existingReceive = await getReceiveRowById(db, id);
  if (!existingReceive) return null;

  const orderId =
    input.orderId !== undefined
      ? await resolveOrderId(db, input.orderId, currentUserId)
      : existingReceive.orderId;
  const orderItem =
    input.orderItemId !== undefined
      ? await getOrderItemContext(db, orderId, input.orderItemId)
      : await getOrderItemContext(db, orderId, String(existingReceive.orderItemId));
  const quantityReceived =
    input.quantityReceived !== undefined
      ? Number(input.quantityReceived)
      : existingReceive.quantityReceived;

  if (!Number.isInteger(quantityReceived) || quantityReceived <= 0) {
    throw new Error("quantityReceived must be a positive integer.");
  }

  if (quantityReceived > orderItem.quantity) {
    throw new Error("quantityReceived cannot exceed the ordered quantity.");
  }

  const status = deriveReceiveStatus(quantityReceived, orderItem.quantity);
  const receivedAt = input.receivedAt ?? existingReceive.receivedAt;
  const receivedByUserId = await resolveUserId(db, undefined, currentUserId);
  const officeId = await resolveOfficeId(db);

  await db
    .update(receives)
    .set({
      orderId,
      receivedByUserId,
      officeId,
      status,
      receivedAt,
      note:
        input.note !== undefined
          ? input.note?.trim() || null
          : existingReceive.itemNote ?? existingReceive.receiveNote,
    })
    .where(eq(receives.id, parseIntegerId("Receive id", id)))
    .run();

  await db
    .update(receiveItems)
    .set({
      orderItemId: orderItem.id,
      quantityReceived,
      conditionStatus:
        input.conditionStatus !== undefined
          ? parseConditionStatus(input.conditionStatus)
          : existingReceive.conditionStatus,
      note:
        input.note !== undefined
          ? input.note?.trim() || null
          : existingReceive.itemNote ?? existingReceive.receiveNote,
    })
    .where(eq(receiveItems.receiveId, parseIntegerId("Receive id", id)))
    .run();

  await db
    .update(orders)
    .set({
      status: mapReceiveStatusToOrderStatus(status),
      receivedAt,
      receivedCondition:
        input.receivedCondition !== undefined
          ? parseReceivedCondition(input.receivedCondition)
          : existingReceive.receivedCondition,
      receivedNote:
        input.note !== undefined
          ? input.note?.trim() || null
          : existingReceive.itemNote ?? existingReceive.receiveNote,
      storageLocation:
        input.storageLocation !== undefined
          ? input.storageLocation?.trim() || null
          : existingReceive.storageLocation,
      serialNumbersJson:
        input.serialNumbers !== undefined
          ? JSON.stringify(input.serialNumbers ?? [])
          : JSON.stringify(parseStringArray(existingReceive.serialNumbersJson)),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, orderId))
    .run();

  return getReceiveById(db, id);
}

export async function deleteReceive(db: AppDb, id: string): Promise<boolean> {
  const numericId = parseIntegerId("Receive id", id);

  const rows = await db
    .delete(receives)
    .where(eq(receives.id, numericId))
    .returning({ id: receives.id });

  return rows.length > 0;
}
