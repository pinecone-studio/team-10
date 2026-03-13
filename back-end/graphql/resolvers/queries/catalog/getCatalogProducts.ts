import type { QueryResolvers } from "../../../generated/types.ts";
import { listCatalogProducts } from "../../../../lib/catalog.ts";

export const catalogProducts: NonNullable<QueryResolvers["catalogProducts"]> = (
  _parent,
  args,
  context,
) => listCatalogProducts(context.db, args);
