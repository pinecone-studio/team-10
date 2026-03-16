"use client";

import type { OrderItem } from "../../_lib/order-types";
import type { StoredOrder } from "../../_lib/order-store";

export function filterOrders(
  orders: StoredOrder[],
  filter: "all" | "pending" | "completed" | "cancelled",
) {
  if (filter === "all") return orders;
  if (filter === "completed") {
    return orders.filter((order) => ["approved_finance", "received_inventory", "assigned_hr"].includes(order.status));
  }
  if (filter === "cancelled") {
    return orders.filter((order) => ["rejected_higher_up", "rejected_finance"].includes(order.status));
  }
  return orders.filter((order) => ["pending_higher_up", "pending_finance"].includes(order.status));
}

export function createOrderItem(
  catalogId: string,
  name: string,
  code: string,
  unit: string,
  quantity: number,
  unitPrice: number,
  currencyCode: OrderItem["currencyCode"],
) {
  return { catalogId, name, code, unit, quantity, unitPrice, totalPrice: quantity * unitPrice, currencyCode };
}
