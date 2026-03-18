"use client";

import type { CurrencyCode } from "./order-types";

export const currencyOptions: Array<{
  code: CurrencyCode;
  label: string;
  symbol: string;
}> = [
  { code: "USD", label: "US Dollar", symbol: "$" },
];

export function getCurrencySymbol(currencyCode: CurrencyCode) {
  return (
    currencyOptions.find((option) => option.code === currencyCode)?.symbol ??
    "$"
  );
}

export function formatCurrency(
  value: number,
  currencyCode: CurrencyCode = "USD",
) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${getCurrencySymbol(currencyCode)}${new Intl.NumberFormat("en-US").format(safeValue)}`;
}

export function getTodayDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${year}.${month}.${day}`;
}
