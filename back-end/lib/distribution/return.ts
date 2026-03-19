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
      })
      .from(assetDistributions)
      .where(eq(assetDistributions.id, distributionId))
      .limit(1);

    if (!distribution) throw new Error(`Distribution ${input.distributionId} was not found.`);
    if (distribution.status !== "active") throw new Error("Only active distributions can be returned.");

    const storageId = await resolveStorageId(db, input.storageLocation);
    const now = new Date().toISOString();
    await db.update(assetDistributions).set({
      status: "returned",
      returnedAt: now,
      usageYears: input.usageYears?.trim() || null,
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
