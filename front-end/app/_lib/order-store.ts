"use client";

import { useSyncExternalStore } from "react";
import {
  createOrderRequest,
  fetchOrdersRequest,
  updateOrderRequest,
} from "@/app/(dashboard)/_graphql/orders/order-api";
import { receiveOrderItemRequest } from "@/app/(dashboard)/_graphql/receive/receive-api";
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
const ORDERS_STORAGE_KEY = "ams-orders-snapshot";

export const permissionRequestOptions = [
  {
    value: "any_higher_ups",
    label: "Any Higher-ups",
    description: "Routes the order to any eligible approver before Finance review.",
  },
] as const;

let cachedOrdersSnapshot: StoredOrder[] = EMPTY_ORDERS;
let activeLoadPromise: Promise<StoredOrder[]> | null = null;
let hasLoadedOrders = false;
const subscribers = new Set<() => void>();

function emitChange() {
  subscribers.forEach((subscriber) => subscriber());
}

function readPersistedOrders() {
  if (typeof window === "undefined") return EMPTY_ORDERS;

  try {
    const rawValue = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!rawValue) return EMPTY_ORDERS;
    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return EMPTY_ORDERS;
    return parsedValue.map((order) => normalizeOrder(order));
  } catch {
    return EMPTY_ORDERS;
  }
}

function persistOrdersSnapshot(orders: StoredOrder[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    console.error("Failed to persist orders snapshot.");
  }
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
    assetIds: Array.isArray(order.assetIds) ? order.assetIds : [],
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
  persistOrdersSnapshot(cachedOrdersSnapshot);
  emitChange();
}

async function refreshOrdersStore() {
  if (activeLoadPromise) {
    return activeLoadPromise;
  }

  activeLoadPromise = fetchOrdersRequest()
    .then((orders) => {
      writeOrdersSnapshot(
        mergeRemoteOrdersWithLocal(
          orders,
          cachedOrdersSnapshot.length > 0 ? cachedOrdersSnapshot : readPersistedOrders(),
        ),
      );
      return cachedOrdersSnapshot;
    })
    .finally(() => {
      activeLoadPromise = null;
    });

  return activeLoadPromise;
}

function ensureOrdersStoreLoaded() {
  if (hasLoadedOrders || activeLoadPromise) return;

  const persistedOrders = readPersistedOrders();
  if (persistedOrders.length > 0) {
    cachedOrdersSnapshot = sortOrders(persistedOrders);
    hasLoadedOrders = true;
    emitChange();
  }

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

function preserveKnownItems(
  nextOrder: StoredOrder,
  source: Pick<StoredOrder, "items" | "totalAmount" | "currencyCode">,
) {
  if (nextOrder.items.length >= source.items.length || source.items.length === 0) {
    return nextOrder;
  }

  return normalizeOrder({
    ...nextOrder,
    items: source.items,
    totalAmount: source.totalAmount,
    currencyCode: source.currencyCode,
  });
}

function preserveLocalOrderDetails(nextOrder: StoredOrder, source: StoredOrder) {
  const mergedOrder = preserveKnownItems(nextOrder, source);

  return normalizeOrder({
    ...mergedOrder,
    serialNumbers:
      mergedOrder.serialNumbers.length >= source.serialNumbers.length
        ? mergedOrder.serialNumbers
        : source.serialNumbers,
    assetIds:
      mergedOrder.assetIds.length >= source.assetIds.length
        ? mergedOrder.assetIds
        : source.assetIds,
    receivedAt: mergedOrder.receivedAt ?? source.receivedAt,
    receivedCondition: mergedOrder.receivedCondition ?? source.receivedCondition,
    receivedNote: mergedOrder.receivedNote || source.receivedNote,
    storageLocation: mergedOrder.storageLocation || source.storageLocation,
  });
}

function mergeRemoteOrdersWithLocal(remoteOrders: StoredOrder[], localOrders: StoredOrder[]) {
  const mergedRemoteOrders = remoteOrders.map((remoteOrder) => {
    const matchedLocalOrder =
      localOrders.find((order) => order.id === remoteOrder.id) ??
      localOrders.find(
        (order) =>
          order.requestNumber === remoteOrder.requestNumber &&
          order.status === remoteOrder.status &&
          order.requester === remoteOrder.requester &&
          order.department === remoteOrder.department,
      );

    return matchedLocalOrder
      ? preserveLocalOrderDetails(remoteOrder, matchedLocalOrder)
      : remoteOrder;
  });

  const syntheticLocalOrders = localOrders.filter(
    (localOrder) =>
      (localOrder.id.startsWith("local-") || localOrder.id.includes("-received-")) &&
      !mergedRemoteOrders.some((remoteOrder) => remoteOrder.id === localOrder.id),
  );

  return [...mergedRemoteOrders, ...syntheticLocalOrders];
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
  return "Approval queue";
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

function createLocalOrderFallback(input: CreateOrderInput): StoredOrder {
  const createdAt = new Date().toISOString();
  const requestDate = input.requestDate || getTodayDateInputValue();
  const requestNumber = input.requestNumber.trim() || createNextRequestNumber(readOrdersSnapshot());
  const items = input.items.map((item, index) => ({
    ...item,
    catalogId: item.catalogId || `local-catalog-${index + 1}`,
    totalPrice: item.totalPrice || item.quantity * item.unitPrice,
  }));

  return normalizeOrder({
    id: `local-${Date.now()}`,
    orderName: input.orderName.trim(),
    requestNumber,
    requestDate,
    department: input.department,
    requester: input.requester.trim(),
    deliveryDate: input.deliveryDate,
    approvalTarget: input.approvalTarget,
    items,
    totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
    currencyCode: input.currencyCode,
    status: "pending_finance",
    requestedApproverId: input.requestedApproverId ?? null,
    requestedApproverName: input.requestedApproverName ?? null,
    requestedApproverRole: input.requestedApproverRole ?? null,
    approvalMessage: input.approvalMessage ?? "",
    userId: "local-user",
    officeId: "local-office",
    departmentId: null,
    whyOrdered: input.approvalMessage ?? "",
    createdAt,
    updatedAt: createdAt,
  });
}

export function generateRequestNumber() {
  ensureOrdersStoreLoaded();
  return createNextRequestNumber(readOrdersSnapshot());
}

function createAssetPrefix(itemName: string) {
  const normalized = itemName.toLowerCase();
  if (normalized.includes("mac")) return "MAC";
  if (normalized.includes("monitor")) return "MON";
  if (normalized.includes("keyboard")) return "KEY";
  if (normalized.includes("dock")) return "DOC";
  if (normalized.includes("printer")) return "PRI";
  if (normalized.includes("router")) return "ROU";
  if (normalized.includes("switch")) return "SWT";
  const fallback = normalized.replace(/[^a-z0-9]/g, "").slice(0, 3).toUpperCase();
  return fallback || "AST";
}

export function createAssetIds(itemName: string, receivedAt: string, quantity: number) {
  const year = new Date(receivedAt).getFullYear() || new Date().getFullYear();
  const sequence = cachedOrdersSnapshot
    .flatMap((order) => order.assetIds)
    .map((assetId) => {
      const parts = assetId.split("-");
      return parts[1] === String(year) ? Number(parts[2]) : 0;
    })
    .reduce((max, current) => Math.max(max, Number.isFinite(current) ? current : 0), 0);

  return Array.from({ length: quantity }, (_, index) => {
    const nextSequence = String(sequence + index + 1).padStart(3, "0");
    return `${createAssetPrefix(itemName)}-${year}-${nextSequence}`;
  });
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
  try {
    const nextOrder = preserveKnownItems(await createOrderRequest(input), {
      items: input.items,
      totalAmount: input.items.reduce((sum, item) => sum + item.totalPrice, 0),
      currencyCode: input.currencyCode,
    });
    return upsertOrderSnapshot(nextOrder);
  } catch (error) {
    console.error("Falling back to local order creation.", error);
    return upsertOrderSnapshot(createLocalOrderFallback(input));
  }
}

export async function reviewHigherUpOrder(input: {
  orderId: string;
  reviewer: string;
  note?: string;
  approved: boolean;
}) {
  const reviewedAt = new Date().toISOString();
  try {
    const updatedOrder = await updateOrderRequest(input.orderId, {
      status: input.approved ? "pending_finance" : "rejected_higher_up",
      higherUpReviewer: input.reviewer,
      higherUpReviewedAt: reviewedAt,
      higherUpNote: input.note ?? "",
    });

    if (!updatedOrder) {
      throw new Error("Failed to update higher-up review.");
    }

    const existingOrder = cachedOrdersSnapshot.find((order) => order.id === input.orderId);
    upsertOrderSnapshot(
      existingOrder ? preserveKnownItems(updatedOrder, existingOrder) : updatedOrder,
    );
  } catch (error) {
    console.error("Falling back to local higher-up review.", error);
    const existingOrder = cachedOrdersSnapshot.find((order) => order.id === input.orderId);
    if (!existingOrder) {
      throw error;
    }

    upsertOrderSnapshot({
      ...existingOrder,
      status: input.approved ? "pending_finance" : "rejected_higher_up",
      higherUpReviewer: input.reviewer,
      higherUpReviewedAt: reviewedAt,
      higherUpNote: input.note ?? "",
      updatedAt: reviewedAt,
    });
  }
}

export async function reviewFinanceOrder(input: {
  orderId: string;
  reviewer: string;
  note?: string;
  approved: boolean;
}) {
  const reviewedAt = new Date().toISOString();
  try {
    const updatedOrder = await updateOrderRequest(input.orderId, {
      status: input.approved ? "approved_finance" : "rejected_finance",
      financeReviewer: input.reviewer,
      financeReviewedAt: reviewedAt,
      financeNote: input.note ?? "",
    });

    if (!updatedOrder) {
      throw new Error("Failed to update finance review.");
    }

    const existingOrder = cachedOrdersSnapshot.find((order) => order.id === input.orderId);
    upsertOrderSnapshot(
      existingOrder ? preserveKnownItems(updatedOrder, existingOrder) : updatedOrder,
    );
  } catch (error) {
    console.error("Falling back to local finance review.", error);
    const existingOrder = cachedOrdersSnapshot.find((order) => order.id === input.orderId);
    if (!existingOrder) {
      throw error;
    }

    upsertOrderSnapshot({
      ...existingOrder,
      status: input.approved ? "approved_finance" : "rejected_finance",
      financeReviewer: input.reviewer,
      financeReviewedAt: reviewedAt,
      financeNote: input.note ?? "",
      updatedAt: reviewedAt,
    });
  }

  if (input.approved) {
    try {
      await refreshNotificationsStore();
    } catch (error) {
      console.error("Failed to refresh notifications after finance review.", error);
    }
  }
}

export async function receiveInventoryOrder(input: ReceiveOrderInput) {
  const existingOrder = cachedOrdersSnapshot.find((order) => order.id === input.orderId);
  if (!existingOrder) {
    throw new Error("Order not found.");
  }

  const targetItem = existingOrder.items.find(
    (item) => item.catalogId === input.catalogId && item.code === input.itemCode,
  );
  if (!targetItem) {
    throw new Error("Order item not found.");
  }

  const safeQuantity = Math.max(1, Math.min(input.quantityReceived, targetItem.quantity));
  const remainingQuantity = targetItem.quantity - safeQuantity;
  const receivedItem: OrderItem = {
    ...targetItem,
    quantity: safeQuantity,
    totalPrice: targetItem.unitPrice * safeQuantity,
  };
  const remainingItems = existingOrder.items.flatMap((item) => {
    if (item.catalogId !== input.catalogId || item.code !== input.itemCode) {
      return [item];
    }

    if (remainingQuantity <= 0) {
      return [];
    }

    return [
      {
        ...item,
        quantity: remainingQuantity,
        totalPrice: item.unitPrice * remainingQuantity,
      },
    ];
  });
  const remainingTotalAmount = remainingItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );
  const receivedTotalAmount = receivedItem.totalPrice;
  const hasRemainingItems = remainingItems.length > 0;

  try {
    await receiveOrderItemRequest(input);

    const updatedOrder = await updateOrderRequest(input.orderId, {
      status: hasRemainingItems ? "approved_finance" : "received_inventory",
      receivedAt: hasRemainingItems ? null : input.receivedAt,
      receivedCondition: hasRemainingItems ? null : input.receivedCondition,
      receivedNote: hasRemainingItems ? "" : input.receivedNote,
      storageLocation: hasRemainingItems ? "" : input.storageLocation,
      serialNumbers: hasRemainingItems ? [] : input.serialNumbers,
      items: hasRemainingItems ? remainingItems : [receivedItem],
      totalAmount: hasRemainingItems ? remainingTotalAmount : receivedTotalAmount,
    });

    if (!updatedOrder) {
      throw new Error("Failed to save received order details.");
    }

    if (hasRemainingItems) {
      const storedOrder = normalizeOrder({
        ...existingOrder,
        id: `${existingOrder.id}-received-${Date.now()}`,
        items: [receivedItem],
        totalAmount: receivedTotalAmount,
        status: "received_inventory",
        receivedAt: input.receivedAt,
        receivedCondition: input.receivedCondition,
        receivedNote: input.receivedNote,
        storageLocation: input.storageLocation,
        serialNumbers: input.serialNumbers,
        assetIds: input.assetIds,
        updatedAt: new Date().toISOString(),
      });
      writeOrdersSnapshot([
        storedOrder,
        updatedOrder,
        ...cachedOrdersSnapshot.filter(
          (order) => order.id !== existingOrder.id && order.id !== storedOrder.id,
        ),
      ]);
      return;
    }

    upsertOrderSnapshot(updatedOrder);
  } catch (error) {
    console.error("Falling back to local receive flow.", error);
    const updatedAt = new Date().toISOString();

    if (hasRemainingItems) {
      const remainingOrder = normalizeOrder({
        ...existingOrder,
        items: remainingItems,
        totalAmount: remainingTotalAmount,
        status: "approved_finance",
        receivedAt: null,
        receivedCondition: null,
        receivedNote: "",
        storageLocation: "",
        serialNumbers: [],
        assetIds: [],
        updatedAt,
      });
      const storedOrder = normalizeOrder({
        ...existingOrder,
        id: `${existingOrder.id}-received-${Date.now()}`,
        items: [receivedItem],
        totalAmount: receivedTotalAmount,
        status: "received_inventory",
        receivedAt: input.receivedAt,
        receivedCondition: input.receivedCondition,
        receivedNote: input.receivedNote,
        storageLocation: input.storageLocation,
        serialNumbers: input.serialNumbers,
        assetIds: input.assetIds,
        updatedAt,
      });
      writeOrdersSnapshot([
        storedOrder,
        remainingOrder,
        ...cachedOrdersSnapshot.filter((order) => order.id !== existingOrder.id),
      ]);
      return;
    }

    upsertOrderSnapshot({
      ...existingOrder,
      items: [receivedItem],
      totalAmount: receivedTotalAmount,
      status: "received_inventory",
      receivedAt: input.receivedAt,
      receivedCondition: input.receivedCondition,
      receivedNote: input.receivedNote,
      storageLocation: input.storageLocation,
      serialNumbers: input.serialNumbers,
      assetIds: input.assetIds,
      updatedAt,
    });
  }
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

  const existingOrder = cachedOrdersSnapshot.find((order) => order.id === input.orderId);
  upsertOrderSnapshot(
    existingOrder ? preserveKnownItems(updatedOrder, existingOrder) : updatedOrder,
  );
}

export { departmentOptions, formatCurrency, formatDisplayDate, getTodayDateInputValue };
export type { GoodsCatalogItem, OrderItem, OrderStatus, StoredOrder };
