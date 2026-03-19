import { eq } from "drizzle-orm";
import { censusSessions, users } from "../../database/schema.ts";
import type { AppDb } from "../db.ts";
import { parseIntegerId } from "../reference-resolvers.ts";
import {
  buildSessionSelection,
  mapCensusSession,
  markOverdueCensusTasks,
} from "./shared.ts";

export async function completeCensusSession(db: AppDb, id: string) {
  try {
    await markOverdueCensusTasks(db);
    const sessionId = parseIntegerId("census session id", id);
    const now = new Date().toISOString();

    await db
      .update(censusSessions)
      .set({
        status: "completed",
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(censusSessions.id, sessionId))
      .run();

    const [row] = await db
      .select(buildSessionSelection())
      .from(censusSessions)
      .innerJoin(users, eq(censusSessions.createdByUserId, users.id))
      .where(eq(censusSessions.id, sessionId))
      .limit(1);

    if (!row) {
      throw new Error("Census session was not found.");
    }

    return mapCensusSession(row as Parameters<typeof mapCensusSession>[0]);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to complete census session.",
    );
  }
}
