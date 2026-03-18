"use client";

import { useSyncExternalStore } from "react";
import {
  createOrderRequest,
  fetchOrdersRequest,
  updateOrderRequest,
} from "@/app/(dashboard)/_graphql/orders/order-api";
import { departmentOptions } from "./order-catalog";
import { refreshNotificationsStore } from "./notification-store";
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

const EMPTY_ORDERS: StoredOrder[] = [];

export const permissionRequestOptions = [
  {
    value: "any_higher_ups",
    label: "Any Higher-ups",
    description: "Routes the order to any eligible approver before Finance review.",
  },
  {
    value: "finance",
    label: "Finance",
    description: "Sends the order straight to the finance approval queue.",
  },
] as const;

let cachedOrdersSnapshot: StoredOrder[] = EMPTY_ORDERS;
let activeLoadPromise: Promise<StoredOrder[]> | null = null;
let hasLoadedOrders = false;
const subscribers = new Set<() => void>();

function emitChange() {
  subscribers.forEach((subscriber) => subscriber());
}

function migrateLegacyStatus(status: string | undefined): OrderStatus {
  if (status === "pending_finance") return "pending_finance";
  if (status === "approved_finance") return "approved_finance";
  if (status === "rejected_finance") return "rejected_finance";
  if (status === "received_inventory") return "received_inventory";
  if (status === "assigned_hr") return "assigned_hr";
  if (status === "rejected_higher_up") return "rejected_higher_up";
  if (status === "pending_higher_up") return "pending_higher_up";
  return "pending_higher_up";
}

function normalizeOrder(order: Partial<StoredOrder>): StoredOrder {
  const normalizedOrderName =
    order.orderName && order.orderName.trim() !== "Order name"
      ? order.orderName
      : "";

  return {
    id: order.id ?? "",
    orderName: normalizedOrderName,
    requestNumber: order.requestNumber ?? "",
    requestDate: order.requestDate ?? getTodayDateInputValue(),
    department: order.department ?? departmentOptions[0]!,
    requester: order.requester ?? "",
    deliveryDate: order.deliveryDate ?? getTodayDateInputValue(),
    approvalTarget: order.approvalTarget ?? "any_higher_ups",
    items: Array.isArray(order.items) ? order.items : [],
    totalAmount: typeof order.totalAmount === "number" ? order.totalAmount : 0,
    currencyCode: order.currencyCode ?? order.items?.[0]?.currencyCode ?? "MNT",
    status: migrateLegacyStatus(order.status),
    requestedApproverId: order.requestedApproverId ?? null,
    requestedApproverName: order.requestedApproverName ?? null,
    requestedApproverRole: order.requestedApproverRole ?? null,
    approvalMessage: order.approvalMessage ?? "",
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
    userId: order.userId ?? "",
    officeId: order.officeId ?? "",
    departmentId: order.departmentId ?? null,
    whyOrdered: order.whyOrdered ?? "",
    expectedArrivalAt: order.expectedArrivalAt ?? null,
    totalCost: typeof order.totalCost === "number" ? order.totalCost : null,
    createdAt: order.createdAt ?? new Date().toISOString(),
    updatedAt: order.updatedAt ?? new Date().toISOString(),
  };
}

function sortOrders(orders: StoredOrder[]) {
  return [...orders].sort((left, right) => {
    const dateCompare = right.createdAt.localeCompare(left.createdAt);
    if (dateCompare !== 0) return dateCompare;
    return right.id.localeCompare(left.id);
  });
}

function readOrdersSnapshot() {
  return cachedOrdersSnapshot;
}

function writeOrdersSnapshot(orders: StoredOrder[]) {
  cachedOrdersSnapshot = sortOrders(orders.map((order) => normalizeOrder(order)));
  hasLoadedOrders = true;
  emitChange();
}

async function refreshOrdersStore() {
  if (activeLoadPromise) {
    return activeLoadPromise;
  }

  activeLoadPromise = fetchOrdersRequest()
    .then((orders) => {
      writeOrdersSnapshot(orders);
      return cachedOrdersSnapshot;
    })
    .finally(() => {
      activeLoadPromise = null;
    });

  return activeLoadPromise;
}

export async function syncOrdersStore() {
  return refreshOrdersStore();
}

function ensureOrdersStoreLoaded() {
  if (hasLoadedOrders || activeLoadPromise) return;

  void refreshOrdersStore().catch((error) => {
    console.error("Failed to load orders.", error);
  });
}

function upsertOrderSnapshot(order: StoredOrder) {
  const normalizedOrder = normalizeOrder(order);
  writeOrdersSnapshot([
    normalizedOrder,
    ...cachedOrdersSnapshot.filter((entry) => entry.id !== normalizedOrder.id),
  ]);
  return normalizedOrder;
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  ensureOrdersStoreLoaded();

  return () => {
    subscribers.delete(callback);
  };
}

export function getApprovalTargetLabel(target: ApprovalTarget) {
  if (target === "any_higher_ups") return "Any Higher-ups";
  return "Finance";
}

export function useOrdersStore() {
  return useSyncExternalStore(subscribe, readOrdersSnapshot, () => EMPTY_ORDERS);
}

function getTodayRequestPrefix() {
  return `REQ-${getTodayDateInputValue().replaceAll("-", "")}`;
}

function getNextRequestSequence(orders: StoredOrder[], prefix: string) {
  return (
    orders.reduce((highestSequence, order) => {
      const matchedSequence = new RegExp(`^${prefix}-(\\d+)$`).exec(
        order.requestNumber,
      );
      if (!matchedSequence) return highestSequence;

      const sequence = Number(matchedSequence[1]);
      if (!Number.isInteger(sequence)) return highestSequence;

      return Math.max(highestSequence, sequence);
    }, 0) + 1
  );
}

function createNextRequestNumber(orders: StoredOrder[]) {
  const prefix = getTodayRequestPrefix();
  const nextSequence = getNextRequestSequence(orders, prefix);
  return `${prefix}-${`${nextSequence}`.padStart(3, "0")}`;
}

export function generateRequestNumber() {
  ensureOrdersStoreLoaded();
  return createNextRequestNumber(readOrdersSnapshot());
}

export async function loadOrdersSnapshot() {
  if (hasLoadedOrders) return cachedOrdersSnapshot;

  try {
    return await refreshOrdersStore();
  } catch {
    return cachedOrdersSnapshot;
  }
}

export async function createOrder(input: CreateOrderInput) {
  const nextOrder = await createOrderRequest(input);
  return upsertOrderSnapshot(nextOrder);
}

export async function reviewHigherUpOrder(input: {
  orderId: string;
  reviewer: string;
  note?: string;
  approved: boolean;
}) {
  const reviewedAt = new Date().toISOString();

  const updatedOrder = await updateOrderRequest(input.orderId, {
    status: input.approved ? "pending_finance" : "rejected_higher_up",
    higherUpReviewer: input.reviewer,
    higherUpReviewedAt: reviewedAt,
    higherUpNote: input.note ?? "",
  });

  if (!updatedOrder) {
    throw new Error("Failed to update higher-up review.");
  }

  upsertOrderSnapshot(updatedOrder);
}

export async function reviewFinanceOrder(input: {
  orderId: string;
  reviewer: string;
  note?: string;
  approved: boolean;
}) {
  const reviewedAt = new Date().toISOString();
  const updatedOrder = await updateOrderRequest(input.orderId, {
    status: input.approved ? "approved_finance" : "rejected_finance",
    financeReviewer: input.reviewer,
    financeReviewedAt: reviewedAt,
    financeNote: input.note ?? "",
  });

  if (!updatedOrder) {
    throw new Error("Failed to update finance review.");
  }

  upsertOrderSnapshot(updatedOrder);

  if (input.approved) {
    await refreshNotificationsStore();
  }
}

export async function receiveInventoryOrder(input: ReceiveOrderInput) {
  const updatedOrder = await updateOrderRequest(input.orderId, {
    status: "received_inventory",
    receivedAt: input.receivedAt,
    receivedCondition: input.receivedCondition,
    receivedNote: input.receivedNote,
    storageLocation: input.storageLocation,
    serialNumbers: input.serialNumbers,
  });

  if (!updatedOrder) {
    throw new Error("Failed to save received order details.");
  }

  upsertOrderSnapshot(updatedOrder);
}

export async function assignOrderToPerson(input: AssignOrderInput) {
  const updatedOrder = await updateOrderRequest(input.orderId, {
    status: "assigned_hr",
    assignedTo: input.assignedTo,
    assignedRole: input.assignedRole,
    assignedAt: new Date().toISOString(),
  });

  if (!updatedOrder) {
    throw new Error("Failed to save assignment.");
  }

  upsertOrderSnapshot(updatedOrder);
}

export { departmentOptions, formatCurrency, formatDisplayDate, getTodayDateInputValue };
export type { GoodsCatalogItem, OrderItem, OrderStatus, StoredOrder };
