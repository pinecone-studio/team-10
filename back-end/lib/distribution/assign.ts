import { and, eq } from "drizzle-orm";
import {
  assetAssignmentRequests,
  assetDistributions,
  assets,
} from "../../database/schema.ts";
import type { AppDb } from "../db.ts";
import { resolveUserId, parseIntegerId } from "../reference-resolvers.ts";
import { resolveEmployeeByName } from "./users.ts";
import {
  createDistributionNotification,
  getDistributionById,
  sanitizeName,
  type DistributionRecord,
} from "./shared.ts";

export async function assignAssetDistribution(
  db: AppDb,
  input: {
    assetId: string;
    employeeName: string;
    recipientRole?: string | null;
    note?: string | null;
  },
  currentUserId?: string | null,
): Promise<DistributionRecord> {
  try {
    const assetId = parseIntegerId("Asset id", input.assetId);
    const employeeName = sanitizeName(input.employeeName);
    const recipientRole = input.recipientRole?.trim() || "Employee";
    const [asset] = await db
      .select({ id: assets.id, assetCode: assets.assetCode, assetName: assets.assetName })
      .from(assets)
      .where(eq(assets.id, assetId))
      .limit(1);

    if (!asset) throw new Error(`Asset ${input.assetId} was not found.`);

    const [activeDistribution] = await db
      .select({ id: assetDistributions.id })
      .from(assetDistributions)
      .where(and(eq(assetDistributions.assetId, assetId), eq(assetDistributions.status, "active")))
      .limit(1);

    if (activeDistribution) throw new Error(`Asset ${asset.assetCode} is already assigned.`);

    const employeeId = await resolveEmployeeByName(db, employeeName);
    const distributedByUserId = await resolveUserId(db, undefined, currentUserId);
    const now = new Date().toISOString();
    const [assignmentRequest] = await db
      .insert(assetAssignmentRequests)
      .values({
        assetId,
        employeeId,
        reviewedByUserId: distributedByUserId,
        reviewedAt: now,
        reviewNote: input.note?.trim() || null,
        status: "approved",
      })
      .returning({ id: assetAssignmentRequests.id });
    const [distribution] = await db
      .insert(assetDistributions)
      .values({
        assignmentRequestId: assignmentRequest.id,
        assetId,
        employeeId,
        distributedByUserId,
        distributedAt: now,
        recipientRole,
        status: "active",
        note: input.note?.trim() || null,
      })
      .returning({ id: assetDistributions.id });

    await db.update(assets).set({
      assetStatus: "assigned",
      currentStorageId: null,
      updatedAt: now,
    }).where(eq(assets.id, assetId)).run();

    await createDistributionNotification(
      db,
      employeeId,
      "Asset assigned to you",
      `${asset.assetName} (${asset.assetCode}) has been assigned to you.`,
      String(distribution.id),
    );

    const detail = await getDistributionById(db, distribution.id);
    if (!detail) throw new Error("Assigned distribution could not be reloaded.");
    return detail;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown distribution assign error.";
    throw new Error(`Failed to assign asset distribution: ${message}`);
  }
}
