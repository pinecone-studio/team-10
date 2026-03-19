import type { QueryResolvers } from "../../../generated/types.ts";
import { getCensusSessions } from "../../../../lib/census/index.ts";

export const censusSessions: NonNullable<QueryResolvers["censusSessions"]> = (
  _parent,
  args,
  context,
) => getCensusSessions(context.db, args.includeCompleted ?? true);
