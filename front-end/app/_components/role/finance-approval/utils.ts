import { formatCurrency, formatDisplayDate } from "../../../_lib/order-store";
import type { CurrencyCode, StoredOrder } from "../../../_lib/order-types";

export type ItemDecision = "pending" | "approved" | "rejected";
export type DecisionState = Record<string, Record<string, ItemDecision>>;
export type QueueTab = "all" | "needs-decision" | "ready";

export function getItemDecision(decisions: DecisionState, orderId: string, catalogId: string, code: string) {
  return decisions[orderId]?.[`${catalogId}::${code}`] ?? "pending";
}

export function filterPendingOrders(orders: StoredOrder[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return orders;
  return orders.filter((order) =>
    [order.requestNumber, order.requester, order.department, ...order.items.flatMap((item) => [item.name, item.code])]
      .some((value) => value.toLowerCase().includes(normalizedQuery)),
  );
}

export function summarizeDecisions(orders: StoredOrder[], decisions: DecisionState) {
  let approvedCount = 0;
  let rejectedCount = 0;
  let pendingCount = 0;
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const decision = getItemDecision(decisions, order.id, item.catalogId, item.code);
      if (decision === "approved") approvedCount += 1;
      else if (decision === "rejected") rejectedCount += 1;
      else pendingCount += 1;
    });
  });
  return { approvedCount, rejectedCount, pendingCount };
}

export function countReadyOrders(orders: StoredOrder[], decisions: DecisionState) {
  return orders.filter((order) =>
    order.items.every((item) => getItemDecision(decisions, order.id, item.catalogId, item.code) !== "pending"),
  ).length;
}

export function countNeedsDecisionOrders(orders: StoredOrder[], decisions: DecisionState) {
  return orders.filter((order) =>
    order.items.some((item) => getItemDecision(decisions, order.id, item.catalogId, item.code) === "pending"),
  ).length;
}

export function filterOrdersByQueueTab(orders: StoredOrder[], decisions: DecisionState, tab: QueueTab) {
  if (tab === "all") return orders;
  if (tab === "ready") {
    return orders.filter((order) =>
      order.items.every((item) => getItemDecision(decisions, order.id, item.catalogId, item.code) !== "pending"),
    );
  }
  return orders.filter((order) =>
    order.items.some((item) => getItemDecision(decisions, order.id, item.catalogId, item.code) === "pending"),
  );
}

export function getOrderStats(order: StoredOrder, decisions: DecisionState) {
  const counts = { pending: 0, approved: 0, rejected: 0 };
  order.items.forEach((item) => {
    const decision = getItemDecision(decisions, order.id, item.catalogId, item.code);
    counts[decision] += 1;
  });
  return counts;
}

export function getProcessedStatusLabel(order: StoredOrder) {
  if (order.status === "rejected_finance") return "Rejected";
  if (order.status === "assigned_hr") return "Assigned";
  if (order.status === "received_inventory") return "Received";
  return "Approved";
}

export function getProcessedTone(order: StoredOrder) {
  return order.status === "rejected_finance"
    ? "border-[#fed7d7] bg-[#fff1f2] text-[#dc2626]"
    : "bg-[#DCFCE7] text-[#15803D]";
}

export function formatOrderMeta(order: StoredOrder) {
  return `${order.requester} · ${order.department} · Delivery ${formatDisplayDate(order.deliveryDate)}`;
}

export function formatMoney(value: number, currencyCode: CurrencyCode) {
  return formatCurrency(value, currencyCode);
}
