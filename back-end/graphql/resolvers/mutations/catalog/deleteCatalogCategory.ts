import type { MutationResolvers } from "../../../generated/types.ts";
import { deleteCatalogCategory as deleteCatalogCategoryRecord } from "../../../../lib/catalog.ts";

export const deleteCatalogCategory: NonNullable<
  MutationResolvers["deleteCatalogCategory"]
> = (_parent, { id }, context) =>
  deleteCatalogCategoryRecord(context.db, id);
