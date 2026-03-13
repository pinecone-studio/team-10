import type { MutationResolvers } from "../../../generated/types.ts";
import { markNotificationAsRead as markNotificationAsReadRecord } from "../../../../lib/notifications.ts";

export const markNotificationAsRead: NonNullable<
  MutationResolvers["markNotificationAsRead"]
> = (_parent, { id, userId }, context) =>
  markNotificationAsReadRecord(context.db, id, userId, context.currentUserId);
