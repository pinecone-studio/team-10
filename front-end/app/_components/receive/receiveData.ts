"use client";

import type { StoredOrder } from "../../_lib/order-types";
import type { ReceiveCondition, ReceiveRow } from "./receiveTypes";

export const ROWS_PER_PAGE_OPTIONS = [10, 20, 30] as const;

export function inferCategory(itemName: string) {
  const normalized = itemName.toLowerCase();

  if (
    normalized.includes("macbook") ||
    normalized.includes("thinkpad") ||
    normalized.includes("dell") ||
    normalized.includes("asus") ||
    normalized.includes("lenovo")
  ) {
    return "IT Equipment";
  }

  if (
    normalized.includes("printer") ||
    normalized.includes("scanner") ||
    normalized.includes("projector") ||
    normalized.includes("monitor")
  ) {
    return "Office Equipment";
  }

  if (
    normalized.includes("switch") ||
    normalized.includes("router") ||
    normalized.includes("server")
  ) {
    return "Technical content";
  }

  return "Other Assets";
}

export function getReceivedCount(order: StoredOrder, quantity: number) {
  if (order.status === "approved_finance") return 0;

  return quantity;
}

function inferCondition(order: StoredOrder): ReceiveCondition {
  if (order.status === "approved_finance") return "good";
  return order.receivedCondition === "issue" ? "damaged" : "good";
}

export function buildSerialNumbers(order: StoredOrder) {
  return order.items.flatMap((item, itemIndex) =>
    Array.from(
      { length: item.quantity },
      (_, serialIndex) => `${item.code}-${itemIndex + 1}${serialIndex + 1}`,
    ),
  );
}

export function buildQrToken(orderId: string, itemCode: string, serialNumber: string) {
  return `QR-${orderId}-${itemCode}-${serialNumber}`;
}

export function buildReceiveRows(orders: StoredOrder[]): ReceiveRow[] {
  let currentIndex = 0;

  return orders.flatMap((order) =>
    order.items.map((item, itemIndex) => {
      currentIndex += 1;

      return {
        id: `${order.id}-${item.catalogId}-${itemIndex}`,
        orderId: order.id,
        orderStatus: order.status === "received_inventory" ? "received_inventory" : "approved_finance",
        requestNumber: order.requestNumber,
        index: currentIndex,
        assetName: item.name,
        itemCode: item.code,
        expectedDate: order.deliveryDate,
        category: inferCategory(item.name),
        condition: inferCondition(order),
        quantity: item.quantity,
        received: getReceivedCount(order, item.quantity),
        currencyCode: item.currencyCode,
        unitPrice: item.unitPrice,
        purchaseCost: item.totalPrice,
        selectable: order.status === "approved_finance",
      };
    }),
  );
}
