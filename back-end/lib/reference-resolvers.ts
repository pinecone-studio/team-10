import { and, asc, eq } from "drizzle-orm";
import {
  offices,
  orderProcesses,
  orders,
  users,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";

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

export function parseIntegerId(name: string, value: string) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue)) {
    throw new Error(`${name} must be an integer.`);
  }

  return numericValue;
}

export async function resolveUserId(
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
    throw new Error("Failed to create a demo user.");
  }

  return createdUser.id;
}

export async function resolveOfficeId(db: AppDb, providedOfficeId?: string | null) {
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
    throw new Error("Failed to create a demo office.");
  }

  return createdOffice.id;
}

export async function resolveOrderProcessId(
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
        description: "Auto-created for GraphQL demo",
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
      description: "Auto-created for GraphQL demo",
    })
    .run();

  const [createdOrderProcess] = await db
    .select({ id: orderProcesses.id })
    .from(orderProcesses)
    .where(eq(orderProcesses.processName, processName))
    .limit(1);

  if (!createdOrderProcess) {
    throw new Error("Failed to create a demo order process.");
  }

  return createdOrderProcess.id;
}

export async function resolveOrderId(
  db: AppDb,
  providedOrderId?: string | null,
  currentUserId?: string | null,
) {
  if (providedOrderId) {
    const requestedOrderId = parseIntegerId("orderId", providedOrderId);
    const [existingOrder] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.id, requestedOrderId))
      .limit(1);

    if (existingOrder) {
      return existingOrder.id;
    }

    throw new Error(`Order ${providedOrderId} does not exist.`);
  }

  const [existingOrder] = await db
    .select({ id: orders.id })
    .from(orders)
    .orderBy(asc(orders.id))
    .limit(1);

  if (existingOrder) {
    return existingOrder.id;
  }

  const userId = await resolveUserId(db, undefined, currentUserId);
  const officeId = await resolveOfficeId(db);
  const orderProcessId = await resolveOrderProcessId(db);

  const [createdOrder] = await db
    .insert(orders)
    .values({
      userId,
      officeId,
      orderProcessId,
      whyOrdered: "Auto-created for receive demo",
      status: "ordered",
      expectedArrivalAt: null,
      totalCost: null,
    })
    .returning(orderSelection);

  if (!createdOrder) {
    throw new Error("Failed to create a demo order.");
  }

  return createdOrder.id;
}
