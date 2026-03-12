import type { MutationResolvers } from "../../../generated/types.ts";
import { deleteOrder as deleteOrderRecord } from "../../../../lib/orders.ts";

export const deleteOrder: NonNullable<MutationResolvers["deleteOrder"]> = (
  _parent,
  { id },
  context,
) => deleteOrderRecord(context.db, id);
