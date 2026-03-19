import { and, desc, eq, inArray, lt } from "drizzle-orm";
import {
  assets,
  censusSessions,
  censusTasks,
  departments,
  orders,
  receiveItems,
  receives,
  users,
} from "../../database/schema.ts";
import type { RuntimeConfig } from "../context.ts";
import type { AppDb } from "../db.ts";

export type CensusSessionRecord = {
  id: string;
  title: string;
  scopeType: string;
  scopeValue: string | null;
  createdByUserId: string;
  createdByName: string;
  status: string;
  dueAt: string;
  completedAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CensusTaskRecord = {
  id: string;
  censusSessionId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: string;
  itemType: string;
  qrCode: string;
  serialNumber: string | null;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentName: string | null;
  baselineConditionStatus: string;
  baselineAssetStatus: string;
  baselineLocation: string | null;
  reportedConditionStatus: string | null;
  status: string;
  verificationChannel: string | null;
  verifiedAt: string | null;
  verifiedByUserId: string | null;
  verifiedByName: string | null;
  note: string | null;
  discrepancyReason: string | null;
  portalExpiresAt: string | null;
  portalEmailStatus: string;
  portalEmailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SessionRow = typeof censusSessions.$inferSelect & { createdByName: string | null };
type TaskRow = typeof censusTasks.$inferSelect & {
  assetCode: string;
  assetName: string;
  category: string;
  itemType: string;
  qrCode: string;
  serialNumber: string | null;
  employeeName: string;
  employeeEmail: string;
  departmentName: string | null;
};

export function mapCensusSession(row: SessionRow): CensusSessionRecord {
  return {
    id: String(row.id),
    title: row.title,
    scopeType: row.scopeType,
    scopeValue: row.scopeValue,
    createdByUserId: String(row.createdByUserId),
    createdByName: row.createdByName ?? "System",
    status: row.status,
    dueAt: row.dueAt,
    completedAt: row.completedAt,
    note: row.note,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapCensusTask(row: TaskRow): CensusTaskRecord {
  return {
    id: String(row.id),
    censusSessionId: String(row.censusSessionId),
    assetId: String(row.assetId),
    assetCode: row.assetCode,
    assetName: row.assetName,
    category: row.category,
    itemType: row.itemType,
    qrCode: row.qrCode,
    serialNumber: row.serialNumber,
    employeeId: String(row.employeeId),
    employeeName: row.employeeName,
    employeeEmail: row.employeeEmail,
    departmentName: row.departmentName,
    baselineConditionStatus: row.baselineConditionStatus,
    baselineAssetStatus: row.baselineAssetStatus,
    baselineLocation: row.baselineLocation,
    reportedConditionStatus: row.reportedConditionStatus,
    status: row.status,
    verificationChannel: row.verificationChannel,
    verifiedAt: row.verifiedAt,
    verifiedByUserId: row.verifiedByUserId === null ? null : String(row.verifiedByUserId),
    verifiedByName: row.verifiedByName,
    note: row.note,
    discrepancyReason: row.discrepancyReason,
    portalExpiresAt: row.portalExpiresAt,
    portalEmailStatus: row.portalEmailStatus,
    portalEmailSentAt: row.portalEmailSentAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function markOverdueCensusTasks(db: AppDb) {
  const now = new Date().toISOString();
  const overdueSessions = await db
    .select({ id: censusSessions.id })
    .from(censusSessions)
    .where(and(inArray(censusSessions.status, ["active", "overdue"]), lt(censusSessions.dueAt, now)));

  if (overdueSessions.length === 0) return;

  const sessionIds = overdueSessions.map((row) => row.id);
  await db
    .update(censusTasks)
    .set({
      status: "discrepancy",
      discrepancyReason: "Verification deadline passed.",
      updatedAt: now,
    })
    .where(and(inArray(censusTasks.censusSessionId, sessionIds), eq(censusTasks.status, "pending")))
    .run();

  await db
    .update(censusSessions)
    .set({ status: "overdue", updatedAt: now })
    .where(and(inArray(censusSessions.id, sessionIds), eq(censusSessions.status, "active")))
    .run();
}

export function buildPortalLink(runtimeConfig: RuntimeConfig, token: string) {
  const baseUrl = runtimeConfig.appUrl.replace(/\/$/, "");
  return `${baseUrl}/verify?token=${encodeURIComponent(token)}`;
}

export function buildSessionSelection() {
  return {
    id: censusSessions.id,
    title: censusSessions.title,
    scopeType: censusSessions.scopeType,
    scopeValue: censusSessions.scopeValue,
    createdByUserId: censusSessions.createdByUserId,
    createdByName: users.fullName,
    status: censusSessions.status,
    dueAt: censusSessions.dueAt,
    completedAt: censusSessions.completedAt,
    note: censusSessions.note,
    createdAt: censusSessions.createdAt,
    updatedAt: censusSessions.updatedAt,
  };
}

export function buildTaskSelection() {
  return {
    id: censusTasks.id,
    censusSessionId: censusTasks.censusSessionId,
    assetId: censusTasks.assetId,
    distributionId: censusTasks.distributionId,
    employeeId: censusTasks.employeeId,
    baselineConditionStatus: censusTasks.baselineConditionStatus,
    baselineAssetStatus: censusTasks.baselineAssetStatus,
    baselineLocation: censusTasks.baselineLocation,
    reportedConditionStatus: censusTasks.reportedConditionStatus,
    status: censusTasks.status,
    verificationChannel: censusTasks.verificationChannel,
    verifiedAt: censusTasks.verifiedAt,
    verifiedByUserId: censusTasks.verifiedByUserId,
    verifiedByName: censusTasks.verifiedByName,
    note: censusTasks.note,
    discrepancyReason: censusTasks.discrepancyReason,
    portalJwtId: censusTasks.portalJwtId,
    portalExpiresAt: censusTasks.portalExpiresAt,
    portalConsumedAt: censusTasks.portalConsumedAt,
    portalEmailStatus: censusTasks.portalEmailStatus,
    portalEmailSentAt: censusTasks.portalEmailSentAt,
    createdAt: censusTasks.createdAt,
    updatedAt: censusTasks.updatedAt,
    assetCode: assets.assetCode,
    assetName: assets.assetName,
    category: assets.category,
    itemType: assets.itemType,
    qrCode: assets.qrCode,
    serialNumber: assets.serialNumber,
    employeeName: users.fullName,
    employeeEmail: users.email,
    departmentName: departments.departmentName,
  };
}

export async function listCensusSessions(db: AppDb, includeCompleted = true) {
  await markOverdueCensusTasks(db);
  const rows = await db
    .select(buildSessionSelection())
    .from(censusSessions)
    .innerJoin(users, eq(censusSessions.createdByUserId, users.id))
    .where(includeCompleted ? undefined : inArray(censusSessions.status, ["active", "overdue"]))
    .orderBy(desc(censusSessions.createdAt), desc(censusSessions.id));

  return rows.map((row) => mapCensusSession(row as SessionRow));
}

export async function listCensusTasks(db: AppDb, sessionId: number) {
  await markOverdueCensusTasks(db);
  const rows = await db
    .select(buildTaskSelection())
    .from(censusTasks)
    .innerJoin(assets, eq(censusTasks.assetId, assets.id))
    .innerJoin(users, eq(censusTasks.employeeId, users.id))
    .leftJoin(receiveItems, eq(assets.receiveItemId, receiveItems.id))
    .leftJoin(receives, eq(receiveItems.receiveId, receives.id))
    .leftJoin(orders, eq(receives.orderId, orders.id))
    .leftJoin(departments, eq(orders.departmentId, departments.id))
    .where(eq(censusTasks.censusSessionId, sessionId))
    .orderBy(desc(censusTasks.createdAt), desc(censusTasks.id));

  return rows.map((row) => mapCensusTask(row as TaskRow));
}
