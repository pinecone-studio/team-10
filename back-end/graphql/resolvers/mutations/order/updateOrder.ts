import type { MutationResolvers } from "../../../generated/types.ts";
import { updateOrder as updateOrderRecord } from "../../../../lib/orders.ts";

export const updateOrder: NonNullable<MutationResolvers["updateOrder"]> = (
  _parent,
  { id, ...input },
  context,
) => updateOrderRecord(context.db, id, input, context.currentUserId);
