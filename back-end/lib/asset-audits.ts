import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  assets,
  auditLogs,
  assetStatusValues,
  conditionStatusValues,
  storage,
  users,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import { parseIntegerId } from "./reference-resolvers.ts";

type ConditionStatus = (typeof conditionStatusValues)[number];
type AssetStatus = (typeof assetStatusValues)[number];

type AssetAuditRow = {
  id: number;
  createdAt: string;
  action: string;
  entityId: string | null;
  payloadJson: string | null;
  actorName: string | null;
};

export type AssetAuditEntryRecord = {
  id: string;
  assetId: string;
  title: string;
  status: string;
  owner: string;
  location: string;
  date: string;
  note: string | null;
};

type CreateAssetAuditInput = {
  assetIds: string[];
  confirmedLocation?: string | null;
  conditionStatus?: string | null;
  assetStatus?: string | null;
  note?: string | null;
};

function parseConditionStatus(value?: string | null) {
  if (!value) return null;
  const normalized = value.trim();
  if (
    !conditionStatusValues.includes(
      normalized as (typeof conditionStatusValues)[number],
    )
  ) {
    throw new Error(
      `Condition status must be one of: ${conditionStatusValues.join(", ")}.`,
    );
  }

  return normalized as ConditionStatus;
}

function parseAssetStatus(value?: string | null) {
  if (!value) return null;
  const normalized = value.trim();
  if (!assetStatusValues.includes(normalized as (typeof assetStatusValues)[number])) {
    throw new Error(`Asset status must be one of: ${assetStatusValues.join(", ")}.`);
  }

  return normalized as AssetStatus;
}

function parseAuditPayload(payloadJson: string | null) {
  if (!payloadJson) return null;

  try {
    return JSON.parse(payloadJson) as {
      note?: string | null;
      confirmedLocation?: string | null;
      conditionStatus?: string | null;
      assetStatus?: string | null;
    };
  } catch {
    return null;
  }
}

function mapAuditRow(row: AssetAuditRow): AssetAuditEntryRecord {
  const payload = parseAuditPayload(row.payloadJson);

  return {
    id: String(row.id),
    assetId: row.entityId ?? "",
    title: "Audit completed",
    status: payload?.conditionStatus ?? "good",
    owner: row.actorName ?? "Storage Team",
    location: payload?.confirmedLocation ?? "Main warehouse / Intake",
    date: row.createdAt,
    note: payload?.note ?? null,
  };
}

async function resolveActorUserId(db: AppDb, currentUserId?: string | null) {
  if (currentUserId?.trim()) {
    return parseIntegerId("currentUserId", currentUserId);
  }

  const [fallbackUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(asc(users.id))
    .limit(1);

  return fallbackUser?.id ?? null;
}

async function resolveStorageId(db: AppDb, storageName?: string | null) {
  const normalizedStorageName = storageName?.trim();
  if (!normalizedStorageName) return null;

  const [row] = await db
    .select({ id: storage.id })
    .from(storage)
    .where(eq(storage.storageName, normalizedStorageName))
    .limit(1);

  return row?.id ?? null;
}

export async function listAssetAuditHistory(
  db: AppDb,
  assetId: string,
): Promise<AssetAuditEntryRecord[]> {
  try {
    const numericAssetId = parseIntegerId("Asset id", assetId);
    const rows = await db
      .select({
        id: auditLogs.id,
        createdAt: auditLogs.createdAt,
        action: auditLogs.action,
        entityId: auditLogs.entityId,
        payloadJson: auditLogs.payloadJson,
        actorName: users.fullName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorUserId, users.id))
      .where(
        and(
          eq(auditLogs.entityType, "asset"),
          eq(auditLogs.entityId, String(numericAssetId)),
          eq(auditLogs.action, "asset_audit_completed"),
        ),
      )
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id));

    return rows.map(mapAuditRow);
  } catch (error) {
    console.warn(`listAssetAuditHistory fallback triggered for ${assetId}.`, error);
    return [];
  }
}

export async function createAssetAudit(
  db: AppDb,
  input: CreateAssetAuditInput,
  currentUserId?: string | null,
): Promise<AssetAuditEntryRecord[]> {
  try {
    const numericAssetIds = input.assetIds.map((assetId) =>
      parseIntegerId("Asset id", assetId),
    );

    if (numericAssetIds.length === 0) {
      throw new Error("Select at least one asset to audit.");
    }

    const actorUserId = await resolveActorUserId(db, currentUserId);
    const now = new Date().toISOString();
    const nextConditionStatus = parseConditionStatus(input.conditionStatus);
    const nextAssetStatus = parseAssetStatus(input.assetStatus);
    const nextStorageId = await resolveStorageId(db, input.confirmedLocation);

    const assetRows = await db
      .select({
        id: assets.id,
        currentStorageId: assets.currentStorageId,
        conditionStatus: assets.conditionStatus,
        assetStatus: assets.assetStatus,
      })
      .from(assets)
      .where(inArray(assets.id, numericAssetIds));

    if (assetRows.length !== numericAssetIds.length) {
      throw new Error("One or more selected assets no longer exist.");
    }

    for (const assetRow of assetRows) {
      const payload = {
        previousConditionStatus: assetRow.conditionStatus,
        previousAssetStatus: assetRow.assetStatus,
        previousStorageId: assetRow.currentStorageId,
        conditionStatus: nextConditionStatus ?? assetRow.conditionStatus,
        assetStatus: nextAssetStatus ?? assetRow.assetStatus,
        confirmedLocation: input.confirmedLocation?.trim() || null,
        note: input.note?.trim() || null,
      };

      await db
        .insert(auditLogs)
        .values({
          actorUserId,
          action: "asset_audit_completed",
          entityType: "asset",
          entityId: String(assetRow.id),
          payloadJson: JSON.stringify(payload),
          createdAt: now,
        })
        .run();

      await db
        .update(assets)
        .set({
          ...(nextConditionStatus ? { conditionStatus: nextConditionStatus } : {}),
          ...(nextAssetStatus ? { assetStatus: nextAssetStatus } : {}),
          ...(nextStorageId !== null ? { currentStorageId: nextStorageId } : {}),
          updatedAt: now,
        })
        .where(eq(assets.id, assetRow.id))
        .run();
    }

    const createdRows = await db
      .select({
        id: auditLogs.id,
        createdAt: auditLogs.createdAt,
        action: auditLogs.action,
        entityId: auditLogs.entityId,
        payloadJson: auditLogs.payloadJson,
        actorName: users.fullName,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorUserId, users.id))
      .where(
        and(
          eq(auditLogs.action, "asset_audit_completed"),
          inArray(
            auditLogs.entityId,
            numericAssetIds.map((id) => String(id)),
          ),
          eq(auditLogs.createdAt, now),
        ),
      )
      .orderBy(desc(auditLogs.id));

    return createdRows.map(mapAuditRow);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create asset audit.",
    );
  }
}
