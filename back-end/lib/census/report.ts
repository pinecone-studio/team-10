import type { AppDb } from "../db.ts";
import { getCensusSessionById, getCensusSessionTasks } from "./list.ts";

export type CensusReportRecord = {
  sessionId: string;
  totalAssets: number;
  verifiedCount: number;
  verifiedPercentage: number;
  discrepancyCount: number;
  conditionChangeCount: number;
  actionItems: string[];
};

export async function getCensusReport(db: AppDb, sessionId: string) {
  try {
    const session = await getCensusSessionById(db, sessionId);
    if (!session) {
      throw new Error("Census session was not found.");
    }

    const tasks = await getCensusSessionTasks(db, sessionId);
    const totalAssets = tasks.length;
    const verifiedCount = tasks.filter((task) => task.status === "verified").length;
    const discrepancyTasks = tasks.filter((task) => task.status === "discrepancy");
    const conditionChangeCount = tasks.filter(
      (task) =>
        task.reportedConditionStatus &&
        task.reportedConditionStatus !== task.baselineConditionStatus,
    ).length;
    const actionItems = discrepancyTasks.map(
      (task) =>
        `${task.assetCode} (${task.assetName}) for ${task.employeeName}: ${task.discrepancyReason ?? "Needs follow-up."}`,
    );

    return {
      sessionId: session.id,
      totalAssets,
      verifiedCount,
      verifiedPercentage: totalAssets === 0 ? 0 : Math.round((verifiedCount / totalAssets) * 100),
      discrepancyCount: discrepancyTasks.length,
      conditionChangeCount,
      actionItems,
    } satisfies CensusReportRecord;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to build census report.");
  }
}
