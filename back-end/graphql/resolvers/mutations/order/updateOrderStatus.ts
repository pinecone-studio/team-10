import type { MutationResolvers } from "../../../generated/types.ts";
import { updateOrderStatus as updateOrderStatusRecord } from "../../../../lib/orders.ts";

export const updateOrderStatus: NonNullable<MutationResolvers["updateOrderStatus"]> = (
  _parent,
  { id, status },
  context,
) => updateOrderStatusRecord(context.db, id, status);
