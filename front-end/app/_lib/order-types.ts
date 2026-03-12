"use client";

export type DepartmentOption =
  | "IT Office"
  | "Finance Office"
  | "Human Resources"
  | "Operations"
  | "Procurement";

export type GoodsCatalogItem = {
  id: string;
  name: string;
  code: string;
  unit: string;
  defaultPrice: number;
};

export type OrderItem = {
  catalogId: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type OrderStatus =
  | "pending_higher_up"
  | "rejected_higher_up"
  | "pending_finance"
  | "approved_finance"
  | "rejected_finance"
  | "received_inventory"
  | "assigned_hr";

export type ApprovalTarget = "any_higher_ups";

export type ReceivedCondition = "complete" | "issue";

export type StoredOrder = {
  id: string;
  requestNumber: string;
  requestDate: string;
  department: DepartmentOption;
  requester: string;
  deliveryDate: string;
  approvalTarget: ApprovalTarget;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  higherUpReviewer: string | null;
  higherUpReviewedAt: string | null;
  higherUpNote: string;
  financeReviewer: string | null;
  financeReviewedAt: string | null;
  financeNote: string;
  receivedAt: string | null;
  receivedCondition: ReceivedCondition | null;
  receivedNote: string;
  storageLocation: string;
  serialNumbers: string[];
  assignedTo: string | null;
  assignedRole: string | null;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  requestNumber: string;
  requestDate: string;
  department: DepartmentOption;
  requester: string;
  deliveryDate: string;
  approvalTarget: ApprovalTarget;
  items: OrderItem[];
};

export type ReceiveOrderInput = {
  orderId: string;
  receivedAt: string;
  receivedCondition: ReceivedCondition;
  receivedNote: string;
  storageLocation: string;
  serialNumbers: string[];
};

export type AssignOrderInput = {
  orderId: string;
  assignedTo: string;
  assignedRole: string;
};
