import type { QueryResolvers } from "../../../generated/types.ts";
import { getReceiveById as getReceiveRecordById } from "../../../../lib/receives.ts";

export const receive: NonNullable<QueryResolvers["receive"]> = (
  _parent,
  { id },
  context,
) => getReceiveRecordById(context.db, id);
