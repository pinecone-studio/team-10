"use client";

export type ReceiveCondition =
  | "good"
  | "damaged"
  | "defective"
  | "missing";

export type ReceiveRow = {
  id: string;
  orderId: string;
  index: number;
  assetName: string;
  requestDate: string;
  category: string;
  condition: ReceiveCondition;
  quantity: number;
  received: number;
  purchaseCost: number;
  selectable: boolean;
};
