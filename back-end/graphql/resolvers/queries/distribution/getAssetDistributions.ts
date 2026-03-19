import { listAssetDistributions } from "../../../../lib/distribution/index.ts";

export const assetDistributions = async (
  _parent: unknown,
  args: { includeReturned?: boolean | null },
  context: { db: Parameters<typeof listAssetDistributions>[0] },
) => listAssetDistributions(context.db, args.includeReturned ?? true);
