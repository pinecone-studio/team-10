import { eq } from "drizzle-orm";
import { users, roleValues, positionValues } from "../database/schema.ts";
import type { AppDb } from "./db.ts";

type UserRole = (typeof roleValues)[number];
type UserPosition = (typeof positionValues)[number];

type SystemUserConfig = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  position: UserPosition;
};

const systemUsers = {
  inventoryHead: {
    id: 8301,
    fullName: "Inventory Head",
    email: "inventory-head@example.local",
    role: "inventoryHead",
    position: "manager",
  },
  finance: {
    id: 8401,
    fullName: "Finance Reviewer",
    email: "finance@example.local",
    role: "finance",
    position: "cfo",
  },
} satisfies Record<string, SystemUserConfig>;

async function ensureUser(db: AppDb, config: SystemUserConfig) {
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, config.id))
    .limit(1);

  if (existingUser) return existingUser.id;

  await db
    .insert(users)
    .values({
      id: config.id,
      email: config.email,
      fullName: config.fullName,
      role: config.role,
      position: config.position,
      passwordHash: "system-user",
      isActive: true,
    })
    .run();

  return config.id;
}

export async function ensureFinanceUser(db: AppDb) {
  return ensureUser(db, systemUsers.finance);
}

export async function ensureInventoryHeadUser(db: AppDb) {
  return ensureUser(db, systemUsers.inventoryHead);
}
