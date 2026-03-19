import type { QueryResolvers } from "../../../generated/types.ts";
import { getCensusReport } from "../../../../lib/census/index.ts";

export const censusReport: NonNullable<QueryResolvers["censusReport"]> = (
  _parent,
  args,
  context,
) => getCensusReport(context.db, args.sessionId);
