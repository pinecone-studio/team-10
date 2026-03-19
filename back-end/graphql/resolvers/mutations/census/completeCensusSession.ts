import type { MutationResolvers } from "../../../generated/types.ts";
import { completeCensusSession as completeCensusSessionRecord } from "../../../../lib/census/index.ts";

export const completeCensusSession: NonNullable<
  MutationResolvers["completeCensusSession"]
> = (_parent, args, context) =>
  completeCensusSessionRecord(context.db, args.id);
