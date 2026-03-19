"use client";

import type { CurrencyCode } from "../../_lib/order-types";

export type ReceiveCondition =
  | "good"
  | "damaged"
  | "defective"
  | "missing";

export type ReceiveStatusFilterValue = ReceiveCondition | "all";

export type ReceiveRow = {
  id: string;
  orderId: string;
  orderItemId?: string;
  catalogId: string;
  orderStatus: "approved_finance" | "received_inventory" | "assigned_hr";
  requestNumber: string;
  department: string;
  index: number;
  assetName: string;
  itemCode: string;
  expectedDate: string;
  category: string;
  condition: ReceiveCondition;
  quantity: number;
  received: number;
  currencyCode: CurrencyCode;
  unitPrice: number;
  purchaseCost: number;
  selectable: boolean;
};
