import type { QueryResolvers } from "../../../generated/types.ts";
import { listCatalogItemTypes } from "../../../../lib/catalog.ts";

export const catalogItemTypes: NonNullable<QueryResolvers["catalogItemTypes"]> =
  (_parent, args, context) => listCatalogItemTypes(context.db, args);
