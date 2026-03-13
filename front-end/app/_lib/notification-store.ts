"use client";

import { useSyncExternalStore } from "react";

export type OrderNotification = {
  id: string;
  type: "financeApproved";
  orderId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const STORAGE_KEY = "ams-front-end-notifications-v1";
const CHANGE_EVENT = "ams-front-end-notifications-change";
const EMPTY_NOTIFICATIONS: OrderNotification[] = [];

let cachedNotifications = EMPTY_NOTIFICATIONS;
let cachedRaw: string | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
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
  };
}

function parseNotifications(rawValue: string | null) {
  if (!rawValue) return EMPTY_NOTIFICATIONS;

  try {
    const parsed = JSON.parse(rawValue) as Partial<OrderNotification>[];
    return Array.isArray(parsed)
      ? parsed.map((notification) => normalizeNotification(notification))
      : EMPTY_NOTIFICATIONS;
  } catch {
    return EMPTY_NOTIFICATIONS;
  }
}

function readNotificationsSnapshot() {
  if (!canUseStorage()) return EMPTY_NOTIFICATIONS;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (rawValue === cachedRaw) return cachedNotifications;

  cachedRaw = rawValue;
  cachedNotifications = parseNotifications(rawValue);
  return cachedNotifications;
}

function writeNotificationsSnapshot(notifications: OrderNotification[]) {
  if (!canUseStorage()) return;

  const rawValue = JSON.stringify(notifications);
  cachedRaw = rawValue;
  cachedNotifications = notifications;
  window.localStorage.setItem(STORAGE_KEY, rawValue);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function updateNotifications(
  updater: (notifications: OrderNotification[]) => OrderNotification[],
) {
  writeNotificationsSnapshot(updater(readNotificationsSnapshot()));
}

function subscribe(callback: () => void) {
  if (!canUseStorage()) return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === STORAGE_KEY) callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function useNotificationsStore() {
  return useSyncExternalStore(
    subscribe,
    readNotificationsSnapshot,
    () => EMPTY_NOTIFICATIONS,
  );
}

export function pushFinanceApprovedNotification(input: {
  orderId: string;
  title: string;
  message: string;
}) {
  updateNotifications((notifications) => {
    const existingNotification = notifications.find(
      (notification) =>
        notification.type === "financeApproved" &&
        notification.orderId === input.orderId,
    );

    if (existingNotification) return notifications;

    const nextNotification: OrderNotification = {
      id: `notification-${Math.random().toString(36).slice(2, 10)}`,
      type: "financeApproved",
      orderId: input.orderId,
      title: input.title,
      message: input.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    return [nextNotification, ...notifications];
  });
}

export function markNotificationAsRead(notificationId: string) {
  updateNotifications((notifications) =>
    notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification,
    ),
  );
}

export function markAllNotificationsAsRead() {
  updateNotifications((notifications) =>
    notifications.map((notification) => ({
      ...notification,
      isRead: true,
    })),
  );
}
