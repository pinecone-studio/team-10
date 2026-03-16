"use client";

import {
  formatDisplayDate,
  getApprovalTargetLabel,
  type OrderStatus,
  type StoredOrder,
} from "../../_lib/order-store";

export type FeedEvent = { date: string; actor: string; message: string };

export function getOrderPresentation(status: OrderStatus) {
  if (status === "pending_higher_up") {
    return { type: "Higher-up review", status: "Waiting for Any Higher-ups" };
  }
  if (status === "rejected_higher_up") {
    return { type: "Higher-up review", status: "Rejected by higher-up" };
  }
  if (status === "pending_finance") {
    return { type: "Finance review", status: "Waiting for finance" };
  }
  if (status === "rejected_finance") {
    return { type: "Finance review", status: "Rejected by finance" };
  }
  if (status === "received_inventory") {
    return { type: "Inventory receive", status: "Received & stored" };
  }
  if (status === "assigned_hr") {
    return { type: "Distribution", status: "Assigned by HR" };
  }
  return { type: "Approved order", status: "Allowed" };
}

export function getOrderSummaryName(order: StoredOrder) {
  if (order.orderName.trim() && order.orderName.trim() !== "Order name") {
    return order.orderName;
  }
  if (order.items.length === 0) return order.requestNumber || "";
  if (order.items.length === 1) return order.items[0].name;
  return `${order.items[0].name} +${order.items.length - 1} more`;
}

export function buildFeedEvents(order: StoredOrder) {
  const events: FeedEvent[] = [
    {
      date: formatDisplayDate(order.createdAt.slice(0, 10)),
      actor: order.requester,
      message: "created a new order.",
    },
    {
      date: formatDisplayDate(order.createdAt.slice(0, 10)),
      actor: order.requester,
      message: `submitted the order to ${getApprovalTargetLabel(order.approvalTarget)}.`,
    },
  ];

  if (order.higherUpReviewedAt) {
    events.unshift({
      date: formatDisplayDate(order.higherUpReviewedAt.slice(0, 10)),
      actor: order.higherUpReviewer ?? "Any Higher-ups",
      message:
        order.status === "rejected_higher_up"
          ? "rejected the permission request."
          : "approved the request and forwarded it to Finance.",
    });
  }
  if (order.financeReviewedAt) {
    events.unshift({
      date: formatDisplayDate(order.financeReviewedAt.slice(0, 10)),
      actor: order.financeReviewer ?? "Finance",
      message:
        order.status === "rejected_finance"
          ? "rejected the order request."
          : "approved the budget and purchase request.",
    });
  }
  if (order.receivedAt) {
    events.unshift({
      date: formatDisplayDate(order.receivedAt.slice(0, 10)),
      actor: "Inventory Head",
      message: "received and stored the purchased goods.",
    });
  }
  if (order.assignedAt) {
    events.unshift({
      date: formatDisplayDate(order.assignedAt.slice(0, 10)),
      actor: "HR Manager",
      message: `assigned the goods to ${order.assignedTo}.`,
    });
  }

  return events;
}
