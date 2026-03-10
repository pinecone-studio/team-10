import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { assets } from "../db/schema";
import { HttpError } from "./http";
import type { AssetRecord, Env } from "../types";

export async function listAssets(env: Env): Promise<AssetRecord[]> {
  return getDb(env).select().from(assets).orderBy(desc(assets.created_at));
}

export async function getAssetById(assetId: string, env: Env): Promise<AssetRecord> {
  const asset = await getDb(env).select().from(assets).where(eq(assets.id, assetId)).get();

  if (!asset) {
    throw new HttpError(404, "Asset not found");
  }

  return asset;
}

export async function createAssetRecord(
  asset: AssetRecord,
  env: Env
): Promise<void> {
  await getDb(env).insert(assets).values(asset);
}

export async function updateAssetRecord(
  asset: AssetRecord,
  env: Env
): Promise<void> {
  await getDb(env)
    .update(assets)
    .set({
      title: asset.title,
      description: asset.description,
      object_key: asset.object_key,
      file_name: asset.file_name,
      content_type: asset.content_type,
      file_size: asset.file_size,
      updated_at: asset.updated_at,
    })
    .where(eq(assets.id, asset.id));
}

export async function deleteAssetRecord(assetId: string, env: Env): Promise<void> {
  await getDb(env).delete(assets).where(eq(assets.id, assetId));
}
