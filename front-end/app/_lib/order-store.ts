"use client";

import { useSyncExternalStore } from "react";
import { goodsCatalog, departmentOptions } from "./order-catalog";
import { formatCurrency, formatDisplayDate, getTodayDateInputValue } from "./order-format";
import type {
  ApprovalTarget,
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

export const permissionRequestOptions = [
  {
    value: "any_higher_ups",
    label: "Any Higher-ups",
    description: "Routes the order to any eligible approver before Finance review.",
  },
] as const;

let cachedOrdersSnapshot: StoredOrder[] = EMPTY_ORDERS;
let cachedOrdersRaw: string | null = null;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function migrateLegacyStatus(status: string | undefined): OrderStatus {
  if (status === "pending_finance") return "pending_higher_up";
  if (status === "approved_finance") return "approved_finance";
  if (status === "rejected_finance") return "rejected_finance";
  if (status === "received_inventory") return "received_inventory";
  if (status === "assigned_hr") return "assigned_hr";
  if (status === "rejected_higher_up") return "rejected_higher_up";
  if (status === "pending_higher_up") return "pending_higher_up";
  return "pending_higher_up";
}

function normalizeOrder(order: Partial<StoredOrder>): StoredOrder {
  return {
    id: order.id ?? "",
    requestNumber: order.requestNumber ?? "",
    requestDate: order.requestDate ?? getTodayDateInputValue(),
    department: order.department ?? departmentOptions[0]!,
    requester: order.requester ?? "",
    deliveryDate: order.deliveryDate ?? getTodayDateInputValue(),
    approvalTarget: order.approvalTarget ?? "any_higher_ups",
    items: Array.isArray(order.items) ? order.items : [],
    totalAmount: typeof order.totalAmount === "number" ? order.totalAmount : 0,
    status: migrateLegacyStatus(order.status),
    higherUpReviewer: order.higherUpReviewer ?? null,
    higherUpReviewedAt: order.higherUpReviewedAt ?? null,
    higherUpNote: order.higherUpNote ?? "",
    financeReviewer: order.financeReviewer ?? null,
    financeReviewedAt: order.financeReviewedAt ?? null,
    financeNote: order.financeNote ?? "",
    receivedAt: order.receivedAt ?? null,
    receivedCondition: order.receivedCondition ?? null,
    receivedNote: order.receivedNote ?? "",
    storageLocation: order.storageLocation ?? "",
    serialNumbers: Array.isArray(order.serialNumbers) ? order.serialNumbers : [],
    assignedTo: order.assignedTo ?? null,
    assignedRole: order.assignedRole ?? null,
    assignedAt: order.assignedAt ?? null,
    createdAt: order.createdAt ?? new Date().toISOString(),
    updatedAt: order.updatedAt ?? new Date().toISOString(),
  };
}

function parseOrders(value: string | null) {
  if (!value) return EMPTY_ORDERS;
  try {
    const parsed = JSON.parse(value) as StoredOrder[];
    return Array.isArray(parsed) ? parsed.map((order) => normalizeOrder(order)) : EMPTY_ORDERS;
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

export function getApprovalTargetLabel(target: ApprovalTarget) {
  if (target === "any_higher_ups") return "Any Higher-ups";
  return "Approval queue";
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
    approvalTarget: input.approvalTarget,
    items: input.items,
    totalAmount: input.items.reduce((sum, item) => sum + item.totalPrice, 0),
    status: "pending_higher_up",
    higherUpReviewer: null,
    higherUpReviewedAt: null,
    higherUpNote: "",
    financeReviewer: null,
    financeReviewedAt: null,
    financeNote: "",
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

export function reviewHigherUpOrder(input: {
  orderId: string;
  reviewer: string;
  note?: string;
  approved: boolean;
}) {
  const reviewedAt = new Date().toISOString();
  updateOrders((orders) =>
    orders.map((order) =>
      order.id === input.orderId
        ? patchOrder(order, input.approved ? "pending_finance" : "rejected_higher_up", {
            higherUpReviewer: input.reviewer,
            higherUpReviewedAt: reviewedAt,
            higherUpNote: input.note ?? "",
          })
        : order,
    ),
  );
}

export function reviewFinanceOrder(input: {
  orderId: string;
  reviewer: string;
  note?: string;
  approved: boolean;
}) {
  const reviewedAt = new Date().toISOString();
  updateOrders((orders) =>
    orders.map((order) =>
      order.id === input.orderId
        ? patchOrder(order, input.approved ? "approved_finance" : "rejected_finance", {
            financeReviewer: input.reviewer,
            financeReviewedAt: reviewedAt,
            financeNote: input.note ?? "",
          })
        : order,
    ),
  );
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
