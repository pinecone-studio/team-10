import type { MutationResolvers } from "../../../generated/types.ts";
import { createCatalogProduct as createCatalogProductRecord } from "../../../../lib/catalog.ts";

export const createCatalogProduct: NonNullable<
  MutationResolvers["createCatalogProduct"]
> = (_parent, args, context) =>
  createCatalogProductRecord(context.db, args, context.currentUserId);
