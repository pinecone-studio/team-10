import { eq } from "drizzle-orm";
import { assetDistributions, assets } from "../../database/schema.ts";
import type { AppDb } from "../db.ts";
import { parseIntegerId } from "../reference-resolvers.ts";
import {
  createDistributionNotification,
  getDistributionById,
  type DistributionRecord,
} from "./shared.ts";
import { resolveStorageId } from "./users.ts";

function calculateUsageDuration(distributedAt: string, returnedAt: string) {
  const start = new Date(distributedAt);
  const end = new Date(returnedAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86_400_000));
  if (totalDays < 30) return `${totalDays} day`;
  if (totalDays < 365) return `${Math.floor(totalDays / 30)} mo`;
  return `${(totalDays / 365).toFixed(1).replace(/\.0$/, "")} yr`;
}

export async function returnAssetDistribution(
  db: AppDb,
  input: {
    distributionId: string;
    storageLocation?: string | null;
    usageYears?: string | null;
    returnCondition?: string | null;
    returnPower?: string | null;
    note?: string | null;
  },
): Promise<DistributionRecord> {
  try {
    const distributionId = parseIntegerId("Distribution id", input.distributionId);
    const [distribution] = await db
      .select({
        id: assetDistributions.id,
        assetId: assetDistributions.assetId,
        employeeId: assetDistributions.employeeId,
        status: assetDistributions.status,
        distributedAt: assetDistributions.distributedAt,
      })
      .from(assetDistributions)
      .where(eq(assetDistributions.id, distributionId))
      .limit(1);

    if (!distribution) throw new Error(`Distribution ${input.distributionId} was not found.`);
    if (distribution.status !== "active") throw new Error("Only active distributions can be returned.");

    const storageId = await resolveStorageId(db, input.storageLocation);
    const now = new Date().toISOString();
    const usageYears = input.usageYears?.trim() || calculateUsageDuration(distribution.distributedAt, now);
    await db.update(assetDistributions).set({
      status: "returned",
      returnedAt: now,
      usageYears,
      returnCondition: input.returnCondition?.trim() || null,
      returnPower: input.returnPower?.trim() || null,
      note: input.note?.trim() || null,
      updatedAt: now,
    }).where(eq(assetDistributions.id, distributionId)).run();

    await db.update(assets).set({
      assetStatus: "inStorage",
      currentStorageId: storageId,
      updatedAt: now,
    }).where(eq(assets.id, distribution.assetId)).run();

    await createDistributionNotification(
      db,
      distribution.employeeId,
      "Asset returned to inventory",
      "Your assigned asset has been marked as returned to inventory.",
      String(distributionId),
    );

    const detail = await getDistributionById(db, distributionId);
    if (!detail) throw new Error("Returned distribution could not be reloaded.");
    return detail;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown distribution return error.";
    throw new Error(`Failed to return asset distribution: ${message}`);
  }
}
