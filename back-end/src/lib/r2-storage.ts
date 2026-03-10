import { HttpError, jsonHeaders } from "./http";
import type { AssetRecord, Env } from "../types";

export async function getAssetContentResponse(
  asset: AssetRecord,
  env: Env
): Promise<Response> {
  return getObjectResponse(
    asset.object_key,
    asset.content_type,
    asset.file_name,
    asset.file_size,
    env
  );
}

export async function putAssetObject(
  objectKey: string,
  file: ArrayBuffer,
  contentType: string,
  env: Env
): Promise<void> {
  await env.ASSETS_BUCKET.put(objectKey, file, {
    httpMetadata: { contentType },
  });
}

export async function deleteAssetObject(objectKey: string, env: Env): Promise<void> {
  await env.ASSETS_BUCKET.delete(objectKey);
}

export async function getObjectResponse(
  objectKey: string | null,
  contentType: string | null,
  fileName: string | null,
  fileSize: number | null,
  env: Env
): Promise<Response> {
  if (!objectKey || !contentType || !fileName || fileSize === null) {
    throw new HttpError(404, "Stored file metadata not found");
  }

  const object = await env.ASSETS_BUCKET.get(objectKey);

  if (!object) {
    throw new HttpError(404, "Stored file not found in R2");
  }

  const headers = new Headers({
    "content-type": contentType,
    "content-length": fileSize.toString(),
    "content-disposition": `inline; filename="${fileName}"`,
    "access-control-allow-origin": jsonHeaders["access-control-allow-origin"],
  });

  return new Response(object.body, { status: 200, headers });
}
