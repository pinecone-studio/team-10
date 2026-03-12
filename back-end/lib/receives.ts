import { asc, eq } from "drizzle-orm";
import { receiveStatusValues, receives } from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import {
  parseIntegerId,
  resolveOfficeId,
  resolveOrderId,
  resolveUserId,
} from "./reference-resolvers.ts";

type ReceiveStatus = (typeof receiveStatusValues)[number];

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
