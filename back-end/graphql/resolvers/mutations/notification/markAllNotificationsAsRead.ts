import type { MutationResolvers } from "../../../generated/types.ts";
import { markAllNotificationsAsRead as markAllNotificationsAsReadRecord } from "../../../../lib/notifications.ts";

export const markAllNotificationsAsRead: NonNullable<
  MutationResolvers["markAllNotificationsAsRead"]
> = (_parent, { userId }, context) =>
  markAllNotificationsAsReadRecord(context.db, userId, context.currentUserId);
