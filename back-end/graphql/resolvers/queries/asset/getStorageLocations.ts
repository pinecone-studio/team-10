import type { QueryResolvers } from "../../../generated/types.ts";
import { listStorageLocationNames } from "../../../../lib/assets.ts";

export const storageLocations: NonNullable<QueryResolvers["storageLocations"]> = (
  _parent,
  _args,
  context,
) => listStorageLocationNames(context.db);
