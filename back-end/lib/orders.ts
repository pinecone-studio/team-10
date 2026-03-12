import { asc, eq } from "drizzle-orm";
import {
  approvalQueueValues,
  orders,
  orderStatusValues,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import {
  resolveDepartmentId,
  parseIntegerId,
  resolveOfficeId,
  resolveUserId,
} from "./reference-resolvers.ts";

type OrderStatus = (typeof orderStatusValues)[number];
type ApprovalQueue = (typeof approvalQueueValues)[number];

type OrderRow = {
  id: number;
  userId: number;
  officeId: number;
  departmentId: number | null;
  whyOrdered: string;
  status: OrderStatus;
  approvalTarget: ApprovalQueue;
  expectedArrivalAt: string | null;
  totalCost: number | null;
};

export type OrderRecord = {
  id: string;
  userId: string;
  officeId: string;
  departmentId: string | null;
  whyOrdered: string;
  status: OrderStatus;
  approvalTarget: ApprovalQueue;
  expectedArrivalAt: string | null;
  totalCost: number | null;
};

export type CreateOrderInput = {
  userId?: string | null;
  officeId?: string | null;
  departmentId?: string | null;
  whyOrdered: string;
  status: string;
  approvalTarget?: string | null;
  expectedArrivalAt?: string | null;
  totalCost?: number | null;
};

export type UpdateOrderInput = {
  userId?: string | null;
  officeId?: string | null;
  departmentId?: string | null;
  whyOrdered?: string | null;
  status?: string | null;
  approvalTarget?: string | null;
  expectedArrivalAt?: string | null;
  totalCost?: number | null;
};

const orderSelection = {
  id: orders.id,
  userId: orders.userId,
  officeId: orders.officeId,
  departmentId: orders.departmentId,
  whyOrdered: orders.whyOrdered,
  status: orders.status,
  approvalTarget: orders.approvalTarget,
  expectedArrivalAt: orders.expectedArrivalAt,
  totalCost: orders.totalCost,
};

function mapOrder(row: OrderRow): OrderRecord {
  return {
    id: String(row.id),
    userId: String(row.userId),
    officeId: String(row.officeId),
    departmentId: row.departmentId === null ? null : String(row.departmentId),
    whyOrdered: row.whyOrdered,
    status: row.status,
    approvalTarget: row.approvalTarget,
    expectedArrivalAt: row.expectedArrivalAt,
    totalCost: row.totalCost,
  };
}

function parseOrderStatus(status: string): OrderStatus {
  if (!orderStatusValues.includes(status as OrderStatus)) {
    throw new Error(`Order status must be one of: ${orderStatusValues.join(", ")}.`);
  }

  return status as OrderStatus;
}

function parseApprovalTarget(approvalTarget?: string | null): ApprovalQueue {
  if (!approvalTarget) {
    return "anyHigherUps";
  }

  if (!approvalQueueValues.includes(approvalTarget as ApprovalQueue)) {
    throw new Error(
      `Approval target must be one of: ${approvalQueueValues.join(", ")}.`,
    );
  }

  return approvalTarget as ApprovalQueue;
}

export async function listOrders(db: AppDb): Promise<OrderRecord[]> {
  const rows = await db
    .select(orderSelection)
    .from(orders)
    .orderBy(asc(orders.id));

  return rows.map(mapOrder);
}

export async function getOrderById(
  db: AppDb,
  id: string,
): Promise<OrderRecord | null> {
  const numericId = parseIntegerId("Order id", id);

  const [row] = await db
    .select(orderSelection)
    .from(orders)
    .where(eq(orders.id, numericId))
    .limit(1);

  return row ? mapOrder(row) : null;
}

export async function createOrder(
  db: AppDb,
  input: CreateOrderInput,
  currentUserId?: string | null,
): Promise<OrderRecord> {
  const userId = await resolveUserId(db, input.userId, currentUserId);
  const officeId = await resolveOfficeId(db, input.officeId);
  const departmentId =
    input.departmentId === undefined || input.departmentId === null
      ? null
      : await resolveDepartmentId(db, input.departmentId);

  const [row] = await db
    .insert(orders)
    .values({
      userId,
      officeId,
      departmentId,
      whyOrdered: input.whyOrdered,
      status: parseOrderStatus(input.status),
      approvalTarget: parseApprovalTarget(input.approvalTarget),
      expectedArrivalAt: input.expectedArrivalAt ?? null,
      totalCost: input.totalCost ?? null,
    })
    .returning(orderSelection);

  return mapOrder(row);
}

export async function updateOrder(
  db: AppDb,
  id: string,
  input: UpdateOrderInput,
  currentUserId?: string | null,
): Promise<OrderRecord | null> {
  const numericId = parseIntegerId("Order id", id);
  const updates: Partial<typeof orders.$inferInsert> = {};

  if (input.userId !== undefined && input.userId !== null) {
    updates.userId = await resolveUserId(db, input.userId, currentUserId);
  }

  if (input.officeId !== undefined && input.officeId !== null) {
    updates.officeId = await resolveOfficeId(db, input.officeId);
  }

  if (input.departmentId !== undefined) {
    updates.departmentId =
      input.departmentId === null
        ? null
        : await resolveDepartmentId(db, input.departmentId);
  }

  if (input.whyOrdered !== undefined && input.whyOrdered !== null) {
    updates.whyOrdered = input.whyOrdered;
  }

  if (input.status !== undefined && input.status !== null) {
    updates.status = parseOrderStatus(input.status);
  }

  if (input.approvalTarget !== undefined) {
    updates.approvalTarget = parseApprovalTarget(input.approvalTarget);
  }

  if (input.expectedArrivalAt !== undefined) {
    updates.expectedArrivalAt = input.expectedArrivalAt ?? null;
  }

  if (input.totalCost !== undefined) {
    updates.totalCost = input.totalCost ?? null;
  }

  if (Object.keys(updates).length === 0) {
    return getOrderById(db, id);
  }

  const [row] = await db
    .update(orders)
    .set(updates)
    .where(eq(orders.id, numericId))
    .returning(orderSelection);

  return row ? mapOrder(row) : null;
}

export async function deleteOrder(db: AppDb, id: string): Promise<boolean> {
  const numericId = parseIntegerId("Order id", id);

  const rows = await db
    .delete(orders)
    .where(eq(orders.id, numericId))
    .returning({ id: orders.id });

  return rows.length > 0;
}
