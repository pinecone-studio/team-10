import type { MutationResolvers } from "../../../generated/types.ts";
import { verifyCensusTaskByPortal as verifyCensusTaskByPortalRecord } from "../../../../lib/census/index.ts";

export const verifyCensusTaskByPortal: NonNullable<
  MutationResolvers["verifyCensusTaskByPortal"]
> = (_parent, args, context) =>
  verifyCensusTaskByPortalRecord(
    context.db,
    context.runtimeConfig,
    args.token,
    {
      conditionStatus: args.conditionStatus ?? null,
      note: args.note ?? null,
    },
  );
