import { terminateEmployeeAssets as terminateEmployeeAssetsRecord } from "../../../../lib/distribution/index.ts";
import type { GraphQLContext } from "../../../../lib/context.ts";

export const terminateEmployeeAssets = async (
  _parent: unknown,
  args: {
    employeeId: string;
    note?: string | null;
  },
  context: Pick<GraphQLContext, "db" | "runtimeConfig">,
) => {
  try {
    return await terminateEmployeeAssetsRecord(
      context.db,
      context.runtimeConfig,
      args,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown terminate employee assets resolver error.";
    throw new Error(`terminateEmployeeAssets failed: ${message}`);
  }
};
