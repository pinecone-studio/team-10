"use client";

import {
  formatDisplayDate,
  generateRequestNumber,
  getApprovalTargetLabel,
  getTodayDateInputValue,
  type OrderItem,
  type OrderStatus,
  type StoredOrder,
} from "../../_lib/order-store";
import type { ApprovalTarget, DepartmentOption } from "../../_lib/order-types";

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

export type FeedEvent = { date: string; actor: string; message: string; featured?: boolean };

export type HigherUpPosition =
  | "ceo"
  | "generalManager"
  | "cfo"
  | "coo"
  | "cto"
  | "departmentHead"
  | "departmentManager"
  | "manager";

export type HigherUpApprover = {
  initials: string;
  id: string;
  fullName: string;
  position: HigherUpPosition;
  positionLabel: string;
  department: DepartmentOption | "Executive Office";
  departmentLabel: string;
};

export function createDraftOrder(): DraftOrder {
  return {
    orderName: "",
    requestNumber: generateRequestNumber(),
    requestDate: getTodayDateInputValue(),
    department: "IT Office",
    requester: "",
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

export function createDemoItems(): OrderItem[] {
  return [
    {
      catalogId: "demo-logitech-mx-keys",
      name: "Logitech MX Keys",
      code: "LMXK001",
      unit: "pcs",
      quantity: 2,
      unitPrice: 123000,
      totalPrice: 246000,
      currencyCode: "MNT",
    },
    {
      catalogId: "demo-basketball",
      name: "Basketball",
      code: "BASK001",
      unit: "pcs",
      quantity: 1,
      unitPrice: 24324,
      totalPrice: 24324,
      currencyCode: "MNT",
    },
  ];
}

export function getOffsetDateInputValue(offsetDays: number) {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return nextDate.toISOString().slice(0, 10);
}

export function getOrderPresentation(status: OrderStatus) {
  if (status === "pending_higher_up") return { type: "Higher-up review", status: "Waiting for Any Higher-ups", tone: "border-[#d8a45d] text-[#9a5f17]" };
  if (status === "rejected_higher_up") return { type: "Higher-up review", status: "Rejected by higher-up", tone: "border-[#e2b6a1] text-[#9a5d5d]" };
  if (status === "pending_finance") return { type: "Finance review", status: "Waiting for finance", tone: "border-[#ffb06f] text-[#ff6b00]" };
  if (status === "rejected_finance") return { type: "Finance review", status: "Rejected by finance", tone: "border-[#ff8e5c] text-[#ff6b00]" };
  if (status === "approved_finance") return { type: "Approved order", status: "Allowed", tone: "border-[#59b56d] text-[#149b63]" };
  if (status === "received_inventory") return { type: "Inventory receive", status: "Received & stored", tone: "border-[#59b56d] text-[#149b63]" };
  if (status === "assigned_hr") return { type: "Distribution", status: "Assigned by HR", tone: "border-[#4d7bd6] text-[#2454b6]" };
  return { type: "Approved order", status: "Allowed", tone: "border-[#59b56d] text-[#149b63]" };
}

export function getOrderSummaryName(order: StoredOrder) {
  if (
    order.orderName.trim().length > 0 &&
    order.orderName.trim() !== "Order name"
  ) {
    return order.orderName;
  }
  if (order.items.length === 0) return order.requestNumber || "";
  if (order.items.length === 1) return order.items[0].name;
  return `${order.items[0].name} +${order.items.length - 1} more`;
}

export function getOrderSummaryMeta(order: StoredOrder) {
  return `${order.department} - ${order.requester || "Requester"}`;
}

export function buildFeedEvents(order: StoredOrder): FeedEvent[] {
  const events: FeedEvent[] = [
    { date: formatDisplayDate(order.createdAt.slice(0, 10)), actor: order.requester, message: "created a new order." },
    {
      date: formatDisplayDate(order.createdAt.slice(0, 10)),
      actor: order.requester,
      message: `submitted the order to ${getApprovalTargetLabel(order.approvalTarget)}.`,
    },
  ];
  if (order.higherUpReviewedAt) {
    events.unshift({
      date: formatDisplayDate(order.higherUpReviewedAt.slice(0, 10)),
      actor: order.higherUpReviewer ?? "Any Higher-ups",
      message: order.status === "rejected_higher_up"
        ? "rejected the permission request."
        : "approved the request and forwarded it to Finance.",
      featured: true,
    });
  }
  if (order.financeReviewedAt) {
    events.unshift({
      date: formatDisplayDate(order.financeReviewedAt.slice(0, 10)),
      actor: order.financeReviewer ?? "Finance",
      message: order.status === "rejected_finance"
        ? "rejected the order request."
        : "approved the budget and purchase request.",
      featured: true,
    });
  }
  if (order.receivedAt) events.unshift({ date: formatDisplayDate(order.receivedAt.slice(0, 10)), actor: "Inventory Head", message: "received and stored the purchased goods.", featured: true });
  if (order.assignedAt) events.unshift({ date: formatDisplayDate(order.assignedAt.slice(0, 10)), actor: "HR Manager", message: `assigned the goods to ${order.assignedTo}.`, featured: true });
  return events;
}

export function getProgressLabels(status: OrderStatus) {
  return [
    "Create an order",
    status === "rejected_higher_up" ? "Higher-up rejected" : status === "pending_higher_up" ? "Higher-up review" : "Higher-up approved",
    status === "rejected_finance" ? "Finance rejected" : status === "pending_finance" ? "Finance review" : "Finance approved",
    status === "assigned_hr" || status === "received_inventory" ? "Received & stored" : "Inventory receive",
    status === "assigned_hr" ? "Assigned" : "Distribution",
  ];
}

const higherUpApprovers: HigherUpApprover[] = [
  {
    initials: "AS",
    id: "approvee-ceo",
    fullName: "Ariunsanaa Sukhbaatar",
    position: "ceo",
    positionLabel: "CEO",
    department: "Executive Office",
    departmentLabel: "Executive office",
  },
  {
    initials: "NE",
    id: "approvee-general-manager",
    fullName: "Narmandakh Erdene",
    position: "generalManager",
    positionLabel: "General Manager",
    department: "Executive Office",
    departmentLabel: "Executive office",
  },
  {
    initials: "ER",
    id: "approvee-cfo",
    fullName: "Erdenechimeg Rentsen",
    position: "cfo",
    positionLabel: "CFO",
    department: "Finance Office",
    departmentLabel: "Finance office",
  },
  {
    initials: "AP",
    id: "approvee-coo",
    fullName: "Anujin Purevdorj",
    position: "coo",
    positionLabel: "COO",
    department: "Operations",
    departmentLabel: "Operations",
  },
  {
    initials: "MB",
    id: "approvee-cto",
    fullName: "Munkh-Erdene Battsengel",
    position: "cto",
    positionLabel: "CTO",
    department: "IT Office",
    departmentLabel: "Information technology",
  },
  {
    initials: "GB",
    id: "approvee-it-head",
    fullName: "Ganbold Batjargal",
    position: "departmentHead",
    positionLabel: "Department Head",
    department: "IT Office",
    departmentLabel: "Information technology",
  },
  {
    initials: "SG",
    id: "approvee-hr-manager",
    fullName: "Sarnai Gombo",
    position: "manager",
    positionLabel: "HR Manager",
    department: "Human Resources",
    departmentLabel: "Human resources",
  },
  {
    initials: "BL",
    id: "approvee-operations-manager",
    fullName: "Bilegt Lkhagva",
    position: "manager",
    positionLabel: "Operations Manager",
    department: "Operations",
    departmentLabel: "Operations",
  },
  {
    initials: "TM",
    id: "approvee-procurement-manager",
    fullName: "Temuulen Munkh",
    position: "departmentManager",
    positionLabel: "Procurement Manager",
    department: "Procurement",
    departmentLabel: "Procurement",
  },
];

function getApproverRank(
  approver: HigherUpApprover,
  department: DepartmentOption,
) {
  if (approver.department === department) return 0;
  if (
    approver.position === "ceo" ||
    approver.position === "generalManager" ||
    approver.position === "cfo" ||
    approver.position === "coo" ||
    approver.position === "cto"
  ) {
    return 1;
  }

  return 2;
}

export function getHigherUpApproverOptions(department: DepartmentOption) {
  return [...higherUpApprovers].sort((left, right) => {
    const rankDifference =
      getApproverRank(left, department) - getApproverRank(right, department);

    if (rankDifference !== 0) return rankDifference;
    return left.fullName.localeCompare(right.fullName);
  });
}

export function getHigherUpApproverById(approverId: string) {
  return higherUpApprovers.find((approver) => approver.id === approverId) ?? null;
}

export function getDefaultHigherUpApproverId(department: DepartmentOption) {
  return getHigherUpApproverOptions(department)[0]?.id ?? "";
}
