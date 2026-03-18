"use client";

export type DepartmentOption = string;

export type CurrencyCode = "USD" | "MNT" | "EUR";

export type CatalogProductStatus = "draft" | "active" | "archived";

export type CatalogCategory = {
  id: string;
  name: string;
  description: string;
};

export type CatalogItemType = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
};

export type CatalogProductAttribute = {
  id: string;
  name: string;
  value: string;
};

export type GoodsCatalogItem = {
  id: string;
  name: string;
  code: string;
  unit: string;
  categoryId: string;
  itemTypeId: string;
  defaultPrice: number;
  currencyCode: CurrencyCode;
  description: string;
  imageUrl: string | null;
  status: CatalogProductStatus;
  attributes: CatalogProductAttribute[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  catalogId: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currencyCode: CurrencyCode;
};

export type OrderStatus =
  | "pending_higher_up"
  | "rejected_higher_up"
  | "pending_finance"
  | "approved_finance"
  | "rejected_finance"
  | "received_inventory"
  | "assigned_hr";

export type ApprovalTarget = "any_higher_ups" | "finance";

export type ReceivedCondition = "complete" | "issue";

export type StoredOrder = {
  id: string;
  orderName: string;
  requestNumber: string;
  requestDate: string;
  department: DepartmentOption;
  requester: string;
  deliveryDate: string;
  approvalTarget: ApprovalTarget;
  items: OrderItem[];
  totalAmount: number;
  currencyCode: CurrencyCode;
  status: OrderStatus;
  requestedApproverId: string | null;
  requestedApproverName: string | null;
  requestedApproverRole: string | null;
  approvalMessage: string;
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
  assetIds: string[];
  assignedTo: string | null;
  assignedRole: string | null;
  assignedAt: string | null;
  userId: string;
  officeId: string;
  departmentId: string | null;
  whyOrdered: string;
  expectedArrivalAt: string | null;
  totalCost: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  orderName: string;
  requestNumber: string;
  requestDate: string;
  department: DepartmentOption;
  requester: string;
  deliveryDate: string;
  approvalTarget: ApprovalTarget;
  items: OrderItem[];
  requestedApproverId?: string | null;
  requestedApproverName?: string | null;
  requestedApproverRole?: string | null;
  approvalMessage?: string;
};

export type ReceiveOrderInput = {
  orderId: string;
  catalogId: string;
  itemCode: string;
  quantityReceived: number;
  receivedAt: string;
  receivedCondition: ReceivedCondition;
  receivedNote: string;
  storageLocation: string;
  serialNumbers: string[];
  assetIds: string[];
};

export type AssignOrderInput = {
  orderId: string;
  assignedTo: string;
  assignedRole: string;
};

export type CatalogSnapshot = {
  categories: CatalogCategory[];
  itemTypes: CatalogItemType[];
  products: GoodsCatalogItem[];
};
