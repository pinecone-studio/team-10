import { assignAssetDistribution as assignAssetDistributionRecord } from "../../../../lib/distribution/index.ts";
import type { GraphQLContext } from "../../../../lib/context.ts";

export const assignAssetDistribution = async (
  _parent: unknown,
  args: {
    assetId: string;
    employeeName: string;
    recipientRole?: string | null;
    note?: string | null;
  },
  context: Pick<GraphQLContext, "db" | "runtimeConfig" | "currentUserId">,
) => {
  try {
    return await assignAssetDistributionRecord(
      context.db,
      context.runtimeConfig,
      args,
      context.currentUserId,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown assign asset distribution resolver error.";
    throw new Error(`assignAssetDistribution failed: ${message}`);
  }
};
