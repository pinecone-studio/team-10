import type { MutationResolvers } from "../../../generated/types.ts";
import { deleteReceive as deleteReceiveRecord } from "../../../../lib/receives.ts";

export const deleteReceive: NonNullable<MutationResolvers["deleteReceive"]> = (
  _parent,
  { id },
  context,
) => deleteReceiveRecord(context.db, id);
