import { desc, eq } from "drizzle-orm";
import { assetDistributions, assets, storage, users } from "../../database/schema.ts";
import type { AppDb } from "../db.ts";
import {
  distributionSelection,
  mapDistribution,
  type DistributionRecord,
  type DistributionRow,
} from "./shared.ts";

export async function listAssetDistributions(
  db: AppDb,
  includeReturned = true,
): Promise<DistributionRecord[]> {
  try {
    const query = db
      .select(distributionSelection)
      .from(assetDistributions)
      .innerJoin(assets, eq(assetDistributions.assetId, assets.id))
      .innerJoin(users, eq(assetDistributions.employeeId, users.id))
      .leftJoin(storage, eq(assets.currentStorageId, storage.id))
      .orderBy(desc(assetDistributions.distributedAt), desc(assetDistributions.id));

    const rows = includeReturned
      ? await query
      : await query.where(eq(assetDistributions.status, "active"));

    return rows.map((row) => mapDistribution(row as DistributionRow));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown distribution list error.";
    throw new Error(`Failed to list asset distributions: ${message}`);
  }
}
