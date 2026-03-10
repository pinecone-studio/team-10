import { jsonResponse } from "../lib/http";
import { getAssetById, listAssets } from "../lib/asset-repository";
import { getAssetContentResponse } from "../lib/r2-storage";
import type { Env } from "../types";

export async function queryAssets(env: Env): Promise<Response> {
  return jsonResponse(200, { items: await listAssets(env) });
}

export async function queryAsset(assetId: string, env: Env): Promise<Response> {
  return jsonResponse(200, { item: await getAssetById(assetId, env) });
}

export async function queryAssetContent(assetId: string, env: Env): Promise<Response> {
  return getAssetContentResponse(await getAssetById(assetId, env), env);
}
