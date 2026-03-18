"use client";

export type ReceiveCondition =
  | "good"
  | "damaged"
  | "defective"
  | "missing";

export type ReceiveRow = {
  id: string;
  orderId: string;
  orderStatus: "approved_finance" | "received_inventory";
  requestNumber: string;
  index: number;
  assetName: string;
  itemCode: string;
  expectedDate: string;
  category: string;
  condition: ReceiveCondition;
  quantity: number;
  received: number;
  currencyCode: "USD" | "MNT" | "EUR";
  unitPrice: number;
  purchaseCost: number;
  selectable: boolean;
};
