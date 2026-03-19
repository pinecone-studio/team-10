import type { MutationResolvers } from "../../../generated/types.ts";
import { updateStorageAsset as updateStorageAssetRecord } from "../../../../lib/assets.ts";

export const updateStorageAsset: NonNullable<
  MutationResolvers["updateStorageAsset"]
> = (_parent, args, context) =>
  updateStorageAssetRecord(context.db, context.runtimeConfig, {
    id: args.id,
    assetStatus: args.assetStatus ?? null,
    conditionStatus: args.conditionStatus ?? null,
  });
