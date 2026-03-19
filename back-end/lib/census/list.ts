import { eq } from "drizzle-orm";
import { censusSessions, users } from "../../database/schema.ts";
import type { AppDb } from "../db.ts";
import { parseIntegerId } from "../reference-resolvers.ts";
import {
  buildSessionSelection,
  listCensusSessions,
  listCensusTasks,
  mapCensusSession,
  markOverdueCensusTasks,
} from "./shared.ts";

export async function getCensusSessions(db: AppDb, includeCompleted = true) {
  try {
    return await listCensusSessions(db, includeCompleted);
  } catch (error) {
    console.warn("getCensusSessions fallback triggered.", error);
    return [];
  }
}

export async function getCensusSessionTasks(db: AppDb, sessionId: string) {
  try {
    return await listCensusTasks(db, parseIntegerId("census session id", sessionId));
  } catch (error) {
    console.warn(`getCensusSessionTasks fallback triggered for ${sessionId}.`, error);
    return [];
  }
}

export async function getCensusSessionById(db: AppDb, sessionId: string) {
  try {
    await markOverdueCensusTasks(db);
    const numericSessionId = parseIntegerId("census session id", sessionId);
    const [row] = await db
      .select(buildSessionSelection())
      .from(censusSessions)
      .innerJoin(users, eq(censusSessions.createdByUserId, users.id))
      .where(eq(censusSessions.id, numericSessionId))
      .limit(1);

    return row ? mapCensusSession(row as Parameters<typeof mapCensusSession>[0]) : null;
  } catch (error) {
    console.warn(`getCensusSessionById fallback triggered for ${sessionId}.`, error);
    return null;
  }
}
