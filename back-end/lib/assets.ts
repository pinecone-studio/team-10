import { and, asc, eq, inArray, or, sql } from "drizzle-orm";
import {
  assetAssignmentAcknowledgments,
  assetAssignmentRequests,
  assetDistributions,
  assets,
  assetStatusValues,
  conditionStatusValues,
  departments,
  orderItems,
  orders,
  receiveItems,
  receives,
  storage,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import { parseIntegerId } from "./reference-resolvers.ts";
import { loadAssetImageDataUrlFromR2 } from "./asset-images.ts";
import type { RuntimeConfig } from "./context.ts";

type StorageAssetRow = {
  id: number;
  assetCode: string;
  qrCode: string;
  assetName: string;
  category: string;
  itemType: string;
  serialNumber: string | null;
  assetImageObjectKey: string | null;
  assetImageContentType: string | null;
  conditionStatus: string;
  assetStatus: string;
  assignedEmployeeName: string | null;
  latestDistributionStatus: string | null;
  storageId: number | null;
  storageName: string | null;
  storageType: string | null;
  receivedAt: string | null;
  receiveNote: string | null;
  orderId: number | null;
  requestNumber: string | null;
  requestDate: string | null;
  requesterName: string | null;
  departmentName: string | null;
  unitCost: number | null;
  currencyCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StorageAssetRecord = {
  id: string;
  assetCode: string;
  qrCode: string;
  assetName: string;
  category: string;
  itemType: string;
  serialNumber: string | null;
  assetImageDataUrl: string | null;
  conditionStatus: string;
  assetStatus: string;
  assignedEmployeeName: string | null;
  storageId: string | null;
  storageName: string;
  storageType: string | null;
  receivedAt: string;
  receiveNote: string | null;
  orderId: string;
  requestNumber: string;
  requestDate: string;
  requester: string;
  department: string;
  unitCost: number | null;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
};

const storageAssetSelection = {
  id: assets.id,
  assetCode: assets.assetCode,
  qrCode: assets.qrCode,
  assetName: assets.assetName,
  category: assets.category,
  itemType: assets.itemType,
  serialNumber: assets.serialNumber,
  assetImageObjectKey: assets.assetImageObjectKey,
  assetImageContentType: assets.assetImageContentType,
  conditionStatus: assets.conditionStatus,
  assetStatus: assets.assetStatus,
  assignedEmployeeName: sql<string | null>`(
    SELECT u.full_name
    FROM asset_distributions d
    INNER JOIN users u ON u.id = d.employee_id
    WHERE d.asset_id = ${assets.id}
      AND d.status IN ('active', 'pendingHandover')
    ORDER BY d.id DESC
    LIMIT 1
  )`.as("assignedEmployeeName"),
  latestDistributionStatus: sql<string | null>`(
    SELECT d.status
    FROM asset_distributions d
    WHERE d.asset_id = ${assets.id}
      AND d.status IN ('active', 'pendingHandover')
    ORDER BY d.id DESC
    LIMIT 1
  )`.as("latestDistributionStatus"),
  storageId: sql<number | null>`${storage.id}`.as("storageId"),
  storageName: sql<string | null>`${storage.storageName}`.as("storageName"),
  storageType: sql<string | null>`${storage.storageType}`.as("storageType"),
  receivedAt: sql<string | null>`${receives.receivedAt}`.as("receivedAt"),
  receiveNote: sql<string | null>`${receiveItems.note}`.as("receiveNote"),
  orderId: sql<number | null>`${orders.id}`.as("orderId"),
  requestNumber: sql<string | null>`${orders.requestNumber}`.as("requestNumber"),
  requestDate: sql<string | null>`${orders.requestDate}`.as("requestDate"),
  requesterName: sql<string | null>`${orders.requesterName}`.as("requesterName"),
  departmentName: sql<string | null>`${departments.departmentName}`.as("departmentName"),
  unitCost: sql<number | null>`${orderItems.unitCost}`.as("unitCost"),
  currencyCode: sql<string | null>`${orderItems.currencyCode}`.as("currencyCode"),
  createdAt: sql<string>`${assets.createdAt}`.as("createdAt"),
  updatedAt: sql<string>`${assets.updatedAt}`.as("updatedAt"),
};

function getStorageNameFallback(row: StorageAssetRow) {
  if (row.storageName) {
    return row.storageName;
  }

  return "Unknown location";
}

async function mapStorageAsset(
  row: StorageAssetRow,
  runtimeConfig?: RuntimeConfig,
): Promise<StorageAssetRecord> {
  const fallbackReceivedAt = row.receivedAt ?? row.createdAt;
  const fallbackRequestDate = row.requestDate ?? fallbackReceivedAt.slice(0, 10);
  const fallbackRequestNumber = `REQ-${fallbackRequestDate.replaceAll("-", "")}-${String(
    row.orderId ?? row.id,
  ).padStart(3, "0")}`;
  const normalizedAssetStatus =
    row.assetStatus === "pendingAssignment" &&
    row.latestDistributionStatus === "active"
      ? "assigned"
      : row.assetStatus;
  let assetImageDataUrl: string | null = null;

  if (runtimeConfig && row.assetImageObjectKey) {
    try {
      assetImageDataUrl = await loadAssetImageDataUrlFromR2(
        runtimeConfig,
        row.assetImageObjectKey,
        row.assetImageContentType,
      );
    } catch (error) {
      console.warn("Asset image load fallback triggered.", error);
    }
  }

  return {
    id: String(row.id),
    assetCode: row.assetCode,
    qrCode: row.qrCode,
    assetName: row.assetName,
    category: row.category,
    itemType: row.itemType,
    serialNumber: row.serialNumber,
    assetImageDataUrl,
    conditionStatus: row.conditionStatus,
    assetStatus: normalizedAssetStatus,
    assignedEmployeeName: row.assignedEmployeeName,
    storageId: row.storageId === null ? null : String(row.storageId),
    storageName: getStorageNameFallback(row),
    storageType: row.storageType,
    receivedAt: fallbackReceivedAt,
    receiveNote: row.receiveNote,
    orderId: String(row.orderId ?? row.id),
    requestNumber: row.requestNumber ?? fallbackRequestNumber,
    requestDate: fallbackRequestDate,
    requester: row.requesterName ?? "",
    department: row.departmentName ?? "IT Office",
    unitCost: row.unitCost,
    currencyCode: row.currencyCode ?? "MNT",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function buildStorageAssetsBaseQuery(db: AppDb) {
  return db
    .select(storageAssetSelection)
    .from(assets)
    .leftJoin(receiveItems, eq(assets.receiveItemId, receiveItems.id))
    .leftJoin(receives, eq(receiveItems.receiveId, receives.id))
    .leftJoin(orders, eq(receives.orderId, orders.id))
    .leftJoin(departments, eq(orders.departmentId, departments.id))
    .leftJoin(storage, eq(assets.currentStorageId, storage.id))
    .leftJoin(orderItems, eq(receiveItems.orderItemId, orderItems.id));
}

export async function listStorageAssets(
  db: AppDb,
  runtimeConfig?: RuntimeConfig,
): Promise<StorageAssetRecord[]> {
  try {
    const rows = await buildStorageAssetsBaseQuery(db)
      .orderBy(asc(storage.storageName), asc(assets.assetName), asc(assets.id));

    return Promise.all(rows.map((row) => mapStorageAsset(row, runtimeConfig)));
  } catch (error) {
    console.warn("listStorageAssets fallback triggered.", error);
    return [];
  }
}

export async function listStorageLocationNames(db: AppDb): Promise<string[]> {
  try {
    const rows = await db
      .select({
        storageName: storage.storageName,
      })
      .from(storage)
      .orderBy(asc(storage.storageName), asc(storage.id));

    return rows
      .map((row) => row.storageName.trim())
      .filter((storageName) => storageName.length > 0);
  } catch (error) {
    console.warn("listStorageLocationNames fallback triggered.", error);
    return [];
  }
}

export async function getStorageAssetDetail(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: { id?: string | null; qrCode?: string | null },
): Promise<StorageAssetRecord | null> {
  try {
    const normalizedQrCode = input.qrCode?.trim() || null;
    const normalizedId = input.id?.trim() || null;

    if (!normalizedId && !normalizedQrCode) {
      throw new Error("Either asset id or qrCode is required.");
    }

    const filters = [];
    if (normalizedId) {
      if (/^\d+$/.test(normalizedId)) {
        filters.push(eq(assets.id, parseIntegerId("Asset id", normalizedId)));
      } else {
        filters.push(eq(assets.assetCode, normalizedId));
      }
    }
    if (normalizedQrCode) {
      filters.push(eq(assets.qrCode, normalizedQrCode));
    }

    const [row] = await buildStorageAssetsBaseQuery(db)
      .where(or(...filters))
      .limit(1);

    return row ? mapStorageAsset(row, runtimeConfig) : null;
  } catch (error) {
    console.warn("getStorageAssetDetail fallback triggered.", error);
    return null;
  }
}

function parseAssetStatus(value: string) {
  const normalized = value.trim();
  if (!assetStatusValues.includes(normalized as (typeof assetStatusValues)[number])) {
    throw new Error(`Asset status must be one of: ${assetStatusValues.join(", ")}.`);
  }
  return normalized;
}

function parseConditionStatus(value: string) {
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
  return normalized;
}

export async function updateStorageAsset(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: {
    id: string;
    assetStatus?: string | null;
    conditionStatus?: string | null;
  },
): Promise<StorageAssetRecord> {
  try {
    const assetId = parseIntegerId("Asset id", input.id);
    const now = new Date().toISOString();
    const updates: Record<string, string> = {
      updatedAt: now,
    };
    let nextAssetStatus: string | null = null;

    if (input.assetStatus !== undefined && input.assetStatus !== null) {
      nextAssetStatus = parseAssetStatus(input.assetStatus);
      updates.assetStatus = nextAssetStatus;
    }

    if (input.conditionStatus !== undefined && input.conditionStatus !== null) {
      updates.conditionStatus = parseConditionStatus(input.conditionStatus);
    }

    if (Object.keys(updates).length === 1) {
      throw new Error("Provide at least one asset field to update.");
    }

    if (nextAssetStatus && ["available", "inStorage", "received"].includes(nextAssetStatus)) {
      const [pendingDistributionRows, pendingAcknowledgmentRows] = await Promise.all([
        db
          .select({
            assignmentRequestId: assetDistributions.assignmentRequestId,
          })
          .from(assetDistributions)
          .where(
            and(
              eq(assetDistributions.assetId, assetId),
              eq(assetDistributions.status, "pendingHandover"),
            ),
          ),
        db
          .select({
            assignmentRequestId: assetAssignmentAcknowledgments.assignmentRequestId,
          })
          .from(assetAssignmentAcknowledgments)
          .where(
            and(
              eq(assetAssignmentAcknowledgments.assetId, assetId),
              eq(assetAssignmentAcknowledgments.status, "pending"),
            ),
          ),
      ]);

      await Promise.all([
        db
          .update(assetDistributions)
          .set({
            status: "cancelled",
            updatedAt: now,
          })
          .where(
            and(
              eq(assetDistributions.assetId, assetId),
              eq(assetDistributions.status, "pendingHandover"),
            ),
          )
          .run(),
        db
          .update(assetAssignmentAcknowledgments)
          .set({
            status: "void",
            updatedAt: now,
          })
          .where(
            and(
              eq(assetAssignmentAcknowledgments.assetId, assetId),
              eq(assetAssignmentAcknowledgments.status, "pending"),
            ),
          )
          .run(),
      ]);

      const relatedAssignmentRequestIds = [
        ...new Set(
          [...pendingDistributionRows, ...pendingAcknowledgmentRows]
            .map((row) => row.assignmentRequestId)
            .filter((value): value is number => typeof value === "number"),
        ),
      ];

      if (relatedAssignmentRequestIds.length > 0) {
        await db
          .update(assetAssignmentRequests)
          .set({
            status: "cancelled",
            updatedAt: now,
          })
          .where(inArray(assetAssignmentRequests.id, relatedAssignmentRequestIds))
          .run();
      }
    }

    const updatedRows = await db
      .update(assets)
      .set(updates)
      .where(eq(assets.id, assetId))
      .returning({ id: assets.id });

    if (updatedRows.length === 0) {
      throw new Error(`Asset ${input.id} was not found.`);
    }

    const detail = await getStorageAssetDetail(db, runtimeConfig, { id: input.id });
    if (!detail) {
      throw new Error(`Asset ${input.id} could not be reloaded after update.`);
    }

    return detail;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown asset update error.";
    throw new Error(`Failed to update storage asset: ${message}`);
  }
}
