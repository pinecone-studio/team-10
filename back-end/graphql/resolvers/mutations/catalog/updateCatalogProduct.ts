import type { MutationResolvers } from "../../../generated/types.ts";
import { updateCatalogProduct as updateCatalogProductRecord } from "../../../../lib/catalog.ts";

export const updateCatalogProduct: NonNullable<
  MutationResolvers["updateCatalogProduct"]
> = (_parent, { id, ...input }, context) =>
  updateCatalogProductRecord(context.db, id, input, context.currentUserId);
