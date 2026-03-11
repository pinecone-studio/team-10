import type { MutationResolvers } from "../../../generated/types.ts";
import { createOrder as createOrderRecord } from "../../../../lib/orders.ts";

export const createOrder: NonNullable<MutationResolvers["createOrder"]> = (
  _parent,
  args,
  context,
) => createOrderRecord(context.db, args, context.currentUserId);
