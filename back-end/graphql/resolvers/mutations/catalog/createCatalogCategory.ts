import type { MutationResolvers } from "../../../generated/types.ts";
import { createCatalogCategory as createCatalogCategoryRecord } from "../../../../lib/catalog.ts";

export const createCatalogCategory: NonNullable<
  MutationResolvers["createCatalogCategory"]
> = (_parent, args, context) =>
  createCatalogCategoryRecord(context.db, args, context.currentUserId);
