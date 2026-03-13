import type { QueryResolvers } from "../../../generated/types.ts";
import { listNotifications } from "../../../../lib/notifications.ts";

export const notifications: NonNullable<QueryResolvers["notifications"]> = (
  _parent,
  { userId },
  context,
) => listNotifications(context.db, userId, context.currentUserId);
