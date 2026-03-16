"use client";

import type { OrderItem } from "../../_lib/order-types";
import { formatDisplayDate } from "../../_lib/order-store";

export function formatLongRequestDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return formatDisplayDate(value);
  const day = date.getDate();
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return date.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" }).replace(`${day},`, `${day}${suffix},`);
}

export function createTotalRows(items: OrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  return { subtotal, tax, grandTotal: subtotal + tax };
}
