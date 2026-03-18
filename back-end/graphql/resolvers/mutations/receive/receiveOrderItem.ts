import type { MutationResolvers } from "../../../generated/types.ts";
import { receiveOrderItem as receiveOrderItemRecord } from "../../../../lib/receives.ts";

export const receiveOrderItem: NonNullable<
  MutationResolvers["receiveOrderItem"]
> = (_parent, args, context) =>
  receiveOrderItemRecord(context.db, args, context.currentUserId);
