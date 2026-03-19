import { returnAssetDistribution as returnAssetDistributionRecord } from "../../../../lib/distribution/index.ts";

export const returnAssetDistribution = async (
  _parent: unknown,
  args: {
    distributionId: string;
    storageLocation?: string | null;
    usageYears?: string | null;
    returnCondition?: string | null;
    returnPower?: string | null;
    note?: string | null;
  },
  context: { db: Parameters<typeof returnAssetDistributionRecord>[0] },
) => returnAssetDistributionRecord(context.db, args);
