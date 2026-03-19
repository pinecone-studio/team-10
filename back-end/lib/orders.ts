import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  approvalQueueValues,
  catalogCategories,
  catalogItemTypes,
  catalogProducts,
  currencyCodeValues,
  departments,
  notifications,
  orderItems,
  orders,
  orderStatusValues,
  receivedConditionValues,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import {
  parseIntegerId,
  resolveDepartmentId,
  resolveOfficeId,
  resolveUserId,
} from "./reference-resolvers.ts";

type DbOrderStatus = (typeof orderStatusValues)[number];
type DbApprovalQueue = (typeof approvalQueueValues)[number];
type CurrencyCode = (typeof currencyCodeValues)[number];
type ReceivedCondition = (typeof receivedConditionValues)[number];

export type FrontOrderStatus =
  | "pending_finance"
  | "approved_finance"
  | "rejected_finance"
  | "received_inventory"
  | "assigned_hr";

export type FrontApprovalTarget = "finance";

type OrderRow = {
  id: number;
  orderName: string;
  requestNumber: string | null;
  requestDate: string | null;
  requesterName: string | null;
  userId: number;
  officeId: number;
  departmentId: number | null;
  departmentName: string | null;
  whyOrdered: string;
  status: DbOrderStatus;
  approvalTarget: DbApprovalQueue;
  expectedArrivalAt: string | null;
  totalCost: number | null;
  currencyCode: CurrencyCode;
  requestedApproverId: string | null;
  requestedApproverName: string | null;
  requestedApproverRole: string | null;
  approvalMessage: string | null;
  higherUpReviewer: string | null;
  higherUpReviewedAt: string | null;
  higherUpNote: string | null;
  financeReviewer: string | null;
  financeReviewedAt: string | null;
  financeNote: string | null;
  receivedAt: string | null;
  receivedCondition: ReceivedCondition | null;
  receivedNote: string | null;
  storageLocation: string | null;
  serialNumbersJson: string | null;
  assignedTo: string | null;
  assignedRole: string | null;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type OrderItemRow = {
  id: number;
  orderId: number;
  catalogProductId: number | null;
  itemName: string;
  itemCode: string;
  unit: string;
  quantity: number;
  unitCost: number;
  currencyCode: CurrencyCode;
};

type CatalogProductContextRow = {
  id: number;
  displayName: string;
  productCode: string;
  unit: string;
  defaultCurrencyCode: CurrencyCode;
  itemTypeName: string;
  categoryName: string;
};

export type OrderLineItemRecord = {
  id: string;
  catalogId: string;
  name: string;
  code: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currencyCode: CurrencyCode;
};

export type OrderRecord = {
  id: string;
  orderName: string;
  whyOrdered: string;
  expectedArrivalAt: string | null;
  totalCost: number | null;
  requestNumber: string;
  requestDate: string;
  department: string;
  requester: string;
  deliveryDate: string;
  approvalTarget: FrontApprovalTarget;
  items: OrderLineItemRecord[];
  totalAmount: number;
  currencyCode: CurrencyCode;
  status: FrontOrderStatus;
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
  assignedTo: string | null;
  assignedRole: string | null;
  assignedAt: string | null;
  userId: string;
  officeId: string;
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderLineItemInput = {
  catalogId?: string | null;
  name: string;
  code: string;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
  currencyCode?: string | null;
  category?: string | null;
  itemType?: string | null;
  fromWhere?: string | null;
  additionalNotes?: string | null;
  eta?: string | null;
};

export type CreateOrderInput = {
  orderName: string;
  requestNumber?: string | null;
  requestDate?: string | null;
  requester?: string | null;
  userId?: string | null;
  officeId?: string | null;
  departmentId?: string | null;
  department?: string | null;
  whyOrdered?: string | null;
  status?: string | null;
  approvalTarget?: string | null;
  deliveryDate?: string | null;
  totalAmount?: number | null;
  currencyCode?: string | null;
  requestedApproverId?: string | null;
  requestedApproverName?: string | null;
  requestedApproverRole?: string | null;
  approvalMessage?: string | null;
  items?: OrderLineItemInput[] | null;
};

export type UpdateOrderInput = {
  orderName?: string | null;
  requestNumber?: string | null;
  requestDate?: string | null;
  requester?: string | null;
  userId?: string | null;
  officeId?: string | null;
  departmentId?: string | null;
  department?: string | null;
  whyOrdered?: string | null;
  status?: string | null;
  approvalTarget?: string | null;
  deliveryDate?: string | null;
  totalAmount?: number | null;
  currencyCode?: string | null;
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
  receivedCondition?: string | null;
  receivedNote?: string | null;
  storageLocation?: string | null;
  serialNumbers?: string[] | null;
  assignedTo?: string | null;
  assignedRole?: string | null;
  assignedAt?: string | null;
  items?: OrderLineItemInput[] | null;
};

const orderSelection = {
  id: orders.id,
  orderName: orders.orderName,
  requestNumber: orders.requestNumber,
  requestDate: orders.requestDate,
  requesterName: orders.requesterName,
  userId: orders.userId,
  officeId: orders.officeId,
  departmentId: orders.departmentId,
  departmentName: departments.departmentName,
  whyOrdered: orders.whyOrdered,
  status: orders.status,
  approvalTarget: orders.approvalTarget,
  expectedArrivalAt: orders.expectedArrivalAt,
  totalCost: orders.totalCost,
  currencyCode: orders.currencyCode,
  requestedApproverId: orders.requestedApproverId,
  requestedApproverName: orders.requestedApproverName,
  requestedApproverRole: orders.requestedApproverRole,
  approvalMessage: orders.approvalMessage,
  higherUpReviewer: orders.higherUpReviewer,
  higherUpReviewedAt: orders.higherUpReviewedAt,
  higherUpNote: orders.higherUpNote,
  financeReviewer: orders.financeReviewer,
  financeReviewedAt: orders.financeReviewedAt,
  financeNote: orders.financeNote,
  receivedAt: orders.receivedAt,
  receivedCondition: orders.receivedCondition,
  receivedNote: orders.receivedNote,
  storageLocation: orders.storageLocation,
  serialNumbersJson: orders.serialNumbersJson,
  assignedTo: orders.assignedTo,
  assignedRole: orders.assignedRole,
  assignedAt: orders.assignedAt,
  createdAt: orders.createdAt,
  updatedAt: orders.updatedAt,
};

const orderItemSelection = {
  id: orderItems.id,
  orderId: orderItems.orderId,
  catalogProductId: orderItems.catalogProductId,
  itemName: orderItems.itemName,
  itemCode: orderItems.itemCode,
  unit: orderItems.unit,
  quantity: orderItems.quantity,
  unitCost: orderItems.unitCost,
  currencyCode: orderItems.currencyCode,
};

function mapDbStatusToFront(status: DbOrderStatus): FrontOrderStatus {
  if (status === "pendingFinanceApproval") return "pending_finance";
  if (status === "rejectedByFinance") return "rejected_finance";
  if (
    status === "financeApproved" ||
    status === "ordered" ||
    status === "partiallyReceived"
  ) {
    return "approved_finance";
  }
  if (status === "received") {
    return "received_inventory";
  }
  return "assigned_hr";
}

function parseOrderStatus(
  status?: string | null,
  fallback: DbOrderStatus = "pendingFinanceApproval",
): DbOrderStatus {
  if (!status) return fallback;

  const normalizedStatusMap: Record<string, DbOrderStatus> = {
    pending_higher_up: "pendingFinanceApproval",
    pendingHigherUpApproval: "pendingFinanceApproval",
    rejected_higher_up: "rejectedByFinance",
    rejectedByHigherUp: "rejectedByFinance",
    pending_finance: "pendingFinanceApproval",
    pendingFinanceApproval: "pendingFinanceApproval",
    rejected_finance: "rejectedByFinance",
    rejectedByFinance: "rejectedByFinance",
    approved_finance: "financeApproved",
    financeApproved: "financeApproved",
    ordered: "ordered",
    received_inventory: "received",
    received: "received",
    partiallyReceived: "partiallyReceived",
    assigned_hr: "closed",
    closed: "closed",
  };

  const parsedStatus = normalizedStatusMap[status];
  if (!parsedStatus) {
    throw new Error(
      "Order status must be a supported workflow value.",
    );
  }

  return parsedStatus;
}

function mapApprovalTargetToFront(approvalTarget?: DbApprovalQueue): FrontApprovalTarget {
  void approvalTarget;
  return "finance";
}

function parseApprovalTarget(
  approvalTarget?: string | null,
): DbApprovalQueue {
  if (!approvalTarget) return "finance";
  if (approvalTarget === "any_higher_ups") return "finance";
  if (approvalTarget === "finance") return "finance";

  if (!approvalQueueValues.includes(approvalTarget as DbApprovalQueue)) {
    throw new Error(
      `Approval target must be one of: finance, ${approvalQueueValues.join(", ")}.`,
    );
  }

  return approvalTarget as DbApprovalQueue;
}

function parseCurrencyCode(): CurrencyCode {
  return "USD";
}

function parseReceivedCondition(
  receivedCondition?: string | null,
): ReceivedCondition | null {
  if (receivedCondition === undefined || receivedCondition === null) {
    return null;
  }

  if (!receivedConditionValues.includes(receivedCondition as ReceivedCondition)) {
    throw new Error(
      `Received condition must be one of: ${receivedConditionValues.join(", ")}.`,
    );
  }

  return receivedCondition as ReceivedCondition;
}

function parseOrderName(orderName: string): string {
  const trimmedOrderName = orderName.trim();

  if (trimmedOrderName.length === 0) {
    throw new Error("Order name is required.");
  }

  return trimmedOrderName;
}

function parseRequesterName(requester?: string | null): string {
  return requester?.trim() ?? "";
}

function parseStringArray(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function mapOrderItem(row: OrderItemRow): OrderLineItemRecord {
  return {
    id: String(row.id),
    catalogId: row.catalogProductId === null ? "" : String(row.catalogProductId),
    name: row.itemName,
    code: row.itemCode,
    unit: row.unit,
    quantity: row.quantity,
    unitPrice: row.unitCost,
    totalPrice: row.quantity * row.unitCost,
    currencyCode: "USD",
  };
}

function mapOrder(
  row: OrderRow,
  items: OrderLineItemRecord[],
): OrderRecord {
  const requestDate = row.requestDate ?? row.createdAt.slice(0, 10);
  const fallbackRequestNumber = `REQ-${requestDate.replaceAll("-", "")}-${String(
    row.id,
  ).padStart(3, "0")}`;

  return {
    id: String(row.id),
    orderName: row.orderName,
    whyOrdered: row.whyOrdered,
    expectedArrivalAt: row.expectedArrivalAt,
    totalCost:
      row.totalCost ?? items.reduce((sum, item) => sum + item.totalPrice, 0),
    requestNumber: row.requestNumber ?? fallbackRequestNumber,
    requestDate,
    department: row.departmentName ?? "IT Office",
    requester: row.requesterName ?? "",
    deliveryDate: row.expectedArrivalAt ?? requestDate,
    approvalTarget: mapApprovalTargetToFront(row.approvalTarget),
    items,
    totalAmount:
      row.totalCost ?? items.reduce((sum, item) => sum + item.totalPrice, 0),
    currencyCode: "USD",
    status: mapDbStatusToFront(row.status),
    requestedApproverId: row.requestedApproverId,
    requestedApproverName: row.requestedApproverName,
    requestedApproverRole: row.requestedApproverRole,
    approvalMessage: row.approvalMessage ?? "",
    higherUpReviewer: row.higherUpReviewer,
    higherUpReviewedAt: row.higherUpReviewedAt,
    higherUpNote: row.higherUpNote ?? "",
    financeReviewer: row.financeReviewer,
    financeReviewedAt: row.financeReviewedAt,
    financeNote: row.financeNote ?? "",
    receivedAt: row.receivedAt,
    receivedCondition: row.receivedCondition,
    receivedNote: row.receivedNote ?? "",
    storageLocation: row.storageLocation ?? "",
    serialNumbers: parseStringArray(row.serialNumbersJson),
    assignedTo: row.assignedTo,
    assignedRole: row.assignedRole,
    assignedAt: row.assignedAt,
    userId: String(row.userId),
    officeId: String(row.officeId),
    departmentId: row.departmentId === null ? null : String(row.departmentId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listOrderItemsByOrderIds(
  db: AppDb,
  orderIds: number[],
) {
  const itemsByOrderId = new Map<number, OrderLineItemRecord[]>();

  if (orderIds.length === 0) return itemsByOrderId;

  const rows = await db
    .select(orderItemSelection)
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.orderId), asc(orderItems.id));

  for (const row of rows) {
    if (row.quantity <= 0) {
      continue;
    }

    const mappedItem = mapOrderItem(row);
    const existingItems = itemsByOrderId.get(row.orderId) ?? [];
    existingItems.push(mappedItem);
    itemsByOrderId.set(row.orderId, existingItems);
  }

  return itemsByOrderId;
}

async function getCatalogProductContext(
  db: AppDb,
  catalogId?: string | null,
): Promise<CatalogProductContextRow | null> {
  if (!catalogId) return null;

  const numericCatalogId = parseIntegerId("catalogId", catalogId);

  const [row] = await db
    .select({
      id: catalogProducts.id,
      displayName: catalogProducts.displayName,
      productCode: catalogProducts.productCode,
      unit: catalogProducts.unit,
      defaultCurrencyCode: catalogProducts.defaultCurrencyCode,
      itemTypeName: catalogItemTypes.displayName,
      categoryName: catalogCategories.displayName,
    })
    .from(catalogProducts)
    .innerJoin(
      catalogItemTypes,
      eq(catalogProducts.itemTypeId, catalogItemTypes.id),
    )
    .innerJoin(
      catalogCategories,
      eq(catalogItemTypes.categoryId, catalogCategories.id),
    )
    .where(eq(catalogProducts.id, numericCatalogId))
    .limit(1);

  return row ?? null;
}

async function buildOrderItemValues(
  db: AppDb,
  orderId: number,
  item: OrderLineItemInput,
) {
  const catalogProduct = await getCatalogProductContext(db, item.catalogId);
  const quantity = Number(item.quantity);
  const unitPrice = Number(item.unitPrice);

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Order item quantity must be a positive integer.");
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new Error("Order item unit price must be a non-negative number.");
  }

  const itemName =
    item.name.trim() || catalogProduct?.displayName || "Order item";
  const itemCode =
    item.code.trim().toUpperCase() || catalogProduct?.productCode || "ITEM";

  if (!itemName) {
    throw new Error("Order item name is required.");
  }

  if (!itemCode) {
    throw new Error("Order item code is required.");
  }

  return {
    orderId,
    itemName,
    itemCode,
    category:
      item.category?.trim() || catalogProduct?.categoryName || "General",
    itemType:
      item.itemType?.trim() || catalogProduct?.itemTypeName || "General",
    unit: item.unit?.trim() || catalogProduct?.unit || "pcs",
    catalogCategoryId: null,
    catalogItemTypeId: null,
    catalogProductId: catalogProduct?.id ?? null,
    quantity,
    unitCost: unitPrice,
    currencyCode: parseCurrencyCode(),
    fromWhere: item.fromWhere?.trim() || "catalog",
    additionalNotes: item.additionalNotes?.trim() || null,
    eta: item.eta ?? null,
  } satisfies typeof orderItems.$inferInsert;
}

async function replaceOrderItems(
  db: AppDb,
  orderId: number,
  items: OrderLineItemInput[],
) {
  await db.delete(orderItems).where(eq(orderItems.orderId, orderId)).run();

  if (items.length === 0) return;

  const values = [];
  for (const item of items) {
    values.push(await buildOrderItemValues(db, orderId, item));
  }

  await db.insert(orderItems).values(values).run();
}

async function resolveDepartmentForOrder(
  db: AppDb,
  departmentId?: string | null,
  departmentName?: string | null,
) {
  try {
    if (departmentId !== undefined && departmentId !== null) {
      return resolveDepartmentId(db, departmentId);
    }

    const trimmedDepartmentName = departmentName?.trim() ?? "";
    if (!trimmedDepartmentName) {
      return resolveDepartmentId(db, undefined);
    }

    const [existingDepartment] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.departmentName, trimmedDepartmentName))
      .limit(1);

    if (existingDepartment) {
      return existingDepartment.id;
    }

    await db
      .insert(departments)
      .values({
        departmentName: trimmedDepartmentName,
        description: "Auto-created for order workflow persistence",
      })
      .run();

    const [createdDepartment] = await db
      .select({ id: departments.id })
      .from(departments)
      .where(eq(departments.departmentName, trimmedDepartmentName))
      .limit(1);

    if (!createdDepartment) {
      throw new Error("Failed to create the selected department.");
    }

    return createdDepartment.id;
  } catch (error) {
    console.warn(
      `resolveDepartmentForOrder fallback triggered for ${departmentName ?? departmentId ?? "default"}.`,
      error,
    );
    return departmentId?.trim() ? parseIntegerId("departmentId", departmentId) : 1;
  }
}

function getRequestPrefix(requestDate: string) {
  return `REQ-${requestDate.replaceAll("-", "")}`;
}

async function buildUniqueRequestNumber(
  db: AppDb,
  requestDate: string,
  providedRequestNumber?: string | null,
  excludeOrderId?: number,
) {
  const trimmedRequestNumber = providedRequestNumber?.trim().toUpperCase() ?? "";
  const prefix = getRequestPrefix(requestDate);

  try {
    if (trimmedRequestNumber) {
      const requestNumberMatches = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.requestNumber, trimmedRequestNumber))
        .limit(1);

      const conflictingRow = requestNumberMatches.find(
        (row) => excludeOrderId === undefined || row.id !== excludeOrderId,
      );

      if (!conflictingRow) {
        return trimmedRequestNumber;
      }
    }

    const rows = await db
      .select({ requestNumber: orders.requestNumber })
      .from(orders)
      .where(sql`${orders.requestNumber} LIKE ${`${prefix}-%`}`);

    const nextSequence =
      rows.reduce((highestSequence, row) => {
        const match = /^REQ-\d{8}-(\d+)$/.exec(row.requestNumber ?? "");
        if (!match) return highestSequence;
        const sequence = Number(match[1]);
        if (!Number.isInteger(sequence)) return highestSequence;
        return Math.max(highestSequence, sequence);
      }, 0) + 1;

    return `${prefix}-${String(nextSequence).padStart(3, "0")}`;
  } catch (error) {
    console.warn(
      `buildUniqueRequestNumber fallback triggered for ${trimmedRequestNumber || prefix}.`,
      error,
    );

    if (trimmedRequestNumber) {
      return trimmedRequestNumber;
    }

    const fallbackSequence =
      excludeOrderId !== undefined && Number.isInteger(excludeOrderId)
        ? excludeOrderId
        : Date.now() % 1000;

    return `${prefix}-${String(Math.max(1, fallbackSequence)).padStart(3, "0")}`;
  }
}

async function createFinanceApprovalNotificationIfMissing(
  db: AppDb,
  orderId: number,
  userId: number,
  orderName: string,
) {
  const [existingNotification] = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, "financeApproved"),
        eq(notifications.entityType, "order"),
        eq(notifications.entityId, String(orderId)),
      ),
    )
    .limit(1);

  if (existingNotification) return;

  await db
    .insert(notifications)
    .values({
      userId,
      type: "financeApproved",
      title: "Finance approved your order",
      message: `${orderName} has been approved by Finance.`,
      entityType: "order",
      entityId: String(orderId),
      isRead: false,
    })
    .run();
}

async function getOrderRowById(
  db: AppDb,
  id: string,
): Promise<OrderRow | null> {
  const numericId = parseIntegerId("Order id", id);

  const [row] = await db
    .select(orderSelection)
    .from(orders)
    .leftJoin(departments, eq(orders.departmentId, departments.id))
    .where(eq(orders.id, numericId))
    .limit(1);

  return row ?? null;
}

export async function listOrders(db: AppDb): Promise<OrderRecord[]> {
  try {
    const rows = await db
      .select(orderSelection)
      .from(orders)
      .leftJoin(departments, eq(orders.departmentId, departments.id))
      .orderBy(desc(orders.id));

    const itemsByOrderId = await listOrderItemsByOrderIds(
      db,
      rows.map((row) => row.id),
    );

    return rows.map((row) => mapOrder(row, itemsByOrderId.get(row.id) ?? []));
  } catch (error) {
    console.error("listOrders failed.", error);
    throw error;
  }
}

export async function getOrderById(
  db: AppDb,
  id: string,
): Promise<OrderRecord | null> {
  try {
    const row = await getOrderRowById(db, id);
    if (!row) return null;

    const itemsByOrderId = await listOrderItemsByOrderIds(db, [row.id]);
    return mapOrder(row, itemsByOrderId.get(row.id) ?? []);
  } catch (error) {
    console.error(`getOrderById failed for order ${id}.`, error);
    throw error;
  }
}

export async function createOrder(
  db: AppDb,
  input: CreateOrderInput,
  currentUserId?: string | null,
): Promise<OrderRecord> {
  try {
    const normalizedItems = input.items ?? [];
    if (normalizedItems.length === 0) {
      throw new Error("At least one order item is required.");
    }

    const userId = await resolveUserId(db, input.userId, currentUserId);
    const officeId = await resolveOfficeId(db, input.officeId);
    const departmentId = await resolveDepartmentForOrder(
      db,
      input.departmentId,
      input.department,
    );
    const requestDate = input.requestDate?.trim() || new Date().toISOString().slice(0, 10);
    const requestNumber = await buildUniqueRequestNumber(
      db,
      requestDate,
      input.requestNumber,
    );
    const currencyCode = parseCurrencyCode();
    const insertValues: typeof orders.$inferInsert = {
      orderName: parseOrderName(input.orderName),
      requestNumber,
      requestDate,
      requesterName: parseRequesterName(input.requester),
      userId,
      officeId,
      departmentId,
      whyOrdered: input.whyOrdered?.trim() ?? "",
      status: parseOrderStatus(input.status, "pendingFinanceApproval"),
      approvalTarget: parseApprovalTarget(input.approvalTarget),
      totalCost:
        input.totalAmount ??
        normalizedItems.reduce(
          (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
          0,
        ),
      currencyCode,
    };

    if (input.deliveryDate) {
      insertValues.expectedArrivalAt = input.deliveryDate;
    }

    if (input.requestedApproverId?.trim()) {
      insertValues.requestedApproverId = input.requestedApproverId.trim();
    }

    if (input.requestedApproverName?.trim()) {
      insertValues.requestedApproverName = input.requestedApproverName.trim();
    }

    if (input.requestedApproverRole?.trim()) {
      insertValues.requestedApproverRole = input.requestedApproverRole.trim();
    }

    if (input.approvalMessage?.trim()) {
      insertValues.approvalMessage = input.approvalMessage.trim();
    }

    const [row] = await db
      .insert(orders)
      .values(insertValues)
      .returning({ id: orders.id });

    await replaceOrderItems(db, row.id, normalizedItems);

    const createdOrder = await getOrderById(db, String(row.id));
    if (!createdOrder) {
      throw new Error("Failed to load created order.");
    }

    return createdOrder;
  } catch (error) {
    console.error("createOrder failed.", error);
    throw error;
  }
}

export async function updateOrder(
  db: AppDb,
  id: string,
  input: UpdateOrderInput,
  currentUserId?: string | null,
): Promise<OrderRecord | null> {
  try {
    const numericId = parseIntegerId("Order id", id);
    const existingOrder = await getOrderRowById(db, id);
    if (!existingOrder) return null;

    const updates: Partial<typeof orders.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.userId !== undefined && input.userId !== null) {
      updates.userId = await resolveUserId(db, input.userId, currentUserId);
    }

    if (input.orderName !== undefined && input.orderName !== null) {
      updates.orderName = parseOrderName(input.orderName);
    }

    if (input.requestNumber !== undefined) {
      const requestDate =
        input.requestDate?.trim() ||
        existingOrder.requestDate ||
        existingOrder.createdAt.slice(0, 10);
      updates.requestNumber = await buildUniqueRequestNumber(
        db,
        requestDate,
        input.requestNumber,
        numericId,
      );
    }

    if (input.requestDate !== undefined) {
      updates.requestDate = input.requestDate?.trim() || null;
    }

    if (input.requester !== undefined) {
      updates.requesterName = parseRequesterName(input.requester) || null;
    }

    if (input.officeId !== undefined && input.officeId !== null) {
      updates.officeId = await resolveOfficeId(db, input.officeId);
    }

    if (
      input.departmentId !== undefined ||
      (input.department !== undefined && input.department !== null)
    ) {
      updates.departmentId = await resolveDepartmentForOrder(
        db,
        input.departmentId,
        input.department,
      );
    }

    if (input.whyOrdered !== undefined) {
      updates.whyOrdered = input.whyOrdered?.trim() ?? "";
    }

    if (input.status !== undefined) {
      updates.status = parseOrderStatus(input.status, existingOrder.status);
    }

    if (input.approvalTarget !== undefined) {
      updates.approvalTarget = parseApprovalTarget(input.approvalTarget);
    }

    if (input.deliveryDate !== undefined) {
      updates.expectedArrivalAt = input.deliveryDate ?? null;
    }

    if (input.totalAmount !== undefined) {
      updates.totalCost = input.totalAmount ?? null;
    }

    if (input.currencyCode !== undefined) {
      updates.currencyCode = parseCurrencyCode();
    }

    if (input.requestedApproverId !== undefined) {
      updates.requestedApproverId = input.requestedApproverId?.trim() || null;
    }

    if (input.requestedApproverName !== undefined) {
      updates.requestedApproverName =
        input.requestedApproverName?.trim() || null;
    }

    if (input.requestedApproverRole !== undefined) {
      updates.requestedApproverRole =
        input.requestedApproverRole?.trim() || null;
    }

    if (input.approvalMessage !== undefined) {
      updates.approvalMessage = input.approvalMessage?.trim() || null;
    }

    if (input.higherUpReviewer !== undefined) {
      updates.higherUpReviewer = input.higherUpReviewer?.trim() || null;
    }

    if (input.higherUpReviewedAt !== undefined) {
      updates.higherUpReviewedAt = input.higherUpReviewedAt ?? null;
    }

    if (input.higherUpNote !== undefined) {
      updates.higherUpNote = input.higherUpNote?.trim() || null;
    }

    if (input.financeReviewer !== undefined) {
      updates.financeReviewer = input.financeReviewer?.trim() || null;
    }

    if (input.financeReviewedAt !== undefined) {
      updates.financeReviewedAt = input.financeReviewedAt ?? null;
    }

    if (input.financeNote !== undefined) {
      updates.financeNote = input.financeNote?.trim() || null;
    }

    if (input.receivedAt !== undefined) {
      updates.receivedAt = input.receivedAt ?? null;
    }

    if (input.receivedCondition !== undefined) {
      updates.receivedCondition = parseReceivedCondition(input.receivedCondition);
    }

    if (input.receivedNote !== undefined) {
      updates.receivedNote = input.receivedNote?.trim() || null;
    }

    if (input.storageLocation !== undefined) {
      updates.storageLocation = input.storageLocation?.trim() || null;
    }

    if (input.serialNumbers !== undefined) {
      updates.serialNumbersJson = JSON.stringify(input.serialNumbers ?? []);
    }

    if (input.assignedTo !== undefined) {
      updates.assignedTo = input.assignedTo?.trim() || null;
    }

    if (input.assignedRole !== undefined) {
      updates.assignedRole = input.assignedRole?.trim() || null;
    }

    if (input.assignedAt !== undefined) {
      updates.assignedAt = input.assignedAt ?? null;
    }

    await db.update(orders).set(updates).where(eq(orders.id, numericId)).run();

    if (input.items !== undefined) {
      await replaceOrderItems(db, numericId, input.items ?? []);
    }

    const nextDbStatus = updates.status ?? existingOrder.status;
    if (
      nextDbStatus === "financeApproved" &&
      existingOrder.status !== "financeApproved"
    ) {
      await createFinanceApprovalNotificationIfMissing(
        db,
        numericId,
        existingOrder.userId,
        updates.orderName ?? existingOrder.orderName,
      );
    }

    return getOrderById(db, id);
  } catch (error) {
    console.error(`updateOrder failed for ${id}.`, error);
    throw error;
  }
}

export async function deleteOrder(db: AppDb, id: string): Promise<boolean> {
  try {
    const numericId = parseIntegerId("Order id", id);

    const rows = await db
      .delete(orders)
      .where(eq(orders.id, numericId))
      .returning({ id: orders.id });

    return rows.length > 0;
  } catch (error) {
    console.error(`deleteOrder failed for ${id}.`, error);
    throw error;
  }
}
