"use client";

import {
  generateRequestNumber,
  getTodayDateInputValue,
} from "../../_lib/order-store";
import type { ApprovalTarget, DepartmentOption } from "../../_lib/order-types";

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
  selectedCatalogProductId: string | null;
  quantity: string;
  unitPrice: string;
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
    selectedCatalogProductId: null,
    quantity: "1",
    unitPrice: "",
  };
}

export function getOffsetDateInputValue(offsetDays: number) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return nextDate.toISOString().slice(0, 10);
}
