import type { QueryResolvers } from "../../../generated/types.ts";
import { getCensusPortalVerification } from "../../../../lib/census/index.ts";

export const censusPortalVerification: NonNullable<
  QueryResolvers["censusPortalVerification"]
> = (_parent, args, context) =>
  getCensusPortalVerification(context.db, context.runtimeConfig, args.token);
