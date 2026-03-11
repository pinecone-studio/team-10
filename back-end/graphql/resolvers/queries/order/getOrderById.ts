import type { QueryResolvers } from "../../../generated/types.ts";
import { getOrderById as getOrderRecordById } from "../../../../lib/orders.ts";

export const order: NonNullable<QueryResolvers["order"]> = (
  _parent,
  { id },
  context,
) => getOrderRecordById(context.db, id);
