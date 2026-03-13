"use client";

import { gql } from "@apollo/client/core";
import { apolloClient } from "@/app/providers/apolloClient";
import type {
  CreateOrderInput,
  CurrencyCode,
  OrderItem,
  OrderStatus,
  ReceivedCondition,
  StoredOrder,
} from "@/app/_lib/order-types";

type OrderItemDto = {
  id: string;
  catalogId: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currencyCode: string;
};

type OrderDto = {
  id: string;
  orderName: string;
  requestNumber: string;
  requestDate: string;
  department: string;
  requester: string;
  deliveryDate: string;
  approvalTarget: string;
  items: OrderItemDto[];
  totalAmount: number;
  currencyCode: string;
  status: string;
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
  receivedCondition: string | null;
  receivedNote: string;
  storageLocation: string;
  serialNumbers: string[];
  assignedTo: string | null;
  assignedRole: string | null;
  assignedAt: string | null;
  userId: string;
  officeId: string;
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
  whyOrdered: string;
  expectedArrivalAt: string | null;
  totalCost: number | null;
};

export type CreateOrderRequestInput = CreateOrderInput;

export type UpdateOrderRequestInput = {
  orderName?: string | null;
  requestNumber?: string | null;
  requestDate?: string | null;
  requester?: string | null;
  userId?: string | null;
  officeId?: string | null;
  departmentId?: string | null;
  department?: string | null;
  whyOrdered?: string | null;
  status?: OrderStatus | null;
  approvalTarget?: string | null;
  deliveryDate?: string | null;
  totalAmount?: number | null;
  currencyCode?: CurrencyCode | null;
  requestedApproverId?: string | null;
  requestedApproverName?: string | null;
  requestedApproverRole?: string | null;
  approvalMessage?: string | null;
  higherUpReviewer?: string | null;
  higherUpReviewedAt?: string | null;
  higherUpNote?: string | null;
  financeReviewer?: string | null;
  financeReviewedAt?: string | null;
  financeNote?: string | null;
  receivedAt?: string | null;
  receivedCondition?: ReceivedCondition | null;
  receivedNote?: string | null;
  storageLocation?: string | null;
  serialNumbers?: string[] | null;
  assignedTo?: string | null;
  assignedRole?: string | null;
  assignedAt?: string | null;
  items?: OrderItem[] | null;
};

const orderFieldsFragment = gql`
  fragment OrderFields on Order {
    id
    orderName
    requestNumber
    requestDate
    department
    requester
    deliveryDate
    approvalTarget
    totalAmount
    currencyCode
    status
    requestedApproverId
    requestedApproverName
    requestedApproverRole
    approvalMessage
    higherUpReviewer
    higherUpReviewedAt
    higherUpNote
    financeReviewer
    financeReviewedAt
    financeNote
    receivedAt
    receivedCondition
    receivedNote
    storageLocation
    serialNumbers
    assignedTo
    assignedRole
    assignedAt
    userId
    officeId
    departmentId
    createdAt
    updatedAt
    whyOrdered
    expectedArrivalAt
    totalCost
    items {
      id
      catalogId
      name
      code
      unit
      quantity
      unitPrice
      totalPrice
      currencyCode
    }
  }
`;

const ordersQuery = gql`
  ${orderFieldsFragment}

  query Orders {
    orders {
      ...OrderFields
    }
  }
`;

const createOrderMutation = gql`
  ${orderFieldsFragment}

  mutation CreateOrder(
    $orderName: String!
    $requestNumber: String
    $requestDate: String
    $requester: String
    $department: String
    $approvalTarget: String
    $deliveryDate: String
    $currencyCode: String
    $requestedApproverId: String
    $requestedApproverName: String
    $requestedApproverRole: String
    $approvalMessage: String
    $items: [OrderItemInput!]
  ) {
    createOrder(
      orderName: $orderName
      requestNumber: $requestNumber
      requestDate: $requestDate
      requester: $requester
      department: $department
      approvalTarget: $approvalTarget
      deliveryDate: $deliveryDate
      currencyCode: $currencyCode
      requestedApproverId: $requestedApproverId
      requestedApproverName: $requestedApproverName
      requestedApproverRole: $requestedApproverRole
      approvalMessage: $approvalMessage
      items: $items
    ) {
      ...OrderFields
    }
  }
`;

const updateOrderMutation = gql`
  ${orderFieldsFragment}

  mutation UpdateOrder(
    $id: ID!
    $orderName: String
    $requestNumber: String
    $requestDate: String
    $requester: String
    $userId: ID
    $officeId: ID
    $departmentId: ID
    $department: String
    $whyOrdered: String
    $status: String
    $approvalTarget: String
    $deliveryDate: String
    $totalAmount: Float
    $currencyCode: String
    $requestedApproverId: String
    $requestedApproverName: String
    $requestedApproverRole: String
    $approvalMessage: String
    $higherUpReviewer: String
    $higherUpReviewedAt: String
    $higherUpNote: String
    $financeReviewer: String
    $financeReviewedAt: String
    $financeNote: String
    $receivedAt: String
    $receivedCondition: String
    $receivedNote: String
    $storageLocation: String
    $serialNumbers: [String!]
    $assignedTo: String
    $assignedRole: String
    $assignedAt: String
    $items: [OrderItemInput!]
  ) {
    updateOrder(
      id: $id
      orderName: $orderName
      requestNumber: $requestNumber
      requestDate: $requestDate
      requester: $requester
      userId: $userId
      officeId: $officeId
      departmentId: $departmentId
      department: $department
      whyOrdered: $whyOrdered
      status: $status
      approvalTarget: $approvalTarget
      deliveryDate: $deliveryDate
      totalAmount: $totalAmount
      currencyCode: $currencyCode
      requestedApproverId: $requestedApproverId
      requestedApproverName: $requestedApproverName
      requestedApproverRole: $requestedApproverRole
      approvalMessage: $approvalMessage
      higherUpReviewer: $higherUpReviewer
      higherUpReviewedAt: $higherUpReviewedAt
      higherUpNote: $higherUpNote
      financeReviewer: $financeReviewer
      financeReviewedAt: $financeReviewedAt
      financeNote: $financeNote
      receivedAt: $receivedAt
      receivedCondition: $receivedCondition
      receivedNote: $receivedNote
      storageLocation: $storageLocation
      serialNumbers: $serialNumbers
      assignedTo: $assignedTo
      assignedRole: $assignedRole
      assignedAt: $assignedAt
      items: $items
    ) {
      ...OrderFields
    }
  }
`;

function parseCurrencyCode(value: string): CurrencyCode {
  if (value === "USD" || value === "EUR" || value === "MNT") {
    return value;
  }

  return "MNT";
}

function parseApprovalTarget(value: string): StoredOrder["approvalTarget"] {
  return value === "finance" ? "finance" : "any_higher_ups";
}

function parseOrderStatus(value: string): OrderStatus {
  if (
    value === "pending_higher_up" ||
    value === "rejected_higher_up" ||
    value === "pending_finance" ||
    value === "approved_finance" ||
    value === "rejected_finance" ||
    value === "received_inventory" ||
    value === "assigned_hr"
  ) {
    return value;
  }

  return "pending_higher_up";
}

function parseReceivedCondition(value: string | null): ReceivedCondition | null {
  if (value === "complete" || value === "issue") {
    return value;
  }

  return null;
}

function mapOrderItem(item: OrderItemDto): OrderItem {
  return {
    catalogId: item.catalogId,
    name: item.name,
    code: item.code,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    currencyCode: parseCurrencyCode(item.currencyCode),
  };
}

function mapOrder(order: OrderDto): StoredOrder {
  return {
    id: order.id,
    orderName: order.orderName,
    requestNumber: order.requestNumber,
    requestDate: order.requestDate,
    department: order.department,
    requester: order.requester,
    deliveryDate: order.deliveryDate,
    approvalTarget: parseApprovalTarget(order.approvalTarget),
    items: order.items.map(mapOrderItem),
    totalAmount: order.totalAmount,
    currencyCode: parseCurrencyCode(order.currencyCode),
    status: parseOrderStatus(order.status),
    requestedApproverId: order.requestedApproverId,
    requestedApproverName: order.requestedApproverName,
    requestedApproverRole: order.requestedApproverRole,
    approvalMessage: order.approvalMessage ?? "",
    higherUpReviewer: order.higherUpReviewer,
    higherUpReviewedAt: order.higherUpReviewedAt,
    higherUpNote: order.higherUpNote ?? "",
    financeReviewer: order.financeReviewer,
    financeReviewedAt: order.financeReviewedAt,
    financeNote: order.financeNote ?? "",
    receivedAt: order.receivedAt,
    receivedCondition: parseReceivedCondition(order.receivedCondition),
    receivedNote: order.receivedNote ?? "",
    storageLocation: order.storageLocation ?? "",
    serialNumbers: Array.isArray(order.serialNumbers) ? order.serialNumbers : [],
    assignedTo: order.assignedTo,
    assignedRole: order.assignedRole,
    assignedAt: order.assignedAt,
    userId: order.userId,
    officeId: order.officeId,
    departmentId: order.departmentId,
    whyOrdered: order.whyOrdered ?? "",
    expectedArrivalAt: order.expectedArrivalAt,
    totalCost: order.totalCost ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function mapOrderItemInput(item: OrderItem) {
  return {
    catalogId: item.catalogId || null,
    name: item.name,
    code: item.code,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    currencyCode: item.currencyCode,
  };
}

export async function fetchOrdersRequest() {
  const { data } = await apolloClient.query<{ orders: OrderDto[] }>({
    query: ordersQuery,
    fetchPolicy: "no-cache",
  });

  return (data?.orders ?? []).map(mapOrder);
}

export async function createOrderRequest(input: CreateOrderRequestInput) {
  const { data } = await apolloClient.mutate<{ createOrder: OrderDto }>({
    mutation: createOrderMutation,
    variables: {
      orderName: input.orderName.trim(),
      requestNumber: input.requestNumber.trim() || null,
      requestDate: input.requestDate,
      requester: input.requester.trim(),
      department: input.department,
      approvalTarget: input.approvalTarget,
      deliveryDate: input.deliveryDate,
      currencyCode: input.currencyCode,
      requestedApproverId: input.requestedApproverId?.trim() || null,
      requestedApproverName: input.requestedApproverName?.trim() || null,
      requestedApproverRole: input.requestedApproverRole?.trim() || null,
      approvalMessage: input.approvalMessage?.trim() || null,
      items: input.items.map(mapOrderItemInput),
    },
    fetchPolicy: "no-cache",
  });

  if (!data?.createOrder) {
    throw new Error("Failed to create order.");
  }

  return mapOrder(data.createOrder);
}

export async function updateOrderRequest(
  id: string,
  input: UpdateOrderRequestInput,
) {
  const { data } = await apolloClient.mutate<{ updateOrder: OrderDto | null }>({
    mutation: updateOrderMutation,
    variables: {
      id,
      ...input,
      items: input.items?.map(mapOrderItemInput),
    },
    fetchPolicy: "no-cache",
  });

  return data?.updateOrder ? mapOrder(data.updateOrder) : null;
}
