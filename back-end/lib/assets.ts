import { asc, eq, isNotNull, or } from "drizzle-orm";
import {
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

type StorageAssetRow = {
  id: number;
  assetCode: string;
  qrCode: string;
  assetName: string;
  category: string;
  itemType: string;
  serialNumber: string | null;
  conditionStatus: string;
  assetStatus: string;
  storageId: number | null;
  storageName: string | null;
  storageType: string | null;
  receivedAt: string;
  receiveNote: string | null;
  orderId: number;
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
  conditionStatus: string;
  assetStatus: string;
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
  conditionStatus: assets.conditionStatus,
  assetStatus: assets.assetStatus,
  storageId: storage.id,
  storageName: storage.storageName,
  storageType: storage.storageType,
  receivedAt: receives.receivedAt,
  receiveNote: receiveItems.note,
  orderId: orders.id,
  requestNumber: orders.requestNumber,
  requestDate: orders.requestDate,
  requesterName: orders.requesterName,
  departmentName: departments.departmentName,
  unitCost: orderItems.unitCost,
  currencyCode: orderItems.currencyCode,
  createdAt: assets.createdAt,
  updatedAt: assets.updatedAt,
};

function mapStorageAsset(row: StorageAssetRow): StorageAssetRecord {
  const fallbackRequestDate = row.requestDate ?? row.receivedAt.slice(0, 10);
  const fallbackRequestNumber = `REQ-${fallbackRequestDate.replaceAll("-", "")}-${String(
    row.orderId,
  ).padStart(3, "0")}`;

  return {
    id: String(row.id),
    assetCode: row.assetCode,
    qrCode: row.qrCode,
    assetName: row.assetName,
    category: row.category,
    itemType: row.itemType,
    serialNumber: row.serialNumber,
    conditionStatus: row.conditionStatus,
    assetStatus: row.assetStatus,
    storageId: row.storageId === null ? null : String(row.storageId),
    storageName: row.storageName ?? "Main warehouse / Intake",
    storageType: row.storageType,
    receivedAt: row.receivedAt,
    receiveNote: row.receiveNote,
    orderId: String(row.orderId),
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
    .innerJoin(receiveItems, eq(assets.receiveItemId, receiveItems.id))
    .innerJoin(receives, eq(receiveItems.receiveId, receives.id))
    .innerJoin(orders, eq(receives.orderId, orders.id))
    .leftJoin(departments, eq(orders.departmentId, departments.id))
    .leftJoin(storage, eq(assets.currentStorageId, storage.id))
    .leftJoin(orderItems, eq(receiveItems.orderItemId, orderItems.id));
}

export async function listStorageAssets(
  db: AppDb,
): Promise<StorageAssetRecord[]> {
  try {
    const rows = await buildStorageAssetsBaseQuery(db)
      .where(isNotNull(assets.currentStorageId))
      .orderBy(asc(storage.storageName), asc(assets.assetName), asc(assets.id));

    return rows.map(mapStorageAsset);
  } catch (error) {
    console.warn("listStorageAssets fallback triggered.", error);
    return [];
  }
}

export async function getStorageAssetDetail(
  db: AppDb,
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
      filters.push(eq(assets.id, parseIntegerId("Asset id", normalizedId)));
    }
    if (normalizedQrCode) {
      filters.push(eq(assets.qrCode, normalizedQrCode));
    }

    const [row] = await buildStorageAssetsBaseQuery(db)
      .where(or(...filters))
      .limit(1);

    return row ? mapStorageAsset(row) : null;
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
  input: {
    id: string;
    assetStatus?: string | null;
    conditionStatus?: string | null;
  },
): Promise<StorageAssetRecord> {
  try {
    const assetId = parseIntegerId("Asset id", input.id);
    const updates: Record<string, string> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.assetStatus !== undefined && input.assetStatus !== null) {
      updates.assetStatus = parseAssetStatus(input.assetStatus);
    }

    if (input.conditionStatus !== undefined && input.conditionStatus !== null) {
      updates.conditionStatus = parseConditionStatus(input.conditionStatus);
    }

    if (Object.keys(updates).length === 1) {
      throw new Error("Provide at least one asset field to update.");
    }

    const updatedRows = await db
      .update(assets)
      .set(updates)
      .where(eq(assets.id, assetId))
      .returning({ id: assets.id });

    if (updatedRows.length === 0) {
      throw new Error(`Asset ${input.id} was not found.`);
    }

    const detail = await getStorageAssetDetail(db, { id: input.id });
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
