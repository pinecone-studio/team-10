"use client";

import {
  formatDisplayDate,
  generateRequestNumber,
  getTodayDateInputValue,
  goodsCatalog,
  type GoodsCatalogItem,
  type OrderItem,
  type OrderStatus,
  type StoredOrder,
} from "../../_lib/order-store";
import type { DepartmentOption } from "../../_lib/order-types";

export type DraftOrder = {
  requestNumber: string;
  requestDate: string;
  department: DepartmentOption;
  requester: string;
  deliveryDate: string;
};

export type GoodsDraft = {
  search: string;
  selectedItem: GoodsCatalogItem | null;
  quantity: string;
  unitPrice: string;
};

export type FeedEvent = { date: string; actor: string; message: string; featured?: boolean };

export function createDraftOrder(): DraftOrder {
  return {
    requestNumber: generateRequestNumber(),
    requestDate: getTodayDateInputValue(),
    department: "IT Office",
    requester: "",
    deliveryDate: getTodayDateInputValue(),
  };
}

export function createGoodsDraft(): GoodsDraft {
  return { search: "", selectedItem: null, quantity: "1", unitPrice: "" };
}

export function createDemoItems(): OrderItem[] {
  return [
    { catalogId: "goods-2", name: "Office Chair", code: "OF112", unit: "pcs", quantity: 2, unitPrice: 185000, totalPrice: 370000 },
    { catalogId: "goods-5", name: "Laptop Stand", code: "LS019", unit: "pcs", quantity: 4, unitPrice: 45000, totalPrice: 180000 },
  ];
}

export function getOffsetDateInputValue(offsetDays: number) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return nextDate.toISOString().slice(0, 10);
}

export function findClosestCatalogItem(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  const exact = goodsCatalog.find((item) => [item.name, item.code].some((value) => value.toLowerCase() === normalized));
  if (exact) return exact;
  const partial = goodsCatalog.filter((item) => [item.name, item.code].some((value) => value.toLowerCase().includes(normalized)));
  return partial.length === 1 ? partial[0] : null;
}

export function getOrderPresentation(status: OrderStatus) {
  if (status === "pending_finance") return { type: "Finance review", status: "Waiting for finance", tone: "border-[#ffb06f] text-[#ff6b00]" };
  if (status === "rejected_finance") return { type: "Finance review", status: "Rejected by finance", tone: "border-[#ff8e5c] text-[#ff6b00]" };
  if (status === "received_inventory") return { type: "Inventory receive", status: "Received & stored", tone: "border-[#59b56d] text-[#149b63]" };
  if (status === "assigned_hr") return { type: "Distribution", status: "Assigned by HR", tone: "border-[#4d7bd6] text-[#2454b6]" };
  return { type: "Approved order", status: "Waiting for Inventory Head", tone: "border-[#7fa0d8] text-[#3366aa]" };
}

export function getOrderSummaryName(order: StoredOrder) {
  if (order.items.length === 0) return "Order name";
  if (order.items.length === 1) return order.items[0].name;
  return `${order.items[0].name} +${order.items.length - 1} more`;
}

export function getOrderSummaryMeta(order: StoredOrder) {
  return `${order.department} · ${order.requester || "Requester"}`;
}

export function buildFeedEvents(order: StoredOrder): FeedEvent[] {
  const events: FeedEvent[] = [
    { date: formatDisplayDate(order.createdAt.slice(0, 10)), actor: order.requester, message: "created a new order." },
    { date: formatDisplayDate(order.createdAt.slice(0, 10)), actor: order.requester, message: "submitted the order for approval." },
  ];
  if (order.status !== "pending_finance") {
    events.unshift({ date: formatDisplayDate(order.updatedAt.slice(0, 10)), actor: "Finance", message: order.status === "rejected_finance" ? "rejected the order request." : "approved the order request.", featured: true });
  }
  if (order.receivedAt) events.unshift({ date: formatDisplayDate(order.receivedAt.slice(0, 10)), actor: "Inventory Head", message: "received and stored the purchased goods.", featured: true });
  if (order.assignedAt) events.unshift({ date: formatDisplayDate(order.assignedAt.slice(0, 10)), actor: "HR Manager", message: `assigned the goods to ${order.assignedTo}.`, featured: true });
  return events;
}

export function getProgressLabels(status: OrderStatus) {
  return [
    "Create an order",
    status === "rejected_finance" ? "Finance rejected" : status === "pending_finance" ? "Finance review" : "Finance approved",
    status === "assigned_hr" ? "Assigned" : status === "received_inventory" ? "Received & stored" : "Inventory receive",
  ];
}
