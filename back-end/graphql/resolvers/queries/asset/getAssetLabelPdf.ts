import type { QueryResolvers } from "../../../generated/types.ts";
import { generateAssetLabelsPdf } from "../../../../lib/asset-labels.ts";

export const assetLabelPdf: NonNullable<QueryResolvers["assetLabelPdf"]> = (
  _parent,
  args,
  context,
) => generateAssetLabelsPdf(context.db, args.assetCodes);
