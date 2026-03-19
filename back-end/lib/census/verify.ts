import { and, desc, eq } from "drizzle-orm";
import {
  assets,
  censusSessions,
  censusTasks,
  conditionStatusValues,
  users,
} from "../../database/schema.ts";
import type { RuntimeConfig } from "../context.ts";
import type { AppDb } from "../db.ts";
import { verifySignedJwt } from "../jwt.ts";
import { resolveUserId } from "../reference-resolvers.ts";
import { buildTaskSelection, mapCensusTask, markOverdueCensusTasks } from "./shared.ts";

type VerifyCensusInput = {
  conditionStatus?: string | null;
  note?: string | null;
};

type PortalPayload = {
  sessionId: number;
  taskId?: number;
  jti: string;
  exp: number;
};

function parseConditionStatus(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (!conditionStatusValues.includes(normalized as (typeof conditionStatusValues)[number])) {
    throw new Error(`Condition status must be one of: ${conditionStatusValues.join(", ")}.`);
  }
  return normalized as (typeof conditionStatusValues)[number];
}

async function markTaskVerified(
  db: AppDb,
  taskId: number,
  input: VerifyCensusInput,
  actor: { userId: number | null; name: string },
  channel: "auditorQr" | "employeePortal",
) {
  const now = new Date().toISOString();
  const reportedConditionStatus = parseConditionStatus(input.conditionStatus);
  await db
    .update(censusTasks)
    .set({
      status: "verified",
      verificationChannel: channel,
      verifiedAt: now,
      verifiedByUserId: actor.userId,
      verifiedByName: actor.name,
      reportedConditionStatus,
      note: input.note?.trim() || null,
      discrepancyReason: null,
      portalConsumedAt: channel === "employeePortal" ? now : undefined,
      updatedAt: now,
    })
    .where(eq(censusTasks.id, taskId))
    .run();

  const [row] = await db
    .select(buildTaskSelection())
    .from(censusTasks)
    .innerJoin(assets, eq(censusTasks.assetId, assets.id))
    .innerJoin(users, eq(censusTasks.employeeId, users.id))
    .where(eq(censusTasks.id, taskId))
    .limit(1);

  if (!row) {
    throw new Error("Census task was not found after verification.");
  }

  return mapCensusTask(row as Parameters<typeof mapCensusTask>[0]);
}

export async function verifyCensusTaskByQr(
  db: AppDb,
  qrCode: string,
  input: VerifyCensusInput,
  currentUserId?: string | null,
) {
  try {
    await markOverdueCensusTasks(db);
    const actorUserId = await resolveUserId(db, undefined, currentUserId);
    const [actor] = await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, actorUserId)).limit(1);
    const [task] = await db
      .select({ id: censusTasks.id })
      .from(censusTasks)
      .innerJoin(assets, eq(censusTasks.assetId, assets.id))
      .innerJoin(censusSessions, eq(censusTasks.censusSessionId, censusSessions.id))
      .where(and(eq(assets.qrCode, qrCode.trim()), eq(censusSessions.status, "active")))
      .orderBy(desc(censusSessions.createdAt), desc(censusTasks.id))
      .limit(1);

    if (!task) {
      throw new Error("No active census task matched this QR code.");
    }

    return markTaskVerified(
      db,
      task.id,
      input,
      { userId: actorUserId, name: actor?.fullName ?? "Auditor" },
      "auditorQr",
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to verify census task by QR.",
    );
  }
}

export async function verifyCensusTaskByPortal(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  token: string,
  input: VerifyCensusInput,
) {
  try {
    await markOverdueCensusTasks(db);
    const payload = await verifySignedJwt<PortalPayload>(token, runtimeConfig.assignmentJwtSecret);
    const [task] = await db
      .select({ id: censusTasks.id, employeeName: users.fullName })
      .from(censusTasks)
      .innerJoin(users, eq(censusTasks.employeeId, users.id))
      .where(eq(censusTasks.portalJwtId, payload.jti))
      .limit(1);

    if (!task) {
      throw new Error("This census verification link is no longer valid.");
    }

    return markTaskVerified(
      db,
      task.id,
      input,
      { userId: null, name: task.employeeName },
      "employeePortal",
    );
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to verify census task by portal.",
    );
  }
}
