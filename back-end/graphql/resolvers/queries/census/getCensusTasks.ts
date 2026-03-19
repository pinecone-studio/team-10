import type { QueryResolvers } from "../../../generated/types.ts";
import { getCensusSessionTasks } from "../../../../lib/census/index.ts";

export const censusTasks: NonNullable<QueryResolvers["censusTasks"]> = (
  _parent,
  args,
  context,
) => getCensusSessionTasks(context.db, args.sessionId);
