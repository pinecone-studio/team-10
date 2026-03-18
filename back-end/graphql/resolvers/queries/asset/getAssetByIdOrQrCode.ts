import type { QueryResolvers } from "../../../generated/types.ts";
import { getStorageAssetDetail } from "../../../../lib/assets.ts";

export const asset: NonNullable<QueryResolvers["asset"]> = (
  _parent,
  args,
  context,
) =>
  getStorageAssetDetail(context.db, {
    id: args.id ?? null,
    qrCode: args.qrCode ?? null,
  });
