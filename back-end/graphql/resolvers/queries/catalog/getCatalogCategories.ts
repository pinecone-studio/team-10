import type { QueryResolvers } from "../../../generated/types.ts";
import { listCatalogCategories } from "../../../../lib/catalog.ts";

export const catalogCategories: NonNullable<QueryResolvers["catalogCategories"]> =
  async (_parent, _args, context) => listCatalogCategories(context.db);
