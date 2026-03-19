import { and, desc, eq } from "drizzle-orm";
import { notifications } from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import { parseIntegerId, resolveUserId } from "./reference-resolvers.ts";

type NotificationRow = {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  type: string;
  orderId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  entityType: string;
  entityId: string | null;
};

const notificationSelection = {
  id: notifications.id,
  userId: notifications.userId,
  type: notifications.type,
  title: notifications.title,
  message: notifications.message,
  entityType: notifications.entityType,
  entityId: notifications.entityId,
  isRead: notifications.isRead,
  createdAt: notifications.createdAt,
  readAt: notifications.readAt,
};

function mapNotification(row: NotificationRow): NotificationRecord {
  return {
    id: String(row.id),
    userId: String(row.userId),
    type: row.type,
    orderId: row.entityType === "order" ? row.entityId ?? "" : "",
    title: row.title,
    message: row.message,
    isRead: row.isRead,
    createdAt: row.createdAt,
    readAt: row.readAt,
    entityType: row.entityType,
    entityId: row.entityId,
  };
}

async function resolveNotificationUserId(
  db: AppDb,
  userId?: string | null,
  currentUserId?: string | null,
) {
  return resolveUserId(db, userId, currentUserId);
}

export async function listNotifications(
  db: AppDb,
  userId?: string | null,
  currentUserId?: string | null,
): Promise<NotificationRecord[]> {
  try {
    const resolvedUserId = await resolveNotificationUserId(
      db,
      userId,
      currentUserId,
    );
    const rows = await db
      .select(notificationSelection)
      .from(notifications)
      .where(eq(notifications.userId, resolvedUserId))
      .orderBy(desc(notifications.createdAt), desc(notifications.id));

    return rows.map(mapNotification);
  } catch (error) {
    console.warn("listNotifications fallback triggered.", error);
    return [];
  }
}

export async function markNotificationAsRead(
  db: AppDb,
  id: string,
  userId?: string | null,
  currentUserId?: string | null,
): Promise<NotificationRecord | null> {
  try {
    const numericId = parseIntegerId("Notification id", id);
    const resolvedUserId = await resolveNotificationUserId(
      db,
      userId,
      currentUserId,
    );
    const readAt = new Date().toISOString();

    const rows = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt,
      })
      .where(
        and(
          eq(notifications.id, numericId),
          eq(notifications.userId, resolvedUserId),
        ),
      )
      .returning(notificationSelection);

    return rows[0] ? mapNotification(rows[0]) : null;
  } catch (error) {
    console.warn(`markNotificationAsRead fallback triggered for ${id}.`, error);
    return null;
  }
}

export async function markAllNotificationsAsRead(
  db: AppDb,
  userId?: string | null,
  currentUserId?: string | null,
): Promise<boolean> {
  try {
    const resolvedUserId = await resolveNotificationUserId(
      db,
      userId,
      currentUserId,
    );

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date().toISOString(),
      })
      .where(eq(notifications.userId, resolvedUserId))
      .run();

    return true;
  } catch (error) {
    console.warn("markAllNotificationsAsRead fallback triggered.", error);
    return true;
  }
}
