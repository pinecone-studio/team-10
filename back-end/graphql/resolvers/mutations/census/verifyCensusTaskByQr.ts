import type { MutationResolvers } from "../../../generated/types.ts";
import { verifyCensusTaskByQr as verifyCensusTaskByQrRecord } from "../../../../lib/census/index.ts";

export const verifyCensusTaskByQr: NonNullable<
  MutationResolvers["verifyCensusTaskByQr"]
> = (_parent, args, context) =>
  verifyCensusTaskByQrRecord(
    context.db,
    args.qrCode,
    {
      conditionStatus: args.conditionStatus ?? null,
      note: args.note ?? null,
    },
    context.currentUserId,
  );
