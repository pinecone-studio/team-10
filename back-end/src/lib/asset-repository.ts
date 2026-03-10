import { HttpError } from "./http";
import type { AssetRecord, Env } from "../types";

const assetSelect = `
  SELECT id, title, description, object_key, file_name, content_type, file_size, created_at, updated_at
  FROM assets
`;

export async function listAssets(env: Env): Promise<AssetRecord[]> {
  const result = await env.DB.prepare(`${assetSelect} ORDER BY created_at DESC`).all<AssetRecord>();
  return result.results ?? [];
}

export async function getAssetById(assetId: string, env: Env): Promise<AssetRecord> {
  const asset = await env.DB.prepare(`${assetSelect} WHERE id = ?1`)
    .bind(assetId)
    .first<AssetRecord>();

  if (!asset) {
    throw new HttpError(404, "Asset not found");
  }

  return asset;
}

export async function createAssetRecord(
  asset: AssetRecord,
  env: Env
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO assets (
      id, title, description, object_key, file_name, content_type, file_size, created_at, updated_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
  )
    .bind(
      asset.id,
      asset.title,
      asset.description,
      asset.object_key,
      asset.file_name,
      asset.content_type,
      asset.file_size,
      asset.created_at,
      asset.updated_at
    )
    .run();
}

export async function updateAssetRecord(
  asset: AssetRecord,
  env: Env
): Promise<void> {
  await env.DB.prepare(
    `UPDATE assets
     SET title = ?1,
         description = ?2,
         object_key = ?3,
         file_name = ?4,
         content_type = ?5,
         file_size = ?6,
         updated_at = ?7
     WHERE id = ?8`
  )
    .bind(
      asset.title,
      asset.description,
      asset.object_key,
      asset.file_name,
      asset.content_type,
      asset.file_size,
      asset.updated_at,
      asset.id
    )
    .run();
}

export async function deleteAssetRecord(assetId: string, env: Env): Promise<void> {
  await env.DB.prepare("DELETE FROM assets WHERE id = ?1").bind(assetId).run();
}
