"use client";

import { useSyncExternalStore } from "react";
import { goodsCatalog, departmentOptions } from "./order-catalog";
import { formatCurrency, formatDisplayDate, getTodayDateInputValue } from "./order-format";
import type {
  AssignOrderInput,
  CreateOrderInput,
  GoodsCatalogItem,
  OrderItem,
  OrderStatus,
  ReceiveOrderInput,
  StoredOrder,
} from "./order-types";

const STORAGE_KEY = "ams-front-end-orders";
const CHANGE_EVENT = "ams-front-end-orders-change";
const EMPTY_ORDERS: StoredOrder[] = [];

let cachedOrdersSnapshot: StoredOrder[] = EMPTY_ORDERS;
let cachedOrdersRaw: string | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseOrders(value: string | null) {
  if (!value) return EMPTY_ORDERS;
  try {
    const parsed = JSON.parse(value) as StoredOrder[];
    return Array.isArray(parsed) ? parsed : EMPTY_ORDERS;
  } catch {
    return EMPTY_ORDERS;
  }
}

function readOrdersSnapshot() {
  if (!canUseStorage()) return EMPTY_ORDERS;
  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (rawValue === cachedOrdersRaw) return cachedOrdersSnapshot;
  cachedOrdersRaw = rawValue;
  cachedOrdersSnapshot = parseOrders(rawValue);
  return cachedOrdersSnapshot;
}

function writeOrdersSnapshot(orders: StoredOrder[]) {
  if (!canUseStorage()) return;
  const rawValue = JSON.stringify(orders);
  cachedOrdersRaw = rawValue;
  cachedOrdersSnapshot = orders;
  window.localStorage.setItem(STORAGE_KEY, rawValue);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function updateOrders(updater: (orders: StoredOrder[]) => StoredOrder[]) {
  writeOrdersSnapshot(updater(readOrdersSnapshot()));
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

function patchOrder(order: StoredOrder, status: OrderStatus, extra: Partial<StoredOrder> = {}) {
  return { ...order, status, ...extra, updatedAt: new Date().toISOString() };
}

export function useOrdersStore() {
  return useSyncExternalStore(subscribe, readOrdersSnapshot, () => EMPTY_ORDERS);
}

export function generateRequestNumber() {
  const dateValue = getTodayDateInputValue().replaceAll("-", "");
  const todaysOrders = readOrdersSnapshot().filter((order) =>
    order.requestNumber.startsWith(`REQ-${dateValue}`),
  );
  return `REQ-${dateValue}-${`${todaysOrders.length + 1}`.padStart(3, "0")}`;
}

export function createOrder(input: CreateOrderInput) {
  const nowIso = new Date().toISOString();
  const nextOrder: StoredOrder = {
    id: `${input.requestNumber}-${nowIso}`,
    requestNumber: input.requestNumber,
    requestDate: input.requestDate,
    department: input.department,
    requester: input.requester,
    deliveryDate: input.deliveryDate,
    items: input.items,
    totalAmount: input.items.reduce((sum, item) => sum + item.totalPrice, 0),
    status: "pending_finance",
    receivedAt: null,
    receivedCondition: null,
    receivedNote: "",
    storageLocation: "",
    serialNumbers: [],
    assignedTo: null,
    assignedRole: null,
    assignedAt: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  writeOrdersSnapshot([nextOrder, ...readOrdersSnapshot()]);
  return nextOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  updateOrders((orders) => orders.map((order) => (order.id === orderId ? patchOrder(order, status) : order)));
}

export function receiveInventoryOrder(input: ReceiveOrderInput) {
  updateOrders((orders) =>
    orders.map((order) =>
      order.id === input.orderId
        ? patchOrder(order, "received_inventory", {
            receivedAt: input.receivedAt,
            receivedCondition: input.receivedCondition,
            receivedNote: input.receivedNote,
            storageLocation: input.storageLocation,
            serialNumbers: input.serialNumbers,
          })
        : order,
    ),
  );
}

export function assignOrderToPerson(input: AssignOrderInput) {
  updateOrders((orders) =>
    orders.map((order) =>
      order.id === input.orderId
        ? patchOrder(order, "assigned_hr", {
            assignedTo: input.assignedTo,
            assignedRole: input.assignedRole,
            assignedAt: new Date().toISOString(),
          })
        : order,
    ),
  );
}

export { departmentOptions, formatCurrency, formatDisplayDate, getTodayDateInputValue, goodsCatalog };
export type { GoodsCatalogItem, OrderItem, OrderStatus, StoredOrder };
