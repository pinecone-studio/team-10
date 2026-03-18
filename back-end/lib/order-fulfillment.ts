import { eq } from "drizzle-orm";
import {
  assets,
  orderItems,
  receiveItems,
  receives,
  storage,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";

type SyncReceiveArtifactsInput = {
  orderId: number;
  officeId: number;
  receivedByUserId: number;
  receivedAt: string;
  receivedNote: string | null;
  receivedCondition: "complete" | "issue" | null;
  storageLocation: string | null;
  serialNumbers: string[];
};

function toConditionStatus(condition: SyncReceiveArtifactsInput["receivedCondition"]) {
  return condition === "issue" ? "incomplete" : "good";
}

async function ensureStorageLocation(db: AppDb, storageLocation: string | null) {
  const storageName = storageLocation?.trim() || "Main warehouse / Intake";
  const [existingStorage] = await db
    .select({ id: storage.id })
    .from(storage)
    .where(eq(storage.storageName, storageName))
    .limit(1);

  if (existingStorage) return existingStorage.id;

  const [createdStorage] = await db
    .insert(storage)
    .values({
      storageName,
      storageType: "warehouse",
      description: "Auto-created from inventory receiving workflow",
    })
    .returning({ id: storage.id });

  return createdStorage.id;
}

function buildAssetCode(orderId: number, receiveItemId: number, index: number) {
  return `AST-${String(orderId).padStart(4, "0")}-${String(receiveItemId).padStart(4, "0")}-${String(index).padStart(3, "0")}`;
}

function buildQrCode(assetCode: string) {
  return `asset:${assetCode}`;
}

export async function syncReceiveArtifacts(
  db: AppDb,
  input: SyncReceiveArtifactsInput,
) {
  const conditionStatus = toConditionStatus(input.receivedCondition);
  const currentStorageId = await ensureStorageLocation(db, input.storageLocation);
  const [existingReceive] = await db
    .select({ id: receives.id })
    .from(receives)
    .where(eq(receives.orderId, input.orderId))
    .limit(1);

  const receiveId = existingReceive?.id
    ? existingReceive.id
    : (
        await db
          .insert(receives)
          .values({
            orderId: input.orderId,
            receivedByUserId: input.receivedByUserId,
            officeId: input.officeId,
            status: "received",
            receivedAt: input.receivedAt,
            note: input.receivedNote,
          })
          .returning({ id: receives.id })
      )[0]!.id;

  await db
    .update(receives)
    .set({
      receivedByUserId: input.receivedByUserId,
      officeId: input.officeId,
      status: "received",
      receivedAt: input.receivedAt,
      note: input.receivedNote,
    })
    .where(eq(receives.id, receiveId))
    .run();

  await db.delete(receiveItems).where(eq(receiveItems.receiveId, receiveId)).run();

  const orderedItems = await db
    .select({
      id: orderItems.id,
      itemName: orderItems.itemName,
      itemCode: orderItems.itemCode,
      category: orderItems.category,
      itemType: orderItems.itemType,
      quantity: orderItems.quantity,
      catalogItemTypeId: orderItems.catalogItemTypeId,
      catalogProductId: orderItems.catalogProductId,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, input.orderId));

  let serialIndex = 0;
  for (const item of orderedItems) {
    const [receiveItem] = await db
      .insert(receiveItems)
      .values({
        receiveId,
        orderItemId: item.id,
        quantityReceived: item.quantity,
        conditionStatus,
        note: input.receivedNote,
      })
      .returning({ id: receiveItems.id });

    const assetValues = Array.from({ length: item.quantity }, (_, itemOffset) => {
      const assetCode = buildAssetCode(input.orderId, receiveItem.id, itemOffset + 1);
      const serialNumber =
        input.serialNumbers[serialIndex] ??
        `${item.itemCode}-${String(itemOffset + 1).padStart(3, "0")}`;
      serialIndex += 1;

      return {
        receiveItemId: receiveItem.id,
        assetCode,
        qrCode: buildQrCode(assetCode),
        assetName: item.itemName,
        category: item.category,
        itemType: item.itemType,
        catalogItemTypeId: item.catalogItemTypeId,
        catalogProductId: item.catalogProductId,
        serialNumber,
        conditionStatus,
        assetStatus: "inStorage",
        currentStorageId,
      } satisfies typeof assets.$inferInsert;
    });

    await db.insert(assets).values(assetValues).run();
  }
}
