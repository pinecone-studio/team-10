import { and, asc, eq } from "drizzle-orm";
import {
  offices,
  orders,
  orderProcesses,
  orderStatusValues,
  users,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";

type OrderStatus = (typeof orderStatusValues)[number];

type OrderRow = {
  id: number;
  userId: number;
  officeId: number;
  orderProcessId: number;
  whyOrdered: string;
  status: OrderStatus;
  expectedArrivalAt: string | null;
  totalCost: number | null;
};

export type OrderRecord = {
  id: string;
  userId: string;
  officeId: string;
  orderProcessId: string;
  whyOrdered: string;
  status: OrderStatus;
  expectedArrivalAt: string | null;
  totalCost: number | null;
};

export type CreateOrderInput = {
  userId?: string | null;
  officeId?: string | null;
  orderProcessId?: string | null;
  whyOrdered: string;
  status: string;
  expectedArrivalAt?: string | null;
  totalCost?: number | null;
};

const orderSelection = {
  id: orders.id,
  userId: orders.userId,
  officeId: orders.officeId,
  orderProcessId: orders.orderProcessId,
  whyOrdered: orders.whyOrdered,
  status: orders.status,
  expectedArrivalAt: orders.expectedArrivalAt,
  totalCost: orders.totalCost,
};

function mapOrder(row: OrderRow): OrderRecord {
  return {
    id: String(row.id),
    userId: String(row.userId),
    officeId: String(row.officeId),
    orderProcessId: String(row.orderProcessId),
    whyOrdered: row.whyOrdered,
    status: row.status,
    expectedArrivalAt: row.expectedArrivalAt,
    totalCost: row.totalCost,
  };
}

function parseIntegerId(name: string, value: string) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue)) {
    throw new Error(`${name} must be an integer.`);
  }

  return numericValue;
}

function parseOrderStatus(status: string): OrderStatus {
  if (!orderStatusValues.includes(status as OrderStatus)) {
    throw new Error(`Order status must be one of: ${orderStatusValues.join(", ")}.`);
  }

  return status as OrderStatus;
}

async function resolveUserId(
  db: AppDb,
  providedUserId?: string | null,
  currentUserId?: string | null,
) {
  if (providedUserId) {
    return parseIntegerId("userId", providedUserId);
  }

  if (currentUserId) {
    return parseIntegerId("currentUserId", currentUserId);
  }

  const [employeeUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.isActive, true), eq(users.role, "employee")))
    .orderBy(asc(users.id))
    .limit(1);

  if (employeeUser) {
    return employeeUser.id;
  }

  const [activeUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(asc(users.id))
    .limit(1);

  if (activeUser) {
    return activeUser.id;
  }

  throw new Error(
    "createOrder requires a userId or at least one active user in the database.",
  );
}

async function resolveOfficeId(db: AppDb, providedOfficeId?: string | null) {
  if (providedOfficeId) {
    return parseIntegerId("officeId", providedOfficeId);
  }

  const [office] = await db
    .select({ id: offices.id })
    .from(offices)
    .orderBy(asc(offices.id))
    .limit(1);

  if (office) {
    return office.id;
  }

  throw new Error(
    "createOrder requires an officeId or at least one office in the database.",
  );
}

async function resolveOrderProcessId(
  db: AppDb,
  providedOrderProcessId?: string | null,
) {
  if (providedOrderProcessId) {
    return parseIntegerId("orderProcessId", providedOrderProcessId);
  }

  const [orderProcess] = await db
    .select({ id: orderProcesses.id })
    .from(orderProcesses)
    .orderBy(asc(orderProcesses.id))
    .limit(1);

  if (orderProcess) {
    return orderProcess.id;
  }

  throw new Error(
    "createOrder requires an orderProcessId or at least one order process in the database.",
  );
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
  const orderProcessId = await resolveOrderProcessId(db, input.orderProcessId);

  const [row] = await db
    .insert(orders)
    .values({
      userId,
      officeId,
      orderProcessId,
      whyOrdered: input.whyOrdered,
      status: parseOrderStatus(input.status),
      expectedArrivalAt: input.expectedArrivalAt ?? null,
      totalCost: input.totalCost ?? null,
    })
    .returning(orderSelection);

  return mapOrder(row);
}

export async function updateOrderStatus(
  db: AppDb,
  id: string,
  status: string,
): Promise<OrderRecord | null> {
  const numericId = parseIntegerId("Order id", id);

  const [row] = await db
    .update(orders)
    .set({
      status: parseOrderStatus(status),
    })
    .where(eq(orders.id, numericId))
    .returning(orderSelection);

  return row ? mapOrder(row) : null;
}
