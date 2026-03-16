"use client";

import {
  generateRequestNumber,
  getTodayDateInputValue,
} from "../../_lib/order-store";
import type {
  ApprovalTarget,
  CurrencyCode,
  DepartmentOption,
} from "../../_lib/order-types";

export const DEFAULT_ORDER_REQUESTER = "Batbayar Dorj";

export type DraftOrder = {
  orderName: string;
  requestNumber: string;
  requestDate: string;
  department: DepartmentOption;
  requester: string;
  deliveryDate: string;
  approvalTarget: ApprovalTarget;
  requestedApproverId: string;
};

export type GoodsDraft = {
  id: string;
  itemName: string;
  code: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  currencyCode: CurrencyCode;
};

export function createDraftOrder(): DraftOrder {
  return {
    orderName: "",
    requestNumber: generateRequestNumber(),
    requestDate: getTodayDateInputValue(),
    department: "IT Office",
    requester: DEFAULT_ORDER_REQUESTER,
    deliveryDate: getTodayDateInputValue(),
    approvalTarget: "any_higher_ups",
    requestedApproverId: "",
  };
}

export function createGoodsDraft(): GoodsDraft {
  return {
    id: `goods-draft-${Math.random().toString(36).slice(2, 10)}`,
    itemName: "",
    code: "",
    quantity: "1",
    unit: "",
    unitPrice: "",
    currencyCode: "USD",
  };
}

export function getOffsetDateInputValue(offsetDays: number) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return nextDate.toISOString().slice(0, 10);
}
