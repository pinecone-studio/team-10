import type { QueryResolvers } from "../../../generated/types.ts";
import { listOrders } from "../../../../lib/orders.ts";

export const orders: NonNullable<QueryResolvers["orders"]> = async (
  _parent,
  _args,
  context,
) => listOrders(context.db);
