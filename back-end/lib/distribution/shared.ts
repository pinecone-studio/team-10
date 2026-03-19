import { eq } from "drizzle-orm";
import {
  assetDistributions,
  assets,
  notifications,
  storage,
  users,
} from "../../database/schema.ts";
import type { AppDb } from "../db.ts";

export type DistributionRow = {
  id: number;
  assignmentRequestId: number | null;
  assetId: number;
  assetCode: string;
  assetName: string;
  category: string;
  itemType: string;
  serialNumber: string | null;
  conditionStatus: string;
  assetStatus: string;
  currentStorageId: number | null;
  currentStorageName: string | null;
  employeeId: number;
  employeeName: string;
  recipientRole: string | null;
  distributedByUserId: number;
  distributedAt: string;
  status: string;
  returnedAt: string | null;
  usageYears: string | null;
  returnCondition: string | null;
  returnPower: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DistributionRecord = {
  id: string;
  assignmentRequestId: string | null;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: string;
  itemType: string;
  serialNumber: string | null;
  conditionStatus: string;
  assetStatus: string;
  currentStorageId: string | null;
  currentStorageName: string | null;
  employeeId: string;
  employeeName: string;
  recipientRole: string;
  distributedByUserId: string;
  distributedAt: string;
  status: string;
  returnedAt: string | null;
  usageYears: string | null;
  returnCondition: string | null;
  returnPower: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export const distributionSelection = {
  id: assetDistributions.id,
  assignmentRequestId: assetDistributions.assignmentRequestId,
  assetId: assetDistributions.assetId,
  assetCode: assets.assetCode,
  assetName: assets.assetName,
  category: assets.category,
  itemType: assets.itemType,
  serialNumber: assets.serialNumber,
  conditionStatus: assets.conditionStatus,
  assetStatus: assets.assetStatus,
  currentStorageId: assets.currentStorageId,
  currentStorageName: storage.storageName,
  employeeId: assetDistributions.employeeId,
  employeeName: users.fullName,
  recipientRole: assetDistributions.recipientRole,
  distributedByUserId: assetDistributions.distributedByUserId,
  distributedAt: assetDistributions.distributedAt,
  status: assetDistributions.status,
  returnedAt: assetDistributions.returnedAt,
  usageYears: assetDistributions.usageYears,
  returnCondition: assetDistributions.returnCondition,
  returnPower: assetDistributions.returnPower,
  note: assetDistributions.note,
  createdAt: assetDistributions.createdAt,
  updatedAt: assetDistributions.updatedAt,
};

export function mapDistribution(row: DistributionRow): DistributionRecord {
  return {
    id: String(row.id),
    assignmentRequestId:
      row.assignmentRequestId === null ? null : String(row.assignmentRequestId),
    assetId: String(row.assetId),
    assetCode: row.assetCode,
    assetName: row.assetName,
    category: row.category,
    itemType: row.itemType,
    serialNumber: row.serialNumber,
    conditionStatus: row.conditionStatus,
    assetStatus: row.assetStatus,
    currentStorageId: row.currentStorageId === null ? null : String(row.currentStorageId),
    currentStorageName: row.currentStorageName,
    employeeId: String(row.employeeId),
    employeeName: row.employeeName,
    recipientRole: row.recipientRole ?? "Employee",
    distributedByUserId: String(row.distributedByUserId),
    distributedAt: row.distributedAt,
    status: row.status,
    returnedAt: row.returnedAt,
    usageYears: row.usageYears,
    returnCondition: row.returnCondition,
    returnPower: row.returnPower,
    note: row.note,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function sanitizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function getDistributionById(db: AppDb, id: number) {
  const [row] = await db
    .select(distributionSelection)
    .from(assetDistributions)
    .innerJoin(assets, eq(assetDistributions.assetId, assets.id))
    .innerJoin(users, eq(assetDistributions.employeeId, users.id))
    .leftJoin(storage, eq(assets.currentStorageId, storage.id))
    .where(eq(assetDistributions.id, id))
    .limit(1);

  return row ? mapDistribution(row as DistributionRow) : null;
}

export async function createDistributionNotification(
  db: AppDb,
  userId: number,
  title: string,
  message: string,
  entityId: string,
) {
  await db.insert(notifications).values({
    userId,
    type: "distributionUpdate",
    title,
    message,
    entityType: "distribution",
    entityId,
    isRead: false,
  }).run();
}
