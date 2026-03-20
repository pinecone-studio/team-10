import { and, asc, eq } from "drizzle-orm";
import { departments, storage, users } from "../../database/schema.ts";
import type { AppDb } from "../db.ts";
import { withReferenceSchemaCompatibility } from "../reference-resolvers.ts";

export type EmployeeDirectoryRecord = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  position: string;
  departmentId: string | null;
  departmentName: string | null;
  isActive: boolean;
};

function mapEmployeeDirectoryRow(row: {
  id: number;
  fullName: string;
  email: string;
  role: string;
  position: string;
  departmentId: number | null;
  departmentName: string | null;
  isActive: boolean;
}): EmployeeDirectoryRecord {
  return {
    id: String(row.id),
    fullName: row.fullName,
    email: row.email,
    role: row.role,
    position: row.position,
    departmentId: row.departmentId === null ? null : String(row.departmentId),
    departmentName: row.departmentName,
    isActive: row.isActive,
  };
}

export async function listEmployeeDirectory(
  db: AppDb,
  options: { activeOnly?: boolean } = {},
) {
  const activeOnly = options.activeOnly ?? true;
  const filters = [eq(users.role, "employee")];

  if (activeOnly) {
    filters.push(eq(users.isActive, true));
  }

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      position: users.position,
      departmentId: users.departmentId,
      departmentName: departments.departmentName,
      isActive: users.isActive,
    })
    .from(users)
    .leftJoin(departments, eq(users.departmentId, departments.id))
    .where(and(...filters))
    .orderBy(asc(departments.departmentName), asc(users.fullName), asc(users.id));

  return rows.map(mapEmployeeDirectoryRow);
}

export async function resolveEmployeeByName(db: AppDb, employeeName: string) {
  const normalizedName = employeeName.trim();
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.fullName, normalizedName),
        eq(users.role, "employee"),
        eq(users.isActive, true),
      ),
    )
    .limit(1);

  if (existingUser) {
    return existingUser.id;
  }

  throw new Error(
    `Employee '${normalizedName}' was not found in users. Please select a valid employee from directory.`,
  );
}

export async function resolveStorageId(db: AppDb, storageName?: string | null) {
  return withReferenceSchemaCompatibility(
    db,
    "distribution.resolveStorageId",
    async () => {
      const normalizedStorageName =
        storageName?.trim() || "Main warehouse / Intake";
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
          description: "Auto-created during distribution return",
        })
        .returning({ id: storage.id });

      return createdStorage.id;
    },
  );
}
