import type { QueryResolvers } from "../../../generated/types.ts";
import { getCatalogProductById as getCatalogProductRecordById } from "../../../../lib/catalog.ts";

export const catalogProduct: NonNullable<QueryResolvers["catalogProduct"]> = (
  _parent,
  { id },
  context,
) => getCatalogProductRecordById(context.db, id);
