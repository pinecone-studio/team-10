import type { QueryResolvers } from "../../../generated/types.ts";
import { listAssetAuditHistory } from "../../../../lib/asset-audits.ts";

export const assetAuditHistory: NonNullable<QueryResolvers["assetAuditHistory"]> = (
  _parent,
  args,
  context,
) => listAssetAuditHistory(context.db, args.assetId);
