import {
  createAssetRecord,
  deleteAssetRecord,
  getAssetById,
  listAssets,
  updateAssetRecord,
} from "../lib/asset-repository";
import {
  decodeBase64,
  normalizeText,
  parsePayload,
  sanitizeFileName,
  validateCreatePayload,
  validateUpdatePayload,
} from "../lib/payload";
import {
  deleteAssetObject,
  getAssetContentResponse,
  putAssetObject,
} from "../lib/r2-storage";
import { jsonResponse } from "../lib/http";
import type { AssetRecord, Env } from "../types";

export async function handleAssetCollection(
  request: Request,
  env: Env
): Promise<Response> {
  if (request.method === "GET") {
    return jsonResponse(200, { items: await listAssets(env) });
  }

  if (request.method === "POST") {
    return createAsset(request, env);
  }

  return jsonResponse(405, { error: "Method not allowed" });
}

export async function handleAssetItem(
  request: Request,
  env: Env,
  assetId: string,
  wantsContent: boolean
): Promise<Response> {
  if (request.method === "GET" && wantsContent) {
    return getAssetContentResponse(await getAssetById(assetId, env), env);
  }

  if (request.method === "GET") {
    return jsonResponse(200, { item: await getAssetById(assetId, env) });
  }

  if (request.method === "PUT") {
    return updateAsset(request, env, assetId);
  }

  if (request.method === "DELETE") {
    return removeAsset(env, assetId);
  }

  return jsonResponse(405, { error: "Method not allowed" });
}

async function createAsset(request: Request, env: Env): Promise<Response> {
  const payload = await parsePayload(request);
  validateCreatePayload(payload);

  const assetId = crypto.randomUUID();
  const objectKey = buildObjectKey(assetId, payload.fileName!);
  const fileBuffer = decodeBase64(payload.fileBase64!);
  const now = new Date().toISOString();

  await putAssetObject(objectKey, fileBuffer, payload.contentType!.trim(), env);

  const asset: AssetRecord = {
    id: assetId,
    title: payload.title!.trim(),
    description: normalizeText(payload.description),
    object_key: objectKey,
    file_name: payload.fileName!.trim(),
    content_type: payload.contentType!.trim(),
    file_size: fileBuffer.byteLength,
    created_at: now,
    updated_at: now,
  };

  await createAssetRecord(asset, env);
  return jsonResponse(201, { item: await getAssetById(assetId, env) });
}

async function updateAsset(
  request: Request,
  env: Env,
  assetId: string
): Promise<Response> {
  const current = await getAssetById(assetId, env);
  const payload = await parsePayload(request);
  validateUpdatePayload(payload);

  const nextAsset = buildUpdatedAsset(current, payload);

  if (payload.fileBase64) {
    const nextBuffer = decodeBase64(payload.fileBase64);
    await putAssetObject(
      nextAsset.object_key,
      nextBuffer,
      nextAsset.content_type,
      env
    );

    if (nextAsset.object_key !== current.object_key) {
      await deleteAssetObject(current.object_key, env);
    }

    nextAsset.file_size = nextBuffer.byteLength;
  }

  await updateAssetRecord(nextAsset, env);
  return jsonResponse(200, { item: await getAssetById(assetId, env) });
}

async function removeAsset(env: Env, assetId: string): Promise<Response> {
  const asset = await getAssetById(assetId, env);
  await deleteAssetObject(asset.object_key, env);
  await deleteAssetRecord(assetId, env);
  return jsonResponse(200, { deleted: true, id: assetId });
}

function buildUpdatedAsset(
  current: AssetRecord,
  payload: {
    title?: string;
    description?: string | null;
    fileName?: string;
    contentType?: string;
  }
): AssetRecord {
  const fileName = payload.fileName?.trim() || current.file_name;

  return {
    ...current,
    title: payload.title?.trim() || current.title,
    description:
      payload.description !== undefined
        ? normalizeText(payload.description)
        : current.description,
    file_name: fileName,
    content_type: payload.contentType?.trim() || current.content_type,
    object_key: buildObjectKey(current.id, fileName),
    updated_at: new Date().toISOString(),
  };
}

function buildObjectKey(assetId: string, fileName: string): string {
  return `assets/${assetId}/${sanitizeFileName(fileName)}`;
}
