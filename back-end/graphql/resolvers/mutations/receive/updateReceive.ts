import type { MutationResolvers } from "../../../generated/types.ts";
import { updateReceive as updateReceiveRecord } from "../../../../lib/receives.ts";

export const updateReceive: NonNullable<MutationResolvers["updateReceive"]> = (
  _parent,
  { id, ...input },
  context,
) => updateReceiveRecord(context.db, id, input, context.currentUserId);
