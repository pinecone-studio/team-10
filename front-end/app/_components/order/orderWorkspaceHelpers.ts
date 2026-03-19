"use client";

import type { OrderItem } from "../../_lib/order-types";
import type { GoodsDraft } from "./orderDraftState";
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
    return orders.filter((order) => ["rejected_finance"].includes(order.status));
  }
  return orders.filter((order) => ["pending_finance"].includes(order.status));
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

export function hasDraftContent(draft: GoodsDraft) {
  return Boolean(
    draft.itemName.trim() ||
      draft.code.trim() ||
      draft.unit.trim() ||
      draft.quantity.trim() ||
      draft.unitPrice.trim(),
  );
}

export function isDraftSubmittable(draft: GoodsDraft) {
  return Boolean(
    draft.itemName.trim() &&
      draft.code.trim() &&
      Number(draft.quantity) > 0 &&
      Number(draft.unitPrice) > 0,
  );
}

export function convertGoodsDraftToOrderItem(draft: GoodsDraft) {
  return createOrderItem(
    draft.id,
    draft.itemName.trim(),
    draft.code.trim(),
    draft.unit.trim() || "pcs",
    Number(draft.quantity),
    Number(draft.unitPrice),
    draft.currencyCode,
  );
}
