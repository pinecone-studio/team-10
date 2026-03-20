import { and, asc, eq } from "drizzle-orm";
import {
  departments,
  offices,
  orders,
  users,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import type { D1DatabaseLike } from "./d1.ts";

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

const referenceCompatibilityTableStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    position TEXT NOT NULL DEFAULT 'staff',
    department_id INTEGER,
    password_hash TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS offices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    office_name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS storage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storage_name TEXT NOT NULL UNIQUE,
    storage_type TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS receives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    received_by_user_id INTEGER NOT NULL,
    office_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (received_by_user_id) REFERENCES users(id),
    FOREIGN KEY (office_id) REFERENCES offices(id)
  )`,
  `CREATE TABLE IF NOT EXISTS receive_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receive_id INTEGER NOT NULL,
    order_item_id INTEGER NOT NULL,
    quantity_received INTEGER NOT NULL DEFAULT 1,
    condition_status TEXT NOT NULL DEFAULT 'good',
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receive_id) REFERENCES receives(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id)
  )`,
  `CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receive_item_id INTEGER NOT NULL,
    asset_code TEXT NOT NULL UNIQUE,
    qr_code TEXT NOT NULL UNIQUE,
    asset_name TEXT NOT NULL,
    category TEXT NOT NULL,
    item_type TEXT NOT NULL,
    catalog_item_type_id INTEGER,
    catalog_product_id INTEGER,
    serial_number TEXT,
    asset_image_object_key TEXT,
    asset_image_file_name TEXT,
    asset_image_content_type TEXT,
    condition_status TEXT NOT NULL,
    asset_status TEXT NOT NULL,
    current_storage_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receive_item_id) REFERENCES receive_items(id) ON DELETE CASCADE,
    FOREIGN KEY (catalog_item_type_id) REFERENCES catalog_item_types(id) ON DELETE SET NULL,
    FOREIGN KEY (catalog_product_id) REFERENCES catalog_products(id) ON DELETE SET NULL,
    FOREIGN KEY (current_storage_id) REFERENCES storage(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS asset_assignment_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    employee_scanned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by_user_id INTEGER,
    reviewed_at TEXT,
    review_note TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS asset_distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_request_id INTEGER UNIQUE,
    asset_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    distributed_by_user_id INTEGER NOT NULL,
    distributed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    recipient_role TEXT,
    status TEXT NOT NULL DEFAULT 'pendingHandover',
    returned_at TEXT,
    usage_years TEXT,
    return_condition TEXT,
    return_power TEXT,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_request_id) REFERENCES asset_assignment_requests(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (distributed_by_user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS asset_assignment_acknowledgments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_request_id INTEGER NOT NULL UNIQUE,
    asset_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_role TEXT,
    jwt_id TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    token_consumed_at TEXT,
    email_status TEXT NOT NULL DEFAULT 'pending',
    email_sent_at TEXT,
    signer_name TEXT,
    signer_ip_address TEXT,
    signature_text TEXT,
    signed_at TEXT,
    pdf_object_key TEXT,
    pdf_file_name TEXT,
    pdf_uploaded_at TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_request_id) REFERENCES asset_assignment_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
] as const;

const referenceCompatibilityColumns = [
  {
    table: "storage",
    name: "storage_type",
    definition: `"storage_type" text NOT NULL DEFAULT 'warehouse'`,
  },
  {
    table: "receives",
    name: "office_id",
    definition: `"office_id" integer NOT NULL DEFAULT 1`,
  },
  {
    table: "receives",
    name: "status",
    definition: `"status" text NOT NULL DEFAULT 'pending'`,
  },
  {
    table: "receives",
    name: "received_at",
    definition: `"received_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  },
  {
    table: "receives",
    name: "note",
    definition: `"note" text`,
  },
  {
    table: "receives",
    name: "created_at",
    definition: `"created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  },
  {
    table: "receives",
    name: "updated_at",
    definition: `"updated_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  },
  {
    table: "receive_items",
    name: "quantity_received",
    definition: `"quantity_received" integer NOT NULL DEFAULT 1`,
  },
  {
    table: "receive_items",
    name: "condition_status",
    definition: `"condition_status" text NOT NULL DEFAULT 'good'`,
  },
  {
    table: "receive_items",
    name: "note",
    definition: `"note" text`,
  },
  {
    table: "receive_items",
    name: "created_at",
    definition: `"created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  },
  {
    table: "receive_items",
    name: "updated_at",
    definition: `"updated_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  },
  {
    table: "storage",
    name: "description",
    definition: `"description" text`,
  },
  {
    table: "storage",
    name: "created_at",
    definition: `"created_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  },
  {
    table: "storage",
    name: "updated_at",
    definition: `"updated_at" text NOT NULL DEFAULT CURRENT_TIMESTAMP`,
  },
] as const;

let referenceSchemaCompatibilityReady = false;

function isD1DatabaseLike(value: unknown): value is D1DatabaseLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "prepare" in value &&
    typeof (value as { prepare?: unknown }).prepare === "function" &&
    "batch" in value &&
    typeof (value as { batch?: unknown }).batch === "function"
  );
}

function getRawD1Client(db: AppDb): D1DatabaseLike | null {
  const client = (db as unknown as { $client?: unknown }).$client;
  return isD1DatabaseLike(client) ? client : null;
}

async function readTableColumns(db: AppDb, table: string) {
  const client = getRawD1Client(db);
  if (!client) return new Set<string>();
  const result = await client.prepare(`PRAGMA table_info("${table}")`).all<{
    name?: string;
  }>();
  return new Set(
    result.results
      .map((row) => row.name?.toLowerCase().trim())
      .filter((name): name is string => Boolean(name)),
  );
}

async function ensureReferenceSchemaCompatibility(db: AppDb) {
  if (referenceSchemaCompatibilityReady) {
    return;
  }

  const client = getRawD1Client(db);
  if (!client) {
    return;
  }

  for (const statement of referenceCompatibilityTableStatements) {
    await client.prepare(statement).run();
  }

  const tableColumns = new Map<string, Set<string>>();
  for (const column of referenceCompatibilityColumns) {
    const existing =
      tableColumns.get(column.table) ?? (await readTableColumns(db, column.table));
    tableColumns.set(column.table, existing);
    if (existing.has(column.name.toLowerCase())) {
      continue;
    }

    await client
      .prepare(`ALTER TABLE "${column.table}" ADD COLUMN ${column.definition}`)
      .run();
    existing.add(column.name.toLowerCase());
  }

  referenceSchemaCompatibilityReady = true;
}

function isReferenceSchemaError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("no such table") ||
    message.includes("no such column") ||
    message.includes("has no column named")
  );
}

export async function withReferenceSchemaCompatibility<T>(
  db: AppDb,
  label: string,
  action: () => Promise<T>,
) {
  try {
    await ensureReferenceSchemaCompatibility(db);
    return await action();
  } catch (error) {
    if (!isReferenceSchemaError(error)) {
      throw error;
    }

    console.warn(`${label} schema compatibility retry triggered.`, error);
    referenceSchemaCompatibilityReady = false;
    await ensureReferenceSchemaCompatibility(db);
    return action();
  }
}

function tryParseIntegerId(value?: string | null) {
  if (!value) return null;
  const numericValue = Number(value);
  return Number.isInteger(numericValue) ? numericValue : null;
}

function buildDemoEmail(seed: string) {
  const normalizedSeed = seed
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `demo-user-${normalizedSeed || "1"}@example.local`;
}

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
  return withReferenceSchemaCompatibility(db, "resolveUserId", async () => {
    try {
      if (providedUserId) {
        const requestedUserId = tryParseIntegerId(providedUserId);
        if (requestedUserId !== null) {
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
              email: buildDemoEmail(String(requestedUserId)),
              fullName: `Demo User ${requestedUserId}`,
              role: "employee",
              position: "staff",
              passwordHash: "demo-password",
              isActive: true,
            })
            .run();

          return requestedUserId;
        }
      }

      if (currentUserId) {
        const requestedUserId = tryParseIntegerId(currentUserId);
        if (requestedUserId !== null) {
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
              email: buildDemoEmail(String(requestedUserId)),
              fullName: `Demo User ${requestedUserId}`,
              role: "employee",
              position: "staff",
              passwordHash: "demo-password",
              isActive: true,
            })
            .run();

          return requestedUserId;
        }
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

      const demoEmail = buildDemoEmail("1");

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
      const fallbackUserId = tryParseIntegerId(providedUserId ?? currentUserId ?? "1");
      if (fallbackUserId !== null) {
        console.warn("resolveUserId fallback triggered.", error);
        return fallbackUserId;
      }

      throw error;
    }
  });
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
