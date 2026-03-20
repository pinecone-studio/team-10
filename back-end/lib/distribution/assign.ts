import { and, eq } from "drizzle-orm";
import {
  assetAssignmentRequests,
  assetDistributions,
  assets,
  users,
} from "../../database/schema.ts";
import type { RuntimeConfig } from "../context.ts";
import type { AppDb } from "../db.ts";
import { resolveUserId, parseIntegerId } from "../reference-resolvers.ts";
import { resolveEmployeeByName } from "./users.ts";
import {
  getDistributionById,
  sanitizeName,
  type DistributionRecord,
} from "./shared.ts";

export async function assignAssetDistribution(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: {
    assetId: string;
    employeeId?: string | null;
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
      .select({
        id: assets.id,
        assetCode: assets.assetCode,
        assetName: assets.assetName,
        category: assets.category,
      })
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

    const employeeId = input.employeeId?.trim()
      ? parseIntegerId("Employee id", input.employeeId)
      : await resolveEmployeeByName(db, employeeName);
    const [employee] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, employeeId))
      .limit(1);

    if (!employee) {
      throw new Error(`Employee '${employeeName}' was not found.`);
    }

    const distributedByUserId = await resolveUserId(db, undefined, currentUserId);
    const now = new Date().toISOString();
    const [conflict] = await db
      .select({
        conflictAssetCode: assets.assetCode,
      })
      .from(assetDistributions)
      .innerJoin(assets, eq(assetDistributions.assetId, assets.id))
      .where(
        and(
          eq(assetDistributions.employeeId, employeeId),
          eq(assetDistributions.status, "active"),
          eq(assets.category, asset.category),
        ),
      )
      .limit(1);

    const conflictWarning = conflict
      ? `Conflict warning: ${employee.fullName} already has an active asset in category '${asset.category}' (${conflict.conflictAssetCode}).`
      : null;

    const [assignmentRequest] = await db
      .insert(assetAssignmentRequests)
      .values({
        assetId,
        employeeId,
        reviewedByUserId: distributedByUserId,
        reviewedAt: now,
        reviewNote: input.note?.trim() || conflictWarning,
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
        note:
          [input.note?.trim(), conflictWarning]
            .filter(Boolean)
            .join(" | ") || null,
      })
      .returning({ id: assetDistributions.id });

    await db
      .update(assets)
      .set({
        assetStatus: "assigned",
        updatedAt: now,
      })
      .where(eq(assets.id, assetId))
      .run();

    const detail = await getDistributionById(db, distribution.id);
    if (!detail) throw new Error("Assigned distribution could not be reloaded.");
    return detail;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown distribution assign error.";
    throw new Error(`Failed to assign asset distribution: ${message}`);
  }
}
