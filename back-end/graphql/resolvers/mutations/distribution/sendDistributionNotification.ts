import { sendDistributionNotification as sendDistributionNotificationRecord } from "../../../../lib/distribution/index.ts";

export const sendDistributionNotification = async (
  _parent: unknown,
  args: { distributionId: string; message?: string | null },
  context: { db: Parameters<typeof sendDistributionNotificationRecord>[0] },
) => sendDistributionNotificationRecord(context.db, args);
