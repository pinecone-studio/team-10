import { and, asc, eq } from "drizzle-orm";
import {
  departments,
  offices,
  orders,
  users,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";

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
  try {
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
          position: "staff",
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
          position: "staff",
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
        position: "staff",
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
  } catch (error) {
    const fallbackUserId = providedUserId ?? currentUserId ?? "1";
    console.warn("resolveUserId fallback triggered.", error);
    return parseIntegerId("fallbackUserId", fallbackUserId);
  }
}

export async function resolveOfficeId(db: AppDb, providedOfficeId?: string | null) {
  try {
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
  } catch (error) {
    console.warn("resolveOfficeId fallback triggered.", error);
    return parseIntegerId("fallbackOfficeId", providedOfficeId ?? "1");
  }
}

export async function resolveDepartmentId(
  db: AppDb,
  providedDepartmentId?: string | null,
) {
  if (providedDepartmentId) {
    const requestedDepartmentId = parseIntegerId(
      "departmentId",
      providedDepartmentId,
    );
    const [existingDepartment] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.id, requestedDepartmentId))
      .limit(1);

    if (existingDepartment) {
      return existingDepartment.id;
    }

    await db
      .insert(departments)
      .values({
        id: requestedDepartmentId,
        departmentName: `Demo Department ${requestedDepartmentId}`,
        description: "Auto-created for GraphQL demo",
      })
      .run();

    return requestedDepartmentId;
  }

  const [department] = await db
    .select({ id: departments.id })
    .from(departments)
    .orderBy(asc(departments.id))
    .limit(1);

  if (department) {
    return department.id;
  }

  const departmentName = "Demo Department";

  await db
    .insert(departments)
    .values({
      departmentName,
      description: "Auto-created for GraphQL demo",
    })
    .run();

  const [createdDepartment] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(eq(departments.departmentName, departmentName))
    .limit(1);

  if (!createdDepartment) {
    throw new Error("Failed to create a demo department.");
  }

  return createdDepartment.id;
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

  const [createdOrder] = await db
    .insert(orders)
    .values({
      orderName: "Demo receive order",
      userId,
      officeId,
      departmentId: null,
      whyOrdered: "Auto-created for receive demo",
      status: "ordered",
      approvalTarget: "finance",
      expectedArrivalAt: null,
      totalCost: null,
    })
    .returning(orderSelection);

  if (!createdOrder) {
    throw new Error("Failed to create a demo order.");
  }

  return createdOrder.id;
}
