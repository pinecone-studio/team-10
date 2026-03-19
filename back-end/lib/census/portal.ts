import { eq } from "drizzle-orm";
import {
  assets,
  censusTasks,
  departments,
  orders,
  receiveItems,
  receives,
  users,
} from "../../database/schema.ts";
import type { RuntimeConfig } from "../context.ts";
import type { AppDb } from "../db.ts";
import { verifySignedJwt } from "../jwt.ts";
import { buildTaskSelection, mapCensusTask } from "./shared.ts";

type PortalPayload = {
  sessionId: number;
  taskId?: number;
  jti: string;
  exp: number;
};

export async function getCensusPortalVerification(
  db: AppDb,
  runtimeConfig: RuntimeConfig,
  token: string,
) {
  try {
    const payload = await verifySignedJwt<PortalPayload>(
      token,
      runtimeConfig.assignmentJwtSecret,
    );

    const [row] = await db
      .select(buildTaskSelection())
      .from(censusTasks)
      .innerJoin(assets, eq(censusTasks.assetId, assets.id))
      .innerJoin(users, eq(censusTasks.employeeId, users.id))
      .leftJoin(receiveItems, eq(assets.receiveItemId, receiveItems.id))
      .leftJoin(receives, eq(receiveItems.receiveId, receives.id))
      .leftJoin(orders, eq(receives.orderId, orders.id))
      .leftJoin(departments, eq(orders.departmentId, departments.id))
      .where(eq(censusTasks.portalJwtId, payload.jti))
      .limit(1);

    if (!row) {
      throw new Error("This census verification link is no longer valid.");
    }

    return mapCensusTask(row as Parameters<typeof mapCensusTask>[0]);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to load portal verification.",
    );
  }
}
