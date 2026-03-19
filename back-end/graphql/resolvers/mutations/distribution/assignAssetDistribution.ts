import { assignAssetDistribution as assignAssetDistributionRecord } from "../../../../lib/distribution/index.ts";

export const assignAssetDistribution = async (
  _parent: unknown,
  args: {
    assetId: string;
    employeeName: string;
    recipientRole?: string | null;
    note?: string | null;
  },
  context: {
    db: Parameters<typeof assignAssetDistributionRecord>[0];
    currentUserId?: string | null;
  },
) => assignAssetDistributionRecord(context.db, args, context.currentUserId);
