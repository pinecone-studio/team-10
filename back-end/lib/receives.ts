import { and, asc, eq } from "drizzle-orm";
import {
  assets,
  conditionStatusValues,
  orderItems,
  orders,
  receiveItems,
  receiveStatusValues,
  receives,
  storage,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import {
  parseIntegerId,
  resolveOfficeId,
  resolveOrderId,
  resolveUserId,
} from "./reference-resolvers.ts";
import { getOrderById, type OrderRecord } from "./orders.ts";

type ReceiveStatus = (typeof receiveStatusValues)[number];
type ConditionStatus = (typeof conditionStatusValues)[number];

type ReceiveRow = {
  id: number;
  orderId: number;
  receivedByUserId: number;
  officeId: number;
  status: ReceiveStatus;
  receivedAt: string;
  note: string | null;
};

export type ReceiveRecord = {
  id: string;
  orderId: string;
  receivedByUserId: string;
  officeId: string;
  status: ReceiveStatus;
  receivedAt: string;
  note: string | null;
};

export type ReceivedAssetRecord = {
  id: string;
  assetCode: string;
  qrCode: string;
  assetName: string;
  serialNumber: string | null;
  conditionStatus: ConditionStatus;
  assetStatus: string;
  currentStorageId: string | null;
};

export type ReceiveOrderItemRecord = {
  receive: ReceiveRecord;
  order: OrderRecord;
  assets: ReceivedAssetRecord[];
};

export type CreateReceiveInput = {
  orderId?: string | null;
  receivedByUserId?: string | null;
  officeId?: string | null;
  status: string;
  receivedAt?: string | null;
  note?: string | null;
};

export type UpdateReceiveInput = {
  orderId?: string | null;
  receivedByUserId?: string | null;
  officeId?: string | null;
  status?: string | null;
  receivedAt?: string | null;
  note?: string | null;
};

export type ReceiveOrderItemInput = {
  orderId: string;
  catalogId?: string | null;
  itemCode: string;
  quantityReceived: number;
  receivedAt?: string | null;
  receivedCondition: string;
  receivedNote?: string | null;
  storageLocation?: string | null;
  serialNumbers?: string[] | null;
  receivedByUserId?: string | null;
  officeId?: string | null;
};

const receiveSelection = {
  id: receives.id,
  orderId: receives.orderId,
  receivedByUserId: receives.receivedByUserId,
  officeId: receives.officeId,
  status: receives.status,
  receivedAt: receives.receivedAt,
  note: receives.note,
};

function mapReceive(row: ReceiveRow): ReceiveRecord {
  return {
    id: String(row.id),
    orderId: String(row.orderId),
    receivedByUserId: String(row.receivedByUserId),
    officeId: String(row.officeId),
    status: row.status,
    receivedAt: row.receivedAt,
    note: row.note,
  };
}

function parseReceiveStatus(status: string): ReceiveStatus {
  if (!receiveStatusValues.includes(status as ReceiveStatus)) {
    throw new Error(
      `Receive status must be one of: ${receiveStatusValues.join(", ")}.`,
    );
  }

  return status as ReceiveStatus;
}

function parseConditionStatusFromReceiveCondition(
  receivedCondition: string,
): ConditionStatus {
  if (receivedCondition === "complete") return "good";
  if (receivedCondition === "issue") return "damaged";

  throw new Error("Received condition must be one of: complete, issue.");
}

function buildQrCode(orderId: number, itemCode: string, serialNumber: string) {
  return `QR-${orderId}-${itemCode}-${serialNumber}`;
}

function normalizeSerialNumbers(
  itemCode: string,
  quantityReceived: number,
  serialNumbers?: string[] | null,
) {
  const cleaned = (serialNumbers ?? [])
    .map((serialNumber) => serialNumber.trim())
    .filter(Boolean);

  if (cleaned.length >= quantityReceived) {
    return cleaned.slice(0, quantityReceived);
  }

  const nextSerialNumbers = [...cleaned];
  for (let index = cleaned.length; index < quantityReceived; index += 1) {
    nextSerialNumbers.push(
      `${itemCode}-${String(index + 1).padStart(3, "0")}`,
    );
  }

  return nextSerialNumbers;
}

function parseJsonStringArray(value: string | null) {
  if (!value) return [] as string[];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

async function resolveStorageId(
  db: AppDb,
  storageLocation?: string | null,
) {
  const normalizedStorageName = storageLocation?.trim() || "Main warehouse / Intake";

  const [existingStorage] = await db
    .select({ id: storage.id })
    .from(storage)
    .where(eq(storage.storageName, normalizedStorageName))
    .limit(1);

  if (existingStorage) {
    return existingStorage.id;
  }

  const [createdStorage] = await db
    .insert(storage)
    .values({
      storageName: normalizedStorageName,
      storageType: "warehouse",
      description: "Auto-created during receive intake flow",
    })
    .returning({ id: storage.id });

  return createdStorage.id;
}

async function getOrderItemForReceive(
  db: AppDb,
  orderId: number,
  itemCode: string,
  catalogId?: string | null,
) {
  const filters = [eq(orderItems.orderId, orderId), eq(orderItems.itemCode, itemCode)];

  if (catalogId?.trim()) {
    filters.push(eq(orderItems.catalogProductId, parseIntegerId("catalogId", catalogId)));
  }

  const [orderItem] = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      itemName: orderItems.itemName,
      itemCode: orderItems.itemCode,
      itemType: orderItems.itemType,
      category: orderItems.category,
      quantity: orderItems.quantity,
      unitCost: orderItems.unitCost,
      currencyCode: orderItems.currencyCode,
      catalogItemTypeId: orderItems.catalogItemTypeId,
      catalogProductId: orderItems.catalogProductId,
    })
    .from(orderItems)
    .where(and(...filters))
    .orderBy(asc(orderItems.id))
    .limit(1);

  return orderItem ?? null;
}

async function computeRemainingOrderState(db: AppDb, orderId: number) {
  const rows = await db
    .select({
      quantity: orderItems.quantity,
      unitCost: orderItems.unitCost,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const remainingQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const remainingTotalCost = rows.reduce(
    (sum, row) => sum + row.quantity * row.unitCost,
    0,
  );

  return {
    remainingQuantity,
    remainingTotalCost,
  };
}

async function mapReceivedAssetsByReceiveItemId(
  db: AppDb,
  receiveItemId: number,
): Promise<ReceivedAssetRecord[]> {
  const rows = await db
    .select({
      id: assets.id,
      assetCode: assets.assetCode,
      qrCode: assets.qrCode,
      assetName: assets.assetName,
      serialNumber: assets.serialNumber,
      conditionStatus: assets.conditionStatus,
      assetStatus: assets.assetStatus,
      currentStorageId: assets.currentStorageId,
    })
    .from(assets)
    .where(eq(assets.receiveItemId, receiveItemId))
    .orderBy(asc(assets.id));

  return rows.map((row) => ({
    id: String(row.id),
    assetCode: row.assetCode,
    qrCode: row.qrCode,
    assetName: row.assetName,
    serialNumber: row.serialNumber,
    conditionStatus: row.conditionStatus,
    assetStatus: row.assetStatus,
    currentStorageId:
      row.currentStorageId === null ? null : String(row.currentStorageId),
  }));
}

export async function listReceives(db: AppDb): Promise<ReceiveRecord[]> {
  const rows = await db
    .select(receiveSelection)
    .from(receives)
    .orderBy(asc(receives.id));

  return rows.map(mapReceive);
}

export async function getReceiveById(
  db: AppDb,
  id: string,
): Promise<ReceiveRecord | null> {
  const numericId = parseIntegerId("Receive id", id);

  const [row] = await db
    .select(receiveSelection)
    .from(receives)
    .where(eq(receives.id, numericId))
    .limit(1);

  return row ? mapReceive(row) : null;
}

export async function createReceive(
  db: AppDb,
  input: CreateReceiveInput,
  currentUserId?: string | null,
): Promise<ReceiveRecord> {
  const orderId = await resolveOrderId(db, input.orderId, currentUserId);
  const receivedByUserId = await resolveUserId(
    db,
    input.receivedByUserId,
    currentUserId,
  );
  const officeId = await resolveOfficeId(db, input.officeId);

  const [row] = await db
    .insert(receives)
    .values({
      orderId,
      receivedByUserId,
      officeId,
      status: parseReceiveStatus(input.status),
      receivedAt: input.receivedAt ?? new Date().toISOString(),
      note: input.note ?? null,
    })
    .returning(receiveSelection);

  return mapReceive(row);
}

export async function receiveOrderItem(
  db: AppDb,
  input: ReceiveOrderItemInput,
  currentUserId?: string | null,
): Promise<ReceiveOrderItemRecord> {
  const orderId = parseIntegerId("orderId", input.orderId);
  const [order] = await db
    .select({
      id: orders.id,
      officeId: orders.officeId,
      receivedCondition: orders.receivedCondition,
      serialNumbersJson: orders.serialNumbersJson,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    throw new Error(`Order ${input.orderId} does not exist.`);
  }

  const orderItem = await getOrderItemForReceive(
    db,
    orderId,
    input.itemCode.trim(),
    input.catalogId,
  );

  if (!orderItem) {
    throw new Error("Order item was not found for receive intake.");
  }

  const quantityReceived = Number(input.quantityReceived);
  if (!Number.isInteger(quantityReceived) || quantityReceived <= 0) {
    throw new Error("quantityReceived must be a positive integer.");
  }

  if (quantityReceived > orderItem.quantity) {
    throw new Error("quantityReceived cannot exceed the remaining order quantity.");
  }

  const receivedAt = input.receivedAt ?? new Date().toISOString();
  const conditionStatus = parseConditionStatusFromReceiveCondition(
    input.receivedCondition,
  );
  const receiveStatus: ReceiveStatus =
    quantityReceived === orderItem.quantity ? "received" : "partiallyReceived";
  const receivedByUserId = await resolveUserId(
    db,
    input.receivedByUserId,
    currentUserId,
  );
  const officeId = await resolveOfficeId(db, input.officeId ?? String(order.officeId));
  const storageId = await resolveStorageId(db, input.storageLocation);
  const serialNumbers = normalizeSerialNumbers(
    orderItem.itemCode,
    quantityReceived,
    input.serialNumbers,
  );

  const [receive] = await db
    .insert(receives)
    .values({
      orderId,
      receivedByUserId,
      officeId,
      status: receiveStatus,
      receivedAt,
      note: input.receivedNote?.trim() || null,
    })
    .returning(receiveSelection);

  const [receiveItem] = await db
    .insert(receiveItems)
    .values({
      receiveId: receive.id,
      orderItemId: orderItem.id,
      quantityReceived,
      conditionStatus,
      note: input.receivedNote?.trim() || null,
    })
    .returning({ id: receiveItems.id });

  const assetValues = serialNumbers.map((serialNumber, index) => ({
    receiveItemId: receiveItem.id,
    assetCode: `AST-${String(orderId).padStart(4, "0")}-${String(
      receiveItem.id,
    ).padStart(4, "0")}-${String(index + 1).padStart(3, "0")}`,
    qrCode: buildQrCode(orderId, orderItem.itemCode, serialNumber),
    assetName: orderItem.itemName,
    category: orderItem.category,
    itemType: orderItem.itemType,
    catalogItemTypeId: orderItem.catalogItemTypeId,
    catalogProductId: orderItem.catalogProductId,
    serialNumber,
    conditionStatus,
    assetStatus: "inStorage" as const,
    currentStorageId: storageId,
  }));

  if (assetValues.length > 0) {
    await db.insert(assets).values(assetValues).run();
  }

  const nextQuantity = orderItem.quantity - quantityReceived;
  if (nextQuantity > 0) {
    await db
      .update(orderItems)
      .set({
        quantity: nextQuantity,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orderItems.id, orderItem.id))
      .run();
  } else {
    await db.delete(orderItems).where(eq(orderItems.id, orderItem.id)).run();
  }

  const { remainingQuantity, remainingTotalCost } = await computeRemainingOrderState(
    db,
    orderId,
  );
  const mergedSerialNumbers = [
    ...parseJsonStringArray(order.serialNumbersJson),
    ...serialNumbers,
  ];
  const nextStatus =
    remainingQuantity === 0 ? "received" : "partiallyReceived";
  const nextReceivedCondition =
    remainingQuantity === 0
      ? order.receivedCondition === "issue" || input.receivedCondition === "issue"
        ? "issue"
        : "complete"
      : null;

  await db
    .update(orders)
    .set({
      status: nextStatus,
      totalCost: remainingTotalCost,
      receivedAt: remainingQuantity === 0 ? receivedAt : null,
      receivedCondition: nextReceivedCondition,
      receivedNote:
        remainingQuantity === 0 ? input.receivedNote?.trim() || null : null,
      storageLocation:
        remainingQuantity === 0
          ? input.storageLocation?.trim() || "Main warehouse / Intake"
          : null,
      serialNumbersJson: JSON.stringify(mergedSerialNumbers),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, orderId))
    .run();

  const nextOrder = await getOrderById(db, input.orderId);
  if (!nextOrder) {
    throw new Error("Failed to load order after receive intake.");
  }

  return {
    receive: mapReceive(receive),
    order: nextOrder,
    assets: await mapReceivedAssetsByReceiveItemId(db, receiveItem.id),
  };
}

export async function updateReceive(
  db: AppDb,
  id: string,
  input: UpdateReceiveInput,
  currentUserId?: string | null,
): Promise<ReceiveRecord | null> {
  const numericId = parseIntegerId("Receive id", id);
  const updates: Partial<typeof receives.$inferInsert> = {};

  if (input.orderId !== undefined && input.orderId !== null) {
    updates.orderId = await resolveOrderId(db, input.orderId, currentUserId);
  }

  if (input.receivedByUserId !== undefined && input.receivedByUserId !== null) {
    updates.receivedByUserId = await resolveUserId(
      db,
      input.receivedByUserId,
      currentUserId,
    );
  }

  if (input.officeId !== undefined && input.officeId !== null) {
    updates.officeId = await resolveOfficeId(db, input.officeId);
  }

  if (input.status !== undefined && input.status !== null) {
    updates.status = parseReceiveStatus(input.status);
  }

  if (input.receivedAt !== undefined && input.receivedAt !== null) {
    updates.receivedAt = input.receivedAt;
  }

  if (input.note !== undefined) {
    updates.note = input.note ?? null;
  }

  if (Object.keys(updates).length === 0) {
    return getReceiveById(db, id);
  }

  const [row] = await db
    .update(receives)
    .set(updates)
    .where(eq(receives.id, numericId))
    .returning(receiveSelection);

  return row ? mapReceive(row) : null;
}

export async function deleteReceive(db: AppDb, id: string): Promise<boolean> {
  const numericId = parseIntegerId("Receive id", id);

  const rows = await db
    .delete(receives)
    .where(eq(receives.id, numericId))
    .returning({ id: receives.id });

  return rows.length > 0;
}
