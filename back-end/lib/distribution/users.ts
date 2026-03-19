import { eq } from "drizzle-orm";
import { storage, users } from "../../database/schema.ts";
import type { AppDb } from "../db.ts";

function buildDemoEmail(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug || "distribution-user"}@example.local`;
}

export async function resolveEmployeeByName(db: AppDb, employeeName: string) {
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.fullName, employeeName))
    .limit(1);

  if (existingUser) {
    return existingUser.id;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      email: buildDemoEmail(employeeName),
      fullName: employeeName,
      role: "employee",
      position: "staff",
      passwordHash: "demo-password",
      isActive: true,
    })
    .returning({ id: users.id });

  return createdUser.id;
}

export async function resolveStorageId(db: AppDb, storageName?: string | null) {
  const normalizedStorageName = storageName?.trim() || "Main warehouse / Intake";
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
}
