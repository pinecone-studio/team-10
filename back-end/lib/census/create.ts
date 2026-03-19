import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import {
  assetDistributions,
  assets,
  censusSessions,
  censusTasks,
  departments,
  notifications,
  orders,
  receiveItems,
  receives,
  users,
} from "../../database/schema.ts";
import type { RuntimeConfig } from "../context.ts";
import type { AppDb } from "../db.ts";
import { createSignedJwt } from "../jwt.ts";
import { resolveUserId } from "../reference-resolvers.ts";
import { buildPortalLink, buildSessionSelection, mapCensusSession } from "./shared.ts";

type CreateCensusInput = {
  title: string;
  scopeType: string;
  scopeValue?: string | null;
  dueAt: string;
  note?: string | null;
};

function normalizeScopeValue(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

async function listScopedAssignedAssets(db: AppDb, scopeType: string, scopeValue: string | null) {
  const rows = await db
    .select({
      assetId: sql<number>`${assets.id}`.as("assetId"),
      distributionId: sql<number>`${assetDistributions.id}`.as("distributionId"),
      employeeId: sql<number>`${assetDistributions.employeeId}`.as("employeeId"),
      employeeName: sql<string>`${users.fullName}`.as("employeeName"),
      employeeEmail: sql<string>`${users.email}`.as("employeeEmail"),
      assetCode: sql<string>`${assets.assetCode}`.as("assetCode"),
      assetName: sql<string>`${assets.assetName}`.as("assetName"),
      category: sql<string>`${assets.category}`.as("category"),
      baselineConditionStatus: sql<string>`${assets.conditionStatus}`.as("baselineConditionStatus"),
      baselineAssetStatus: sql<string>`${assets.assetStatus}`.as("baselineAssetStatus"),
      baselineLocation: sql<string | null>`${departments.departmentName}`.as("baselineLocation"),
      departmentName: sql<string | null>`${departments.departmentName}`.as("departmentName"),
    })
    .from(assetDistributions)
    .innerJoin(assets, eq(assetDistributions.assetId, assets.id))
    .innerJoin(users, eq(assetDistributions.employeeId, users.id))
    .leftJoin(receiveItems, eq(assets.receiveItemId, receiveItems.id))
    .leftJoin(receives, eq(receiveItems.receiveId, receives.id))
    .leftJoin(orders, eq(receives.orderId, orders.id))
    .leftJoin(departments, eq(orders.departmentId, departments.id))
    .where(
      and(
        eq(assetDistributions.status, "active"),
        scopeType === "department" && scopeValue
          ? eq(departments.departmentName, scopeValue)
          : undefined,
        scopeType === "category" && scopeValue ? eq(assets.category, scopeValue) : undefined,
      ),
    )
    .orderBy(asc(users.fullName), asc(assets.assetCode));

  return rows;
}

async function sendPortalEmail(runtimeConfig: RuntimeConfig, recipientEmail: string, link: string) {
  if (!runtimeConfig.sendgridApiKey || !runtimeConfig.sendgridFromEmail) {
    return { emailStatus: "skipped" as const, emailSentAt: null };
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtimeConfig.sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: recipientEmail }] }],
      from: { email: runtimeConfig.sendgridFromEmail },
      subject: "Asset census verification needed",
      content: [{
        type: "text/plain",
        value: `Please verify your assigned asset here: ${link}`,
      }],
    }),
  });

  return response.ok
    ? { emailStatus: "sent" as const, emailSentAt: new Date().toISOString() }
    : { emailStatus: "failed" as const, emailSentAt: null };
}

export async function createCensusSession(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  input: CreateCensusInput,
  currentUserId?: string | null,
) {
  try {
    const existing = await db
      .select({ id: censusSessions.id })
      .from(censusSessions)
      .where(inArray(censusSessions.status, ["active", "overdue"]))
      .limit(1);

    if (existing[0]) {
      throw new Error("Complete the current census session before starting a new one.");
    }

    const scopeValue = normalizeScopeValue(input.scopeValue);
    const createdByUserId = await resolveUserId(db, undefined, currentUserId);
    const scopedAssets = await listScopedAssignedAssets(db, input.scopeType, scopeValue);

    if (scopedAssets.length === 0) {
      throw new Error("No assigned assets matched the selected census scope.");
    }

    const [session] = await db
      .insert(censusSessions)
      .values({
        title: input.title.trim(),
        scopeType: input.scopeType as "company" | "department" | "category",
        scopeValue,
        createdByUserId,
        dueAt: input.dueAt,
        note: input.note?.trim() || null,
      })
      .returning({ id: censusSessions.id });

    for (const row of scopedAssets) {
      const jwtId = randomUUID();
      const token = await createSignedJwt(
        { taskId: row.assetId, sessionId: session.id, jti: jwtId, exp: Math.floor(new Date(input.dueAt).getTime() / 1000) },
        runtimeConfig.assignmentJwtSecret,
      );
      const portalLink = buildPortalLink(runtimeConfig, token);
      const delivery = await sendPortalEmail(runtimeConfig, row.employeeEmail, portalLink);
      const taskInsert: typeof censusTasks.$inferInsert = {
        censusSessionId: session.id,
        assetId: row.assetId,
        distributionId: row.distributionId,
        employeeId: row.employeeId,
        baselineConditionStatus: row.baselineConditionStatus as typeof censusTasks.$inferInsert["baselineConditionStatus"],
        baselineAssetStatus: row.baselineAssetStatus as typeof censusTasks.$inferInsert["baselineAssetStatus"],
        baselineLocation: row.departmentName ?? "Assigned to employee",
        portalJwtId: jwtId,
        portalExpiresAt: input.dueAt,
        portalEmailStatus: delivery.emailStatus,
        portalEmailSentAt: delivery.emailSentAt,
      };

      await db.insert(censusTasks).values(taskInsert).run();

      await db.insert(notifications).values({
        userId: row.employeeId,
        type: "censusVerification",
        title: "Asset verification requested",
        message: `Verify ${row.assetName} here: ${portalLink}`,
        entityType: "censusSession",
        entityId: String(session.id),
        isRead: false,
      }).run();
    }

    const [createdSession] = await db
      .select(buildSessionSelection())
      .from(censusSessions)
      .innerJoin(users, eq(censusSessions.createdByUserId, users.id))
      .where(eq(censusSessions.id, session.id))
      .limit(1);

    return mapCensusSession(createdSession as Parameters<typeof mapCensusSession>[0]);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to create census session.",
    );
  }
}
