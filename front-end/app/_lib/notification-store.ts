"use client";

import { useSyncExternalStore } from "react";
import {
  fetchNotificationsRequest,
  markAllNotificationsAsReadRequest,
  markNotificationAsReadRequest,
  type NotificationDto,
} from "@/app/(dashboard)/_graphql/notifications/notification-api";

export type OrderNotification = {
  id: string;
  type: "financeApproved";
  orderId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

const EMPTY_NOTIFICATIONS: OrderNotification[] = [];

let cachedNotifications = EMPTY_NOTIFICATIONS;
let activeLoadPromise: Promise<OrderNotification[]> | null = null;
let hasLoadedNotifications = false;
let activeViewerUserId: string | null = null;
const subscribers = new Set<() => void>();

function emitChange() {
  subscribers.forEach((subscriber) => subscriber());
}

function normalizeNotification(
  notification: Partial<OrderNotification>,
): OrderNotification {
  return {
    id: notification.id ?? `notification-${Math.random().toString(36).slice(2, 10)}`,
    type: notification.type ?? "financeApproved",
    orderId: notification.orderId ?? "",
    title: notification.title ?? "",
    message: notification.message ?? "",
    isRead: notification.isRead ?? false,
    createdAt: notification.createdAt ?? new Date().toISOString(),
    readAt: notification.readAt ?? null,
  };
}

function mapNotification(notification: NotificationDto): OrderNotification {
  return normalizeNotification({
    id: notification.id,
    type: "financeApproved",
    orderId: notification.orderId,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    readAt: notification.readAt,
  });
}

function readNotificationsSnapshot() {
  return cachedNotifications;
}

function writeNotificationsSnapshot(notifications: OrderNotification[]) {
  cachedNotifications = [...notifications]
    .map((notification) => normalizeNotification(notification))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  hasLoadedNotifications = true;
  emitChange();
}

export async function refreshNotificationsStore() {
  if (activeLoadPromise) {
    return activeLoadPromise;
  }

  activeLoadPromise = fetchNotificationsRequest(activeViewerUserId)
    .then((notifications) => {
      writeNotificationsSnapshot(notifications.map(mapNotification));
      return cachedNotifications;
    })
    .finally(() => {
      activeLoadPromise = null;
    });

  return activeLoadPromise;
}

function ensureNotificationsLoaded() {
  if (hasLoadedNotifications || activeLoadPromise) return;

  void refreshNotificationsStore().catch((error) => {
    console.error("Failed to load notifications.", error);
  });
}

function upsertNotification(notification: OrderNotification) {
  writeNotificationsSnapshot([
    normalizeNotification(notification),
    ...cachedNotifications.filter((entry) => entry.id !== notification.id),
  ]);
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  ensureNotificationsLoaded();

  return () => {
    subscribers.delete(callback);
  };
}

export function useNotificationsStore() {
  return useSyncExternalStore(
    subscribe,
    readNotificationsSnapshot,
    () => EMPTY_NOTIFICATIONS,
  );
}

export function setNotificationsViewerUserId(userId: string | null) {
  if (activeViewerUserId === userId) return;

  activeViewerUserId = userId;
  cachedNotifications = EMPTY_NOTIFICATIONS;
  hasLoadedNotifications = false;
  activeLoadPromise = null;
  ensureNotificationsLoaded();
}

export async function markNotificationAsRead(notificationId: string) {
  const nextNotification = await markNotificationAsReadRequest(
    notificationId,
    activeViewerUserId,
  );
  if (!nextNotification) return;

  upsertNotification(mapNotification(nextNotification));
}

export async function markAllNotificationsAsRead() {
  const didMarkAll = await markAllNotificationsAsReadRequest(activeViewerUserId);
  if (!didMarkAll) return;

  writeNotificationsSnapshot(
    cachedNotifications.map((notification) => ({
      ...notification,
      isRead: true,
      readAt: new Date().toISOString(),
    })),
  );
}
