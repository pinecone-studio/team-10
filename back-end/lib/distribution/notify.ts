import { eq } from "drizzle-orm";
import { assetDistributions, assets } from "../../database/schema.ts";
import type { RuntimeConfig } from "../context.ts";
import type { AppDb } from "../db.ts";
import { parseIntegerId } from "../reference-resolvers.ts";
import { resendAssignmentAcknowledgmentEmail } from "./assignment-acknowledgment.ts";
import { createDistributionNotification } from "./shared.ts";

export async function sendDistributionNotification(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: { distributionId: string; message?: string | null },
): Promise<boolean> {
  try {
    const distributionId = parseIntegerId("Distribution id", input.distributionId);
    const [distribution] = await db
      .select({
        id: assetDistributions.id,
        employeeId: assetDistributions.employeeId,
        assetId: assetDistributions.assetId,
        assignmentRequestId: assetDistributions.assignmentRequestId,
        status: assetDistributions.status,
      })
      .from(assetDistributions)
      .where(eq(assetDistributions.id, distributionId))
      .limit(1);

    if (!distribution) throw new Error(`Distribution ${input.distributionId} was not found.`);

    const [asset] = await db
      .select({ assetName: assets.assetName, assetCode: assets.assetCode })
      .from(assets)
      .where(eq(assets.id, distribution.assetId))
      .limit(1);

    if (!asset) throw new Error("Associated asset was not found.");

    let deliveryNote = "";
    if (
      distribution.status === "pendingHandover" &&
      (Number.isInteger(distribution.assignmentRequestId) ||
        (Number.isInteger(distribution.assetId) &&
          Number.isInteger(distribution.employeeId)))
    ) {
      const resendResult = await resendAssignmentAcknowledgmentEmail(
        db,
        runtimeConfig,
        {
          assignmentRequestId: distribution.assignmentRequestId,
          assetId: distribution.assetId,
          employeeId: distribution.employeeId,
        },
      );

      if (!resendResult.resent || resendResult.emailStatus !== "sent") {
        throw new Error(
          `Acknowledgment email resend failed (${resendResult.emailStatus}). ${resendResult.emailError ?? "No pending acknowledgment is available for resend."}`.trim(),
        );
      }

      deliveryNote = " A fresh acknowledgment email link has been sent.";
    }

    await createDistributionNotification(
      db,
      distribution.employeeId,
      distribution.status === "active" ? "Distribution reminder" : "Distribution update",
      input.message?.trim() ||
        `Reminder: ${asset.assetName} (${asset.assetCode}) is still assigned to you.${deliveryNote}`,
      String(distribution.id),
    );

    return true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown distribution notification error.";
    throw new Error(`Failed to send distribution notification: ${message}`);
  }
}
