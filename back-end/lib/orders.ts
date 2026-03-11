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
    const requestedUserId = parseIntegerId("userId", providedUserId);
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, requestedUserId))
      .limit(1);

    if (existingUser) {
      return existingUser.id;
    }

    await db
      .insert(users)
      .values({
        id: requestedUserId,
        email: `demo-user-${requestedUserId}@example.local`,
        fullName: `Demo User ${requestedUserId}`,
        role: "employee",
        passwordHash: "demo-password",
        isActive: true,
      })
      .run();

    return requestedUserId;
  }

  if (currentUserId) {
    const requestedUserId = parseIntegerId("currentUserId", currentUserId);
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, requestedUserId))
      .limit(1);

    if (existingUser) {
      return existingUser.id;
    }

    await db
      .insert(users)
      .values({
        id: requestedUserId,
        email: `demo-user-${requestedUserId}@example.local`,
        fullName: `Demo User ${requestedUserId}`,
        role: "employee",
        passwordHash: "demo-password",
        isActive: true,
      })
      .run();

    return requestedUserId;
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

  const demoEmail = "demo-user-1@example.local";

  await db
    .insert(users)
    .values({
      email: demoEmail,
      fullName: "Demo User",
      role: "employee",
      passwordHash: "demo-password",
      isActive: true,
    })
    .run();

  const [createdUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, demoEmail))
    .limit(1);

  if (!createdUser) {
    throw new Error("Failed to create a demo user for createOrder.");
  }

  return createdUser.id;
}

async function resolveOfficeId(db: AppDb, providedOfficeId?: string | null) {
  if (providedOfficeId) {
    const requestedOfficeId = parseIntegerId("officeId", providedOfficeId);
    const [existingOffice] = await db
      .select({ id: offices.id })
      .from(offices)
      .where(eq(offices.id, requestedOfficeId))
      .limit(1);

    if (existingOffice) {
      return existingOffice.id;
    }

    await db
      .insert(offices)
      .values({
        id: requestedOfficeId,
        officeName: `Demo Office ${requestedOfficeId}`,
        location: "Demo Location",
      })
      .run();

    return requestedOfficeId;
  }

  const [office] = await db
    .select({ id: offices.id })
    .from(offices)
    .orderBy(asc(offices.id))
    .limit(1);

  if (office) {
    return office.id;
  }

  const officeName = "Demo Office";

  await db
    .insert(offices)
    .values({
      officeName,
      location: "Demo Location",
    })
    .run();

  const [createdOffice] = await db
    .select({ id: offices.id })
    .from(offices)
    .where(eq(offices.officeName, officeName))
    .limit(1);

  if (!createdOffice) {
    throw new Error("Failed to create a demo office for createOrder.");
  }

  return createdOffice.id;
}

async function resolveOrderProcessId(
  db: AppDb,
  providedOrderProcessId?: string | null,
) {
  if (providedOrderProcessId) {
    const requestedOrderProcessId = parseIntegerId(
      "orderProcessId",
      providedOrderProcessId,
    );
    const [existingOrderProcess] = await db
      .select({ id: orderProcesses.id })
      .from(orderProcesses)
      .where(eq(orderProcesses.id, requestedOrderProcessId))
      .limit(1);

    if (existingOrderProcess) {
      return existingOrderProcess.id;
    }

    await db
      .insert(orderProcesses)
      .values({
        id: requestedOrderProcessId,
        processName: `Demo Process ${requestedOrderProcessId}`,
        description: "Auto-created for order demo",
      })
      .run();

    return requestedOrderProcessId;
  }

  const [orderProcess] = await db
    .select({ id: orderProcesses.id })
    .from(orderProcesses)
    .orderBy(asc(orderProcesses.id))
    .limit(1);

  if (orderProcess) {
    return orderProcess.id;
  }

  const processName = "Demo Order Process";

  await db
    .insert(orderProcesses)
    .values({
      processName,
      description: "Auto-created for order demo",
    })
    .run();

  const [createdOrderProcess] = await db
    .select({ id: orderProcesses.id })
    .from(orderProcesses)
    .where(eq(orderProcesses.processName, processName))
    .limit(1);

  if (!createdOrderProcess) {
    throw new Error("Failed to create a demo order process for createOrder.");
  }

  return createdOrderProcess.id;
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
