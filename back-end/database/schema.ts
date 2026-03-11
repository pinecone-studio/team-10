import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const roleValues = [
  "employee",
  "inventoryHead",
  "finance",
  "itAdmin",
  "hrManager",
  "systemAdmin",
] as const;

export const orderStatusValues = [
  "pending",
  "approved",
  "rejected",
  "ordered",
  "partiallyReceived",
  "received",
  "closed",
] as const;

export const receiveStatusValues = [
  "pending",
  "partiallyReceived",
  "received",
  "cancelled",
] as const;

export const conditionStatusValues = [
  "good",
  "fair",
  "damaged",
  "defective",
  "incomplete",
  "used",
] as const;

export const assetStatusValues = [
  "received",
  "inStorage",
  "available",
  "pendingAssignment",
  "assigned",
  "inRepair",
  "pendingDisposal",
  "sold",
  "disposed",
  "lost",
] as const;

export const storageTypeValues = [
  "room",
  "shelf",
  "cabinet",
  "locker",
  "warehouse",
  "vault",
] as const;

export const assignmentRequestStatusValues = [
  "pending",
  "approved",
  "declined",
  "cancelled",
] as const;

export const distributionStatusValues = [
  "pendingHandover",
  "active",
  "returned",
  "cancelled",
] as const;

export const disposalStatusValues = [
  "pending",
  "financeApproved",
  "disposed",
  "cancelled",
] as const;

export const disposalMethodValues = [
  "sale",
  "donation",
  "recycle",
  "destroy",
  "returnToVendor",
  "other",
] as const;

const idColumn = () => integer("id").primaryKey({ autoIncrement: true });

const timestamps = () => ({
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const users = sqliteTable(
  "users",
  {
    id: idColumn(),
    clerkUserId: text("clerk_user_id").unique(),
    email: text("email").notNull().unique(),
    fullName: text("full_name").notNull(),
    role: text("role", { enum: roleValues }).notNull(),
    passwordHash: text("password_hash").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    index("idx_users_role").on(table.role),
  ],
);

export const offices = sqliteTable("offices", {
  id: idColumn(),
  officeName: text("office_name").notNull().unique(),
  location: text("location").notNull(),
  ...timestamps(),
});

export const orderProcesses = sqliteTable("order_processes", {
  id: idColumn(),
  processName: text("process_name").notNull().unique(),
  description: text("description"),
  ...timestamps(),
});

export const orders = sqliteTable(
  "orders",
  {
    id: idColumn(),
    userId: integer("user")
      .notNull()
      .references(() => users.id),
    officeId: integer("office_id")
      .notNull()
      .references(() => offices.id),
    orderProcessId: integer("order_process_id")
      .notNull()
      .references(() => orderProcesses.id),
    whyOrdered: text("why_ordered").notNull(),
    status: text("status", { enum: orderStatusValues }).notNull(),
    expectedArrivalAt: text("expected_arrival_at"),
    totalCost: real("total_cost"),
    ...timestamps(),
  },
  (table) => [
    index("idx_orders_user").on(table.userId),
    index("idx_orders_office_id").on(table.officeId),
    index("idx_orders_order_process_id").on(table.orderProcessId),
    index("idx_orders_status").on(table.status),
    index("idx_orders_expected_arrival_at").on(table.expectedArrivalAt),
  ],
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: idColumn(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    itemName: text("item_name").notNull(),
    category: text("category").notNull(),
    quantity: integer("quantity").notNull(),
    unitCost: real("unit_cost").notNull(),
    fromWhere: text("from_where").notNull(),
    additionalNotes: text("additional_notes"),
    eta: text("eta"),
    ...timestamps(),
  },
  (table) => [
    index("idx_order_items_order_id").on(table.orderId),
    index("idx_order_items_category").on(table.category),
  ],
);

export const orderItemImages = sqliteTable(
  "order_item_images",
  {
    id: idColumn(),
    orderItemId: integer("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("order_item_images_order_item_id_image_url_unique").on(
      table.orderItemId,
      table.imageUrl,
    ),
    index("idx_order_item_images_order_item_id").on(table.orderItemId),
    index("idx_order_item_images_sort_order").on(table.sortOrder),
  ],
);

export const orderItemAttributes = sqliteTable(
  "order_item_attributes",
  {
    id: idColumn(),
    orderItemId: integer("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    attributeName: text("attribute_name").notNull(),
    attributeValue: text("attribute_value").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("order_item_attributes_order_item_id_attribute_name_unique").on(
      table.orderItemId,
      table.attributeName,
    ),
    index("idx_order_item_attributes_order_item_id").on(table.orderItemId),
    index("idx_order_item_attributes_name_value").on(
      table.attributeName,
      table.attributeValue,
    ),
  ],
);

export const receives = sqliteTable(
  "receives",
  {
    id: idColumn(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    receivedByUserId: integer("received_by_user_id")
      .notNull()
      .references(() => users.id),
    officeId: integer("office_id")
      .notNull()
      .references(() => offices.id),
    status: text("status", { enum: receiveStatusValues }).notNull(),
    receivedAt: text("received_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    note: text("note"),
    ...timestamps(),
  },
  (table) => [
    index("idx_receives_order_id").on(table.orderId),
    index("idx_receives_received_by_user_id").on(table.receivedByUserId),
    index("idx_receives_office_id").on(table.officeId),
    index("idx_receives_status").on(table.status),
  ],
);

export const receiveItems = sqliteTable(
  "receive_items",
  {
    id: idColumn(),
    receiveId: integer("receive_id")
      .notNull()
      .references(() => receives.id, { onDelete: "cascade" }),
    orderItemId: integer("order_item_id")
      .notNull()
      .references(() => orderItems.id),
    quantityReceived: integer("quantity_received").notNull(),
    conditionStatus: text("condition_status", {
      enum: conditionStatusValues,
    }).notNull(),
    note: text("note"),
    ...timestamps(),
  },
  (table) => [
    index("idx_receive_items_receive_id").on(table.receiveId),
    index("idx_receive_items_order_item_id").on(table.orderItemId),
    index("idx_receive_items_condition_status").on(table.conditionStatus),
  ],
);

export const storage = sqliteTable("storage", {
  id: idColumn(),
  storageName: text("storage_name").notNull().unique(),
  storageType: text("storage_type", { enum: storageTypeValues }).notNull(),
  description: text("description"),
  ...timestamps(),
});

export const assets = sqliteTable(
  "assets",
  {
    id: idColumn(),
    receiveItemId: integer("receive_item_id")
      .notNull()
      .references(() => receiveItems.id, { onDelete: "cascade" }),
    assetCode: text("asset_code").notNull().unique(),
    qrCode: text("qr_code").notNull().unique(),
    assetName: text("asset_name").notNull(),
    category: text("category").notNull(),
    serialNumber: text("serial_number"),
    conditionStatus: text("condition_status", {
      enum: conditionStatusValues,
    }).notNull(),
    assetStatus: text("asset_status", { enum: assetStatusValues }).notNull(),
    currentStorageId: integer("current_storage_id").references(() => storage.id, {
      onDelete: "set null",
    }),
    ...timestamps(),
  },
  (table) => [
    index("idx_assets_receive_item_id").on(table.receiveItemId),
    index("idx_assets_current_storage_id").on(table.currentStorageId),
    index("idx_assets_asset_status").on(table.assetStatus),
    index("idx_assets_category").on(table.category),
    index("idx_assets_serial_number").on(table.serialNumber),
  ],
);

export const assetAttributes = sqliteTable(
  "asset_attributes",
  {
    id: idColumn(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    attributeName: text("attribute_name").notNull(),
    attributeValue: text("attribute_value").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("asset_attributes_asset_id_attribute_name_unique").on(
      table.assetId,
      table.attributeName,
    ),
    index("idx_asset_attributes_asset_id").on(table.assetId),
    index("idx_asset_attributes_name_value").on(
      table.attributeName,
      table.attributeValue,
    ),
  ],
);

export const assetAssignmentRequests = sqliteTable(
  "asset_assignment_requests",
  {
    id: idColumn(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => users.id),
    employeeScannedAt: text("employee_scanned_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id),
    reviewedAt: text("reviewed_at"),
    reviewNote: text("review_note"),
    status: text("status", { enum: assignmentRequestStatusValues }).notNull(),
    ...timestamps(),
  },
  (table) => [
    index("idx_asset_assignment_requests_asset_id").on(table.assetId),
    index("idx_asset_assignment_requests_employee_id").on(table.employeeId),
    index("idx_asset_assignment_requests_status").on(table.status),
  ],
);

export const assetDistributions = sqliteTable(
  "asset_distributions",
  {
    id: idColumn(),
    assignmentRequestId: integer("assignment_request_id")
      .unique()
      .references(() => assetAssignmentRequests.id),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => users.id),
    distributedByUserId: integer("distributed_by_user_id")
      .notNull()
      .references(() => users.id),
    distributedAt: text("distributed_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    status: text("status", { enum: distributionStatusValues }).notNull(),
    returnedAt: text("returned_at"),
    note: text("note"),
    ...timestamps(),
  },
  (table) => [
    index("idx_asset_distributions_asset_id").on(table.assetId),
    index("idx_asset_distributions_employee_id").on(table.employeeId),
    index("idx_asset_distributions_status").on(table.status),
  ],
);

export const assetDisposals = sqliteTable(
  "asset_disposals",
  {
    id: idColumn(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id),
    requestedByUserId: integer("requested_by_user_id")
      .notNull()
      .references(() => users.id),
    approvedByUserId: integer("approved_by_user_id").references(() => users.id),
    disposedByUserId: integer("disposed_by_user_id").references(() => users.id),
    status: text("status", { enum: disposalStatusValues }).notNull(),
    disposalReason: text("disposal_reason").notNull(),
    disposalMethod: text("disposal_method", { enum: disposalMethodValues }),
    disposedAt: text("disposed_at"),
    note: text("note"),
    ...timestamps(),
  },
  (table) => [
    index("idx_asset_disposals_asset_id").on(table.assetId),
    index("idx_asset_disposals_status").on(table.status),
  ],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: idColumn(),
    actorUserId: integer("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    payloadJson: text("payload_json"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_audit_logs_actor_user_id").on(table.actorUserId),
    index("idx_audit_logs_entity").on(table.entityType, table.entityId),
  ],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: idColumn(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    readAt: text("read_at"),
  },
  (table) => [
    index("idx_notifications_user_id").on(table.userId),
    index("idx_notifications_is_read").on(table.isRead),
  ],
);
