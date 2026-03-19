import { and, eq, inArray } from "drizzle-orm";
import {
  assetDistributions,
  assets,
  notifications,
  users,
} from "../../database/schema.ts";
import type { RuntimeConfig } from "../context.ts";
import type { AppDb } from "../db.ts";
import { sendOperationalEmail } from "../email.ts";
import { parseIntegerId } from "../reference-resolvers.ts";
import { getDistributionById, type DistributionRecord } from "./shared.ts";

type TerminationEmailStatus = "sent" | "failed" | "skipped";

export type TerminationResult = {
  employeeId: string;
  employeeName: string;
  terminatedAt: string;
  pendingAssetCount: number;
  pendingAssets: DistributionRecord[];
  hrNotifiedCount: number;
  employeeNotified: boolean;
  emailStatus: TerminationEmailStatus;
  emailError: string | null;
};

async function sendTerminationReturnEmail(
  runtimeConfig: RuntimeConfig,
  input: {
    recipientEmail: string;
    recipientName: string;
    assets: Array<{ assetName: string; assetCode: string; serialNumber: string | null }>;
  },
): Promise<{ status: TerminationEmailStatus; errorMessage: string | null }> {
  const textAssetList = input.assets
    .map(
      (asset, index) =>
        `${index + 1}. ${asset.assetName} (${asset.assetCode})${
          asset.serialNumber ? `, Serial: ${asset.serialNumber}` : ""
        }`,
    )
    .join("\n");

  const htmlAssetList = input.assets
    .map(
      (asset) =>
        `<li>${asset.assetName} (${asset.assetCode})${
          asset.serialNumber ? ` - Serial: ${asset.serialNumber}` : ""
        }</li>`,
    )
    .join("");

  const textContent = [
    `Hello ${input.recipientName},`,
    "",
    "Your employment has been terminated. Please return these assets to HR:",
    textAssetList,
    "",
    "Do not ignore this request. Contact HR if you need support.",
  ].join("\n");

  const htmlContent = `<p>Hello ${input.recipientName},</p><p>Your employment has been terminated. Please return these assets to HR:</p><ul>${htmlAssetList}</ul><p>Do not ignore this request. Contact HR if you need support.</p>`;

  return await sendOperationalEmail(runtimeConfig, {
    to: input.recipientEmail,
    subject: "Return company assets to HR",
    text: textContent,
    html: htmlContent,
  });
}

export async function terminateEmployeeAssets(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: {
    employeeId: string;
    note?: string | null;
  },
): Promise<TerminationResult> {
  try {
    const employeeId = parseIntegerId("employeeId", input.employeeId);
    const [employee] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(users)
      .where(and(eq(users.id, employeeId), eq(users.role, "employee")))
      .limit(1);

    if (!employee) {
      throw new Error(`Employee ${input.employeeId} was not found.`);
    }

    const activeDistributions = await db
      .select({
        distributionId: assetDistributions.id,
        assetId: assetDistributions.assetId,
        assetName: assets.assetName,
        assetCode: assets.assetCode,
        serialNumber: assets.serialNumber,
      })
      .from(assetDistributions)
      .innerJoin(assets, eq(assetDistributions.assetId, assets.id))
      .where(
        and(
          eq(assetDistributions.employeeId, employee.id),
          eq(assetDistributions.status, "active"),
        ),
      );

    if (activeDistributions.length === 0) {
      throw new Error("Employee has no active assigned assets to retrieve.");
    }

    const now = new Date().toISOString();
    const assetIds = activeDistributions.map((distribution) => distribution.assetId);
    await db
      .update(assets)
      .set({
        assetStatus: "pendingRetrieval",
        updatedAt: now,
      })
      .where(inArray(assets.id, assetIds))
      .run();

    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: now,
      })
      .where(eq(users.id, employee.id))
      .run();

    const hrManagers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "hrManager"), eq(users.isActive, true)));

    const hrMessage = `${employee.fullName} was terminated. ${assetIds.length} asset(s) are pending retrieval.${
      input.note?.trim() ? ` Note: ${input.note.trim()}` : ""
    }`;

    await Promise.all(
      hrManagers.map((hr) =>
        db
          .insert(notifications)
          .values({
            userId: hr.id,
            type: "distributionUpdate",
            title: "Employee termination - asset retrieval required",
            message: hrMessage,
            entityType: "employee",
            entityId: String(employee.id),
            isRead: false,
          })
          .run(),
      ),
    );

    await db
      .insert(notifications)
      .values({
        userId: employee.id,
        type: "distributionUpdate",
        title: "Return assets to HR",
        message:
          "Your employment was terminated. Return all listed assets to HR immediately.",
        entityType: "employee",
        entityId: String(employee.id),
        isRead: false,
      })
      .run();

    const emailResult = await sendTerminationReturnEmail(runtimeConfig, {
      recipientEmail: employee.email,
      recipientName: employee.fullName,
      assets: activeDistributions,
    });

    const pendingAssets = (
      await Promise.all(
        activeDistributions.map((distribution) =>
          getDistributionById(db, distribution.distributionId),
        ),
      )
    ).filter((distribution): distribution is DistributionRecord => distribution !== null);

    return {
      employeeId: String(employee.id),
      employeeName: employee.fullName,
      terminatedAt: now,
      pendingAssetCount: pendingAssets.length,
      pendingAssets,
      hrNotifiedCount: hrManagers.length,
      employeeNotified: true,
      emailStatus: emailResult.status,
      emailError: emailResult.errorMessage,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown employee termination error.";
    throw new Error(`Failed to terminate employee assets: ${message}`);
  }
}
