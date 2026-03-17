"use client";

export type ReceiveCondition =
  | "new"
  | "good"
  | "minorDamage"
  | "damaged"
  | "defective";

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
