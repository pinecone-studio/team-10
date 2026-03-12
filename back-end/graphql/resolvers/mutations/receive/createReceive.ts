import type { MutationResolvers } from "../../../generated/types.ts";
import { createReceive as createReceiveRecord } from "../../../../lib/receives.ts";

export const createReceive: NonNullable<MutationResolvers["createReceive"]> = (
  _parent,
  args,
  context,
) => createReceiveRecord(context.db, args, context.currentUserId);
