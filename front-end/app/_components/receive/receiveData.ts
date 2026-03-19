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
  function parseRequestNumber(requestNumber: string) {
    const match = /^REQ-(\d{8})-(\d+)$/.exec(requestNumber.trim());
    if (!match) {
      return null;
    }

    return {
      dateNumber: Number(match[1]),
      sequenceNumber: Number(match[2]),
    };
  }

  const sortedOrders = [...orders].sort((left, right) => {
    const leftRequestNumber = parseRequestNumber(left.requestNumber);
    const rightRequestNumber = parseRequestNumber(right.requestNumber);

    if (leftRequestNumber && rightRequestNumber) {
      const requestDateCompare =
        rightRequestNumber.dateNumber - leftRequestNumber.dateNumber;
      if (requestDateCompare !== 0) {
        return requestDateCompare;
      }

      const requestSequenceCompare =
        rightRequestNumber.sequenceNumber - leftRequestNumber.sequenceNumber;
      if (requestSequenceCompare !== 0) {
        return requestSequenceCompare;
      }
    }

    const updatedAtCompare = right.updatedAt.localeCompare(left.updatedAt);
    if (updatedAtCompare !== 0) {
      return updatedAtCompare;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });

  let currentIndex = 0;

  return sortedOrders.flatMap((order) =>
    order.items.map((item, itemIndex) => {
      currentIndex += 1;

      return {
        id: `${order.id}-${item.catalogId}-${itemIndex}`,
        orderId: order.id,
        orderItemId: item.id,
        catalogId: item.catalogId,
        orderStatus:
          order.status === "assigned_hr"
            ? "assigned_hr"
            : order.status === "received_inventory"
              ? "received_inventory"
              : "approved_finance",
        requestNumber: order.requestNumber,
        department: order.department,
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
