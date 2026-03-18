import type { QueryResolvers } from "../../../generated/types.ts";
import { listStorageAssets } from "../../../../lib/assets.ts";

export const storageAssets: NonNullable<QueryResolvers["storageAssets"]> = (
  _parent,
  _args,
  context,
) => listStorageAssets(context.db);
