import type { MutationResolvers } from "../../../generated/types.ts";
import { createAssetAudit as createAssetAuditRecord } from "../../../../lib/asset-audits.ts";

export const createAssetAudit: NonNullable<MutationResolvers["createAssetAudit"]> = (
  _parent,
  args,
  context,
) =>
  createAssetAuditRecord(
    context.db,
    {
      assetIds: args.assetIds,
      confirmedLocation: args.confirmedLocation ?? null,
      conditionStatus: args.conditionStatus ?? null,
      assetStatus: args.assetStatus ?? null,
      note: args.note ?? null,
    },
    context.currentUserId,
  );
