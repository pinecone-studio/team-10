import type { QueryResolvers } from "../../../generated/types.ts";
import { getCensusSessionById } from "../../../../lib/census/index.ts";

export const censusSession: NonNullable<QueryResolvers["censusSession"]> = (
  _parent,
  args,
  context,
) => getCensusSessionById(context.db, args.id);
