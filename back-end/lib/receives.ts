import { and, asc, eq, sql } from "drizzle-orm";
import {
  assetAttributes,
  assets,
  conditionStatusValues,
  orderItemAttributes,
  orderItems,
  orders,
  receivedConditionValues,
  receiveItems,
  receiveStatusValues,
  receives,
  storage,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import type { D1DatabaseLike } from "./d1.ts";
import { buildAssetCode } from "./asset-codes.ts";
import { deleteAssetImageFromR2, uploadAssetImageToR2 } from "./asset-images.ts";
import type { RuntimeConfig } from "./context.ts";
import {
  parseIntegerId,
  resolveOfficeId,
  resolveOrderId,
  resolveUserId,
  withReferenceSchemaCompatibility,
} from "./reference-resolvers.ts";
import { getOrderById, type OrderRecord } from "./orders.ts";

type ReceiveStatus = (typeof receiveStatusValues)[number];
type ConditionStatus = (typeof conditionStatusValues)[number];
type ReceivedCondition = (typeof receivedConditionValues)[number];

type ReceiveRow = {
  id: number;
  orderId: number;
  receivedByUserId: number;
  officeId: number;
  status: ReceiveStatus;
  receivedAt: string;
  receiveNote: string | null;
  orderItemId: number;
  quantityReceived: number;
  conditionStatus: ConditionStatus;
  itemNote: string | null;
  receivedCondition: ReceivedCondition | null;
  storageLocation: string | null;
  serialNumbersJson: string | null;
};

export type ReceiveRecord = {
  id: string;
  orderId: string;
  receivedByUserId: string;
  officeId: string;
  status: ReceiveStatus;
  receivedAt: string;
  note: string | null;
  orderItemId: string;
  quantityReceived: number;
  conditionStatus: ConditionStatus;
  receivedCondition: ReceivedCondition | null;
  storageLocation: string | null;
  serialNumbers: string[];
};

export type ReceivedAssetRecord = {
  id: string;
  assetCode: string;
  qrCode: string;
  assetName: string;
  serialNumber: string | null;
  conditionStatus: ConditionStatus;
  assetStatus: string;
  currentStorageId: string | null;
};

export type ReceiveOrderItemRecord = {
  receive: ReceiveRecord;
  order: OrderRecord;
  assets: ReceivedAssetRecord[];
};

export type CreateReceiveInput = {
  orderId?: string | null;
  orderItemId?: string | null;
  quantityReceived?: number | null;
  conditionStatus?: string | null;
  receivedAt?: string | null;
  receivedCondition?: string | null;
  note?: string | null;
  storageLocation?: string | null;
  serialNumbers?: string[] | null;
};

export type UpdateReceiveInput = {
  orderId?: string | null;
  orderItemId?: string | null;
  quantityReceived?: number | null;
  conditionStatus?: string | null;
  receivedAt?: string | null;
  receivedCondition?: string | null;
  note?: string | null;
  storageLocation?: string | null;
  serialNumbers?: string[] | null;
};

export type ReceiveOrderItemInput = {
  orderId: string;
  orderItemId?: string | null;
  catalogId?: string | null;
  itemCode: string;
  quantityReceived: number;
  receivedAt?: string | null;
  receivedCondition: string;
  receivedNote?: string | null;
  storageLocation?: string | null;
  serialNumbers?: string[] | null;
  assetImageDataUrl?: string | null;
  assetImageFileName?: string | null;
  receivedByUserId?: string | null;
  officeId?: string | null;
};

const receiveSelection = {
  id: receives.id,
  orderId: receives.orderId,
  receivedByUserId: receives.receivedByUserId,
  officeId: receives.officeId,
  status: receives.status,
  receivedAt: receives.receivedAt,
  receiveNote: receives.note,
  orderItemId: receiveItems.orderItemId,
  quantityReceived: receiveItems.quantityReceived,
  conditionStatus: receiveItems.conditionStatus,
  itemNote: receiveItems.note,
  receivedCondition: orders.receivedCondition,
  storageLocation: orders.storageLocation,
  serialNumbersJson: orders.serialNumbersJson,
};

function parseStringArray(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function mapReceive(row: ReceiveRow): ReceiveRecord {
  return {
    id: String(row.id),
    orderId: String(row.orderId),
    receivedByUserId: String(row.receivedByUserId),
    officeId: String(row.officeId),
    status: row.status,
    receivedAt: row.receivedAt,
    note: row.itemNote ?? row.receiveNote,
    orderItemId: String(row.orderItemId),
    quantityReceived: row.quantityReceived,
    conditionStatus: row.conditionStatus,
    receivedCondition: row.receivedCondition,
    storageLocation: row.storageLocation,
    serialNumbers: parseStringArray(row.serialNumbersJson),
  };
}

function parseConditionStatus(
  conditionStatus?: string | null,
): ConditionStatus {
  const normalized = conditionStatus?.trim() ?? "good";

  if (!conditionStatusValues.includes(normalized as ConditionStatus)) {
    throw new Error(
      `Condition status must be one of: ${conditionStatusValues.join(", ")}.`,
    );
  }

  return normalized as ConditionStatus;
}

function parseConditionStatusFromReceiveCondition(
  receivedCondition: string,
): ConditionStatus {
  if (receivedCondition === "complete") return "good";
  if (receivedCondition === "issue") return "damaged";

  throw new Error("Received condition must be one of: complete, issue.");
}

function buildQrCode(assetCode: string, serialNumber: string) {
  return `QR-${assetCode}-${serialNumber}`;
}

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

async function insertAssetsFallback(
  db: AppDb,
  assetValues: Array<{
    receiveItemId: number;
    assetCode: string;
    qrCode: string;
    assetName: string;
    category: string;
    itemType: string;
    catalogItemTypeId: number | null;
    catalogProductId: number | null;
    serialNumber: string;
    assetImageObjectKey: string | null;
    assetImageFileName: string | null;
    assetImageContentType: string | null;
    conditionStatus: ConditionStatus;
    assetStatus: "received";
    currentStorageId: number | null;
  }>,
) {
  const client = getRawD1Client(db);
  if (!client || assetValues.length === 0) {
    return false;
  }

  for (const assetValue of assetValues) {
    await client
      .prepare(
        `INSERT INTO assets (
          receive_item_id,
          asset_code,
          qr_code,
          asset_name,
          category,
          item_type,
          catalog_item_type_id,
          catalog_product_id,
          serial_number,
          asset_image_object_key,
          asset_image_file_name,
          asset_image_content_type,
          condition_status,
          asset_status,
          current_storage_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        assetValue.receiveItemId,
        assetValue.assetCode,
        assetValue.qrCode,
        assetValue.assetName,
        assetValue.category,
        assetValue.itemType,
        assetValue.catalogItemTypeId,
        assetValue.catalogProductId,
        assetValue.serialNumber,
        assetValue.assetImageObjectKey,
        assetValue.assetImageFileName,
        assetValue.assetImageContentType,
        assetValue.conditionStatus,
        assetValue.assetStatus,
        assetValue.currentStorageId,
      )
      .run();
  }

  return true;
}

async function getNextAssetCodeSequence(
  db: AppDb,
  assetName: string,
  receivedAt: string,
) {
  const assetCodePrefix = buildAssetCode(assetName, receivedAt, 0).slice(0, -3);
  const existingCodes = await db
    .select({ assetCode: assets.assetCode })
    .from(assets)
    .where(sql`${assets.assetCode} like ${`${assetCodePrefix}%`}`);

  return (
    existingCodes.reduce((maxSequence, row) => {
      const parts = row.assetCode.split("-");
      const sequence = Number(parts.at(-1));
      return Number.isInteger(sequence) ? Math.max(maxSequence, sequence) : maxSequence;
    }, 0) + 1
  );
}

function normalizeSerialNumbers(
  itemCode: string,
  quantityReceived: number,
  serialNumbers?: string[] | null,
) {
  const cleaned = (serialNumbers ?? [])
    .map((serialNumber) => serialNumber.trim())
    .filter(Boolean);

  if (cleaned.length >= quantityReceived) {
    return cleaned.slice(0, quantityReceived);
  }

  const nextSerialNumbers = [...cleaned];
  for (let index = cleaned.length; index < quantityReceived; index += 1) {
    nextSerialNumbers.push(
      `${itemCode}-${String(index + 1).padStart(3, "0")}`,
    );
  }

  return nextSerialNumbers;
}

function parseReceivedCondition(
  receivedCondition?: string | null,
): ReceivedCondition | null {
  if (receivedCondition === undefined || receivedCondition === null) {
    return null;
  }

  if (!receivedConditionValues.includes(receivedCondition as ReceivedCondition)) {
    throw new Error(
      `Received condition must be one of: ${receivedConditionValues.join(", ")}.`,
    );
  }

  return receivedCondition as ReceivedCondition;
}

function parseJsonStringArray(value: string | null) {
  if (!value) return [] as string[];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

// Keep batches comfortably below SQLite/D1 bind parameter limits.
const ASSET_INSERT_BATCH_SIZE = 50;

function chunkValues<T>(values: T[], size: number) {
  if (size <= 0) {
    throw new Error("Batch size must be greater than zero.");
  }

  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

async function resolveStorageId(
  db: AppDb,
  storageLocation?: string | null,
) {
  return withReferenceSchemaCompatibility(db, "resolveStorageId", async () => {
    const normalizedStorageName =
      storageLocation?.trim() || "Main warehouse / Intake";

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
        description: "Auto-created during receive intake flow",
      })
      .returning({ id: storage.id });

    return createdStorage.id;
  });
}

async function moveReceivedAssetsToStorage(
  db: AppDb,
  assetIds: number[],
  storageId: number,
) {
  if (assetIds.length === 0) {
    return;
  }

  try {
    const updatedAt = new Date().toISOString();

    for (const assetId of assetIds) {
      await db
        .update(assets)
        .set({
          assetStatus: "inStorage",
          currentStorageId: storageId,
          updatedAt,
        })
        .where(eq(assets.id, assetId))
        .run();
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown storage transition error.";
    throw new Error(`Failed to move received assets into storage: ${message}`);
  }
}

async function getOrderItemForReceive(
  db: AppDb,
  orderId: number,
  itemCode: string,
  catalogId?: string | null,
) {
  const baseSelection = db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      itemName: orderItems.itemName,
      itemCode: orderItems.itemCode,
      itemType: orderItems.itemType,
      category: orderItems.category,
      quantity: orderItems.quantity,
      unitCost: orderItems.unitCost,
      currencyCode: orderItems.currencyCode,
      catalogItemTypeId: orderItems.catalogItemTypeId,
      catalogProductId: orderItems.catalogProductId,
    })
    .from(orderItems)
    .orderBy(asc(orderItems.id))
    .limit(1);

  if (catalogId?.trim()) {
    const [strictMatch] = await baseSelection.where(
      and(
        eq(orderItems.orderId, orderId),
        eq(orderItems.itemCode, itemCode),
        eq(orderItems.catalogProductId, parseIntegerId("catalogId", catalogId)),
      ),
    );

    if (strictMatch) {
      return strictMatch;
    }
  }

  const [orderItem] = await baseSelection.where(
    and(eq(orderItems.orderId, orderId), eq(orderItems.itemCode, itemCode)),
  );

  return orderItem ?? null;
}

async function getOrderItemForReceiveById(
  db: AppDb,
  orderId: number,
  orderItemId: string,
) {
  const numericOrderItemId = parseIntegerId("orderItemId", orderItemId);

  const [orderItem] = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      itemName: orderItems.itemName,
      itemCode: orderItems.itemCode,
      itemType: orderItems.itemType,
      category: orderItems.category,
      quantity: orderItems.quantity,
      unitCost: orderItems.unitCost,
      currencyCode: orderItems.currencyCode,
      catalogItemTypeId: orderItems.catalogItemTypeId,
      catalogProductId: orderItems.catalogProductId,
    })
    .from(orderItems)
    .where(and(eq(orderItems.id, numericOrderItemId), eq(orderItems.orderId, orderId)))
    .limit(1);

  return orderItem ?? null;
}

async function computeRemainingOrderState(db: AppDb, orderId: number) {
  const orderItemRows = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitCost: orderItems.unitCost,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  if (orderItemRows.length === 0) {
    return {
      remainingQuantity: 0,
      remainingTotalCost: 0,
    };
  }

  const receivedRows = await db
    .select({
      orderItemId: receiveItems.orderItemId,
      quantityReceived: receiveItems.quantityReceived,
    })
    .from(receiveItems)
    .innerJoin(orderItems, eq(receiveItems.orderItemId, orderItems.id))
    .where(eq(orderItems.orderId, orderId));

  const receivedQuantityByOrderItemId = receivedRows.reduce(
    (accumulator, row) => {
      accumulator.set(
        row.orderItemId,
        (accumulator.get(row.orderItemId) ?? 0) + row.quantityReceived,
      );
      return accumulator;
    },
    new Map<number, number>(),
  );

  const remainingQuantity = orderItemRows.reduce((sum, row) => {
    const receivedQuantity = receivedQuantityByOrderItemId.get(row.id) ?? 0;
    return sum + Math.max(0, row.quantity - receivedQuantity);
  }, 0);

  const remainingTotalCost = orderItemRows.reduce((sum, row) => {
    const receivedQuantity = receivedQuantityByOrderItemId.get(row.id) ?? 0;
    const remainingItemQuantity = Math.max(0, row.quantity - receivedQuantity);
    return sum + remainingItemQuantity * row.unitCost;
  }, 0);

  return {
    remainingQuantity,
    remainingTotalCost,
  };
}

async function mapReceivedAssetsByReceiveItemId(
  db: AppDb,
  receiveItemId: number,
): Promise<ReceivedAssetRecord[]> {
  const rows = await db
    .select({
      id: assets.id,
      assetCode: assets.assetCode,
      qrCode: assets.qrCode,
      assetName: assets.assetName,
      serialNumber: assets.serialNumber,
      conditionStatus: assets.conditionStatus,
      assetStatus: assets.assetStatus,
      currentStorageId: assets.currentStorageId,
    })
    .from(assets)
    .where(eq(assets.receiveItemId, receiveItemId))
    .orderBy(asc(assets.id));

  return rows.map((row) => ({
    id: String(row.id),
    assetCode: row.assetCode,
    qrCode: row.qrCode,
    assetName: row.assetName,
    serialNumber: row.serialNumber,
    conditionStatus: row.conditionStatus,
    assetStatus: row.assetStatus,
    currentStorageId:
      row.currentStorageId === null ? null : String(row.currentStorageId),
  }));
}

function deriveReceiveStatus(
  quantityReceived: number,
  orderedQuantity: number,
): ReceiveStatus {
  return quantityReceived >= orderedQuantity ? "received" : "partiallyReceived";
}

function mapReceiveStatusToOrderStatus(status: ReceiveStatus) {
  if (status === "received") return "received";
  if (status === "partiallyReceived") return "partiallyReceived";
  return "ordered";
}

async function getOrderItemContext(
  db: AppDb,
  orderId: number,
  orderItemId?: string | null,
) {
  if (!orderItemId) {
    throw new Error("orderItemId is required.");
  }

  const numericOrderItemId = parseIntegerId("orderItemId", orderItemId);

  const [row] = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(
      and(eq(orderItems.id, numericOrderItemId), eq(orderItems.orderId, orderId)),
    )
    .limit(1);

  if (!row) {
    throw new Error(`Order item ${orderItemId} does not exist for order ${orderId}.`);
  }

  return row;
}

async function getReceiveRowById(
  db: AppDb,
  id: string,
): Promise<ReceiveRow | null> {
  const numericId = parseIntegerId("Receive id", id);

  const [row] = await db
    .select(receiveSelection)
    .from(receives)
    .innerJoin(receiveItems, eq(receives.id, receiveItems.receiveId))
    .innerJoin(orders, eq(receives.orderId, orders.id))
    .where(eq(receives.id, numericId))
    .limit(1);

  return row ?? null;
}

export async function listReceives(db: AppDb): Promise<ReceiveRecord[]> {
  const rows = await db
    .select(receiveSelection)
    .from(receives)
    .innerJoin(receiveItems, eq(receives.id, receiveItems.receiveId))
    .innerJoin(orders, eq(receives.orderId, orders.id))
    .orderBy(asc(receives.id), asc(receiveItems.id));

  return rows.map(mapReceive);
}

export async function getReceiveById(
  db: AppDb,
  id: string,
): Promise<ReceiveRecord | null> {
  const row = await getReceiveRowById(db, id);
  return row ? mapReceive(row) : null;
}

export async function createReceive(
  db: AppDb,
  input: CreateReceiveInput,
  currentUserId?: string | null,
): Promise<ReceiveRecord> {
  const orderId = await resolveOrderId(db, input.orderId, currentUserId);
  const orderItem = await getOrderItemContext(db, orderId, input.orderItemId);
  const receivedByUserId = await resolveUserId(db, undefined, currentUserId);
  const officeId = await resolveOfficeId(db);
  const quantityReceived = Number(input.quantityReceived);

  if (!Number.isInteger(quantityReceived) || quantityReceived <= 0) {
    throw new Error("quantityReceived must be a positive integer.");
  }

  if (quantityReceived > orderItem.quantity) {
    throw new Error("quantityReceived cannot exceed the ordered quantity.");
  }

  const status = deriveReceiveStatus(quantityReceived, orderItem.quantity);
  const receivedAt = input.receivedAt ?? new Date().toISOString();

  const [receiveRow] = await db
    .insert(receives)
    .values({
      orderId,
      receivedByUserId,
      officeId,
      status,
      receivedAt,
      note: input.note?.trim() || null,
    })
    .returning({ id: receives.id });

  await db
    .insert(receiveItems)
    .values({
      receiveId: receiveRow.id,
      orderItemId: orderItem.id,
      quantityReceived,
      conditionStatus: parseConditionStatus(input.conditionStatus),
      note: input.note?.trim() || null,
    })
    .run();

  await db
    .update(orders)
    .set({
      status: mapReceiveStatusToOrderStatus(status),
      receivedAt,
      receivedCondition: parseReceivedCondition(input.receivedCondition),
      receivedNote: input.note?.trim() || null,
      storageLocation: input.storageLocation?.trim() || null,
      serialNumbersJson: JSON.stringify(input.serialNumbers ?? []),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, orderId))
    .run();

  const createdReceive = await getReceiveById(db, String(receiveRow.id));
  if (!createdReceive) {
    throw new Error("Failed to load created receive.");
  }

  return createdReceive;
}

export async function receiveOrderItem(
  db: AppDb,
  input: ReceiveOrderItemInput,
  runtimeConfig: RuntimeConfig,
  currentUserId?: string | null,
): Promise<ReceiveOrderItemRecord> {
  const orderId = parseIntegerId("orderId", input.orderId);
  const [order] = await db
    .select({
      id: orders.id,
      officeId: orders.officeId,
      receivedCondition: orders.receivedCondition,
      serialNumbersJson: orders.serialNumbersJson,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    throw new Error(`Order ${input.orderId} does not exist.`);
  }

  const trimmedOrderItemId = input.orderItemId?.trim();
  const trimmedItemCode = input.itemCode.trim();
  const orderItem =
    (trimmedOrderItemId
      ? await getOrderItemForReceiveById(db, orderId, trimmedOrderItemId)
      : null) ??
    (trimmedItemCode
      ? await getOrderItemForReceive(
          db,
          orderId,
          trimmedItemCode,
          input.catalogId,
        )
      : null);

  if (!orderItem) {
    throw new Error("Order item was not found for receive intake.");
  }

  const quantityReceived = Number(input.quantityReceived);
  if (!Number.isInteger(quantityReceived) || quantityReceived <= 0) {
    throw new Error("quantityReceived must be a positive integer.");
  }

  if (quantityReceived > orderItem.quantity) {
    throw new Error("quantityReceived cannot exceed the remaining order quantity.");
  }

  const receivedAt = input.receivedAt ?? new Date().toISOString();
  const conditionStatus = parseConditionStatusFromReceiveCondition(
    input.receivedCondition,
  );
  const receiveStatus: ReceiveStatus =
    quantityReceived === orderItem.quantity ? "received" : "partiallyReceived";
  const receivedByUserId = await resolveUserId(
    db,
    input.receivedByUserId,
    currentUserId,
  );
  const officeId = await resolveOfficeId(db, input.officeId ?? String(order.officeId));
  const storageId = await resolveStorageId(db, input.storageLocation);
  const serialNumbers = normalizeSerialNumbers(
    orderItem.itemCode,
    quantityReceived,
    input.serialNumbers,
  );
  const nextAssetCodeSequence = await getNextAssetCodeSequence(
    db,
    orderItem.itemName,
    receivedAt,
  );
  let receiveId: number | null = null;
  let receiveItemId: number | null = null;
  let uploadedImage:
    | {
        objectKey: string;
        fileName: string;
        contentType: string;
      }
    | null = null;

  try {
    const [receive] = await db
      .insert(receives)
      .values({
        orderId,
        receivedByUserId,
        officeId,
        status: receiveStatus,
        receivedAt,
        note: input.receivedNote?.trim() || null,
      })
      .returning({ id: receives.id });

    receiveId = receive.id;

    const [receiveItem] = await db
      .insert(receiveItems)
      .values({
        receiveId: receive.id,
        orderItemId: orderItem.id,
        quantityReceived,
        conditionStatus,
        note: input.receivedNote?.trim() || null,
      })
      .returning({ id: receiveItems.id });

    receiveItemId = receiveItem.id;

    if (input.assetImageDataUrl?.trim()) {
      uploadedImage = await uploadAssetImageToR2(runtimeConfig, {
        assetCode: buildAssetCode(orderItem.itemName, receivedAt, nextAssetCodeSequence),
        fileName: input.assetImageFileName,
        dataUrl: input.assetImageDataUrl,
      });
    }

    const assetValues = serialNumbers.map((serialNumber, index) => {
      const assetCode = buildAssetCode(
        orderItem.itemName,
        receivedAt,
        nextAssetCodeSequence + index,
      );

      return {
        receiveItemId: receiveItem.id,
        assetCode,
        qrCode: buildQrCode(assetCode, serialNumber),
        assetName: orderItem.itemName,
        category: orderItem.category,
        itemType: orderItem.itemType,
        catalogItemTypeId: orderItem.catalogItemTypeId,
        catalogProductId: orderItem.catalogProductId,
        serialNumber,
        assetImageObjectKey: uploadedImage?.objectKey ?? null,
        assetImageFileName: uploadedImage?.fileName ?? null,
        assetImageContentType: uploadedImage?.contentType ?? null,
        conditionStatus,
        assetStatus: "received" as const,
        currentStorageId: null,
      };
    });

    if (assetValues.length > 0) {
      for (const assetValueBatch of chunkValues(
        assetValues,
        ASSET_INSERT_BATCH_SIZE,
      )) {
        for (const assetValue of assetValueBatch) {
          await db.insert(assets).values(assetValue).run();
        }
      }
    }

    let createdAssetIds =
      assetValues.length > 0
        ? (
            await db
              .select({ id: assets.id })
              .from(assets)
              .where(eq(assets.receiveItemId, receiveItem.id))
              .orderBy(asc(assets.id))
          ).map((asset) => asset.id)
        : [];

    if (assetValues.length > 0 && createdAssetIds.length === 0) {
      const insertedViaFallback = await insertAssetsFallback(db, assetValues);
      if (insertedViaFallback) {
        createdAssetIds = (
          await db
            .select({ id: assets.id })
            .from(assets)
            .where(eq(assets.receiveItemId, receiveItem.id))
            .orderBy(asc(assets.id))
        ).map((asset) => asset.id);
      }
    }

    if (assetValues.length > 0 && createdAssetIds.length === 0) {
      throw new Error("Receive completed without creating asset records.");
    }

    if (createdAssetIds.length > 0) {
      const sourceAttributes = await db
        .select({
          catalogAttributeDefinitionId:
            orderItemAttributes.catalogAttributeDefinitionId,
          attributeName: orderItemAttributes.attributeName,
          attributeValue: orderItemAttributes.attributeValue,
        })
        .from(orderItemAttributes)
        .where(eq(orderItemAttributes.orderItemId, orderItem.id))
        .orderBy(asc(orderItemAttributes.id));

      if (sourceAttributes.length > 0) {
        const now = new Date().toISOString();
        const attributeValues = createdAssetIds.flatMap((assetId) =>
          sourceAttributes.map((attribute) => ({
            assetId,
            catalogAttributeDefinitionId: attribute.catalogAttributeDefinitionId,
            attributeName: attribute.attributeName,
            attributeValue: attribute.attributeValue,
            createdAt: now,
            updatedAt: now,
          })),
        );

        for (const attributeBatch of chunkValues(
          attributeValues,
          ASSET_INSERT_BATCH_SIZE,
        )) {
          await db.insert(assetAttributes).values(attributeBatch).run();
        }
      }
    }

    const { remainingQuantity, remainingTotalCost } = await computeRemainingOrderState(
      db,
      orderId,
    );
    const mergedSerialNumbers = [
      ...parseJsonStringArray(order.serialNumbersJson),
      ...serialNumbers,
    ];
    const nextStatus =
      remainingQuantity === 0 ? "received" : "partiallyReceived";
    const nextReceivedCondition =
      remainingQuantity === 0
        ? order.receivedCondition === "issue" || input.receivedCondition === "issue"
          ? "issue"
          : "complete"
        : null;

    await db
      .update(orders)
      .set({
        status: nextStatus,
        totalCost: remainingTotalCost,
        receivedAt: remainingQuantity === 0 ? receivedAt : null,
        receivedCondition: nextReceivedCondition,
        receivedNote:
          remainingQuantity === 0 ? input.receivedNote?.trim() || null : null,
        storageLocation:
          remainingQuantity === 0
            ? input.storageLocation?.trim() || "Main warehouse / Intake"
            : null,
        serialNumbersJson: JSON.stringify(mergedSerialNumbers),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(orders.id, orderId))
      .run();

    await moveReceivedAssetsToStorage(db, createdAssetIds, storageId);

    const nextOrder = await getOrderById(db, input.orderId);
    if (!nextOrder) {
      throw new Error("Failed to load order after receive intake.");
    }

    const nextReceive = await getReceiveById(db, String(receive.id));
    if (!nextReceive) {
      throw new Error("Failed to load receive after receive intake.");
    }

    return {
      receive: nextReceive,
      order: nextOrder,
      assets: await mapReceivedAssetsByReceiveItemId(db, receiveItem.id),
    };
  } catch (error) {
    if (uploadedImage?.objectKey) {
      try {
        await deleteAssetImageFromR2(runtimeConfig, uploadedImage.objectKey);
      } catch (cleanupError) {
        console.warn("Failed to clean up uploaded asset image after receive error.", cleanupError);
      }
    }

    if (receiveId !== null) {
      try {
        await db.delete(receives).where(eq(receives.id, receiveId)).run();
      } catch (cleanupError) {
        console.warn("Failed to roll back receive after receive error.", cleanupError);
      }
    } else if (receiveItemId !== null) {
      try {
        await db.delete(receiveItems).where(eq(receiveItems.id, receiveItemId)).run();
      } catch (cleanupError) {
        console.warn("Failed to roll back receive item after receive error.", cleanupError);
      }
    }

    const message =
      error instanceof Error ? error.message : "Unknown receive intake error.";
    throw new Error(`Failed to receive order item: ${message}`);
  }
}

export async function updateReceive(
  db: AppDb,
  id: string,
  input: UpdateReceiveInput,
  currentUserId?: string | null,
): Promise<ReceiveRecord | null> {
  const existingReceive = await getReceiveRowById(db, id);
  if (!existingReceive) return null;

  const orderId =
    input.orderId !== undefined
      ? await resolveOrderId(db, input.orderId, currentUserId)
      : existingReceive.orderId;
  const orderItem =
    input.orderItemId !== undefined
      ? await getOrderItemContext(db, orderId, input.orderItemId)
      : await getOrderItemContext(db, orderId, String(existingReceive.orderItemId));
  const quantityReceived =
    input.quantityReceived !== undefined
      ? Number(input.quantityReceived)
      : existingReceive.quantityReceived;

  if (!Number.isInteger(quantityReceived) || quantityReceived <= 0) {
    throw new Error("quantityReceived must be a positive integer.");
  }

  if (quantityReceived > orderItem.quantity) {
    throw new Error("quantityReceived cannot exceed the ordered quantity.");
  }

  const status = deriveReceiveStatus(quantityReceived, orderItem.quantity);
  const receivedAt = input.receivedAt ?? existingReceive.receivedAt;
  const receivedByUserId = await resolveUserId(db, undefined, currentUserId);
  const officeId = await resolveOfficeId(db);

  await db
    .update(receives)
    .set({
      orderId,
      receivedByUserId,
      officeId,
      status,
      receivedAt,
      note:
        input.note !== undefined
          ? input.note?.trim() || null
          : existingReceive.itemNote ?? existingReceive.receiveNote,
    })
    .where(eq(receives.id, parseIntegerId("Receive id", id)))
    .run();

  await db
    .update(receiveItems)
    .set({
      orderItemId: orderItem.id,
      quantityReceived,
      conditionStatus:
        input.conditionStatus !== undefined
          ? parseConditionStatus(input.conditionStatus)
          : existingReceive.conditionStatus,
      note:
        input.note !== undefined
          ? input.note?.trim() || null
          : existingReceive.itemNote ?? existingReceive.receiveNote,
    })
    .where(eq(receiveItems.receiveId, parseIntegerId("Receive id", id)))
    .run();

  await db
    .update(orders)
    .set({
      status: mapReceiveStatusToOrderStatus(status),
      receivedAt,
      receivedCondition:
        input.receivedCondition !== undefined
          ? parseReceivedCondition(input.receivedCondition)
          : existingReceive.receivedCondition,
      receivedNote:
        input.note !== undefined
          ? input.note?.trim() || null
          : existingReceive.itemNote ?? existingReceive.receiveNote,
      storageLocation:
        input.storageLocation !== undefined
          ? input.storageLocation?.trim() || null
          : existingReceive.storageLocation,
      serialNumbersJson:
        input.serialNumbers !== undefined
          ? JSON.stringify(input.serialNumbers ?? [])
          : JSON.stringify(parseStringArray(existingReceive.serialNumbersJson)),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(orders.id, orderId))
    .run();

  return getReceiveById(db, id);
}

export async function deleteReceive(db: AppDb, id: string): Promise<boolean> {
  const numericId = parseIntegerId("Receive id", id);
  const existingReceive = await getReceiveRowById(db, id);
  if (!existingReceive) {
    return false;
  }

  await db.delete(receives).where(eq(receives.id, numericId)).run();
  return true;
}
