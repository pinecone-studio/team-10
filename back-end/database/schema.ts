import { sql } from "drizzle-orm";
import {
  check,
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

export const positionValues = [
  "staff",
  "ceo",
  "generalManager",
  "cfo",
  "coo",
  "cto",
  "departmentHead",
  "departmentManager",
  "manager",
  "custom",
] as const;

export const approvalScopeValues = [
  "company",
  "office",
  "department",
] as const;

export const approvalQueueValues = [
  "finance",
] as const;

export const approvalStepStatusValues = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
] as const;

export const catalogStatusValues = [
  "draft",
  "active",
  "archived",
] as const;

export const catalogSourceValues = [
  "system",
  "promoted",
  "manual",
] as const;

export const currencyCodeValues = [
  "USD",
  "MNT",
  "EUR",
] as const;

export const orderStatusValues = [
  "pendingFinanceApproval",
  "rejectedByFinance",
  "financeApproved",
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

export const receivedConditionValues = [
  "complete",
  "issue",
] as const;

export const conditionStatusValues = [
  "good",
  "fair",
  "damaged",
  "defective",
  "missing",
  "incomplete",
  "used",
] as const;

export const assetStatusValues = [
  "received",
  "inStorage",
  "available",
  "pendingAssignment",
  "assigned",
  "pendingRetrieval",
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

export const assignmentAcknowledgmentStatusValues = [
  "pending",
  "confirmed",
  "expired",
  "void",
] as const;

export const emailDeliveryStatusValues = [
  "pending",
  "sent",
  "failed",
  "skipped",
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
    email: text("email").notNull().unique(),
    fullName: text("full_name").notNull(),
    role: text("role", { enum: roleValues }).notNull(),
    position: text("position", { enum: positionValues }).notNull().default("staff"),
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    passwordHash: text("password_hash").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    index("idx_users_role").on(table.role),
    index("idx_users_position").on(table.position),
    index("idx_users_department_id").on(table.departmentId),
  ],
);

export const offices = sqliteTable("offices", {
  id: idColumn(),
  officeName: text("office_name").notNull().unique(),
  location: text("location").notNull(),
  ...timestamps(),
});

export const departments = sqliteTable(
  "departments",
  {
    id: idColumn(),
    departmentName: text("department_name").notNull().unique(),
    description: text("description"),
    ...timestamps(),
  },
  (table) => [
    index("idx_departments_name").on(table.departmentName),
  ],
);

export const orderApprovers = sqliteTable(
  "order_approvers",
  {
    id: idColumn(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    approvalQueue: text("approval_queue", { enum: approvalQueueValues }).notNull(),
    approvalScope: text("approval_scope", { enum: approvalScopeValues }).notNull(),
    officeId: integer("office_id").references(() => offices.id, {
      onDelete: "cascade",
    }),
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "cascade",
    }),
    approvalLimit: real("approval_limit"),
    note: text("note"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps(),
  },
  (table) => [
    check(
      "order_approvers_scope_check",
      sql`(
        (${table.approvalScope} = 'company' AND ${table.officeId} IS NULL AND ${table.departmentId} IS NULL)
        OR (${table.approvalScope} = 'office' AND ${table.officeId} IS NOT NULL AND ${table.departmentId} IS NULL)
        OR (${table.approvalScope} = 'department' AND ${table.departmentId} IS NOT NULL)
      )`,
    ),
    index("idx_order_approvers_user_id").on(table.userId),
    index("idx_order_approvers_queue").on(table.approvalQueue),
    index("idx_order_approvers_scope").on(table.approvalScope),
    index("idx_order_approvers_office_id").on(table.officeId),
    index("idx_order_approvers_department_id").on(table.departmentId),
    index("idx_order_approvers_is_active").on(table.isActive),
    uniqueIndex("idx_order_approvers_unique_scope").on(
      table.userId,
      table.approvalQueue,
      table.approvalScope,
      sql`ifnull(${table.officeId}, -1)`,
      sql`ifnull(${table.departmentId}, -1)`,
    ),
  ],
);

export const orders = sqliteTable(
  "orders",
  {
    id: idColumn(),
    orderName: text("order_name").notNull(),
    requestNumber: text("request_number").unique(),
    requestDate: text("request_date"),
    requesterName: text("requester_name"),
    userId: integer("user")
      .notNull()
      .references(() => users.id),
    officeId: integer("office_id")
      .notNull()
      .references(() => offices.id),
    departmentId: integer("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    whyOrdered: text("why_ordered").notNull(),
    status: text("status", { enum: orderStatusValues }).notNull(),
    approvalTarget: text("approval_target", { enum: approvalQueueValues })
      .notNull()
      .default("finance"),
    expectedArrivalAt: text("expected_arrival_at"),
    totalCost: real("total_cost"),
    currencyCode: text("currency_code", { enum: currencyCodeValues })
      .notNull()
      .default("USD"),
    requestedApproverId: text("requested_approver_id"),
    requestedApproverName: text("requested_approver_name"),
    requestedApproverRole: text("requested_approver_role"),
    approvalMessage: text("approval_message"),
    higherUpReviewer: text("higher_up_reviewer"),
    higherUpReviewedAt: text("higher_up_reviewed_at"),
    higherUpNote: text("higher_up_note"),
    financeReviewer: text("finance_reviewer"),
    financeReviewedAt: text("finance_reviewed_at"),
    financeNote: text("finance_note"),
    receivedAt: text("received_at"),
    receivedCondition: text("received_condition", {
      enum: receivedConditionValues,
    }),
    receivedNote: text("received_note"),
    storageLocation: text("storage_location"),
    serialNumbersJson: text("serial_numbers_json"),
    assignedTo: text("assigned_to"),
    assignedRole: text("assigned_role"),
    assignedAt: text("assigned_at"),
    ...timestamps(),
  },
  (table) => [
    index("idx_orders_order_name").on(table.orderName),
    index("idx_orders_request_number").on(table.requestNumber),
    index("idx_orders_user").on(table.userId),
    index("idx_orders_office_id").on(table.officeId),
    index("idx_orders_department_id").on(table.departmentId),
    index("idx_orders_status").on(table.status),
    index("idx_orders_approval_target").on(table.approvalTarget),
    index("idx_orders_expected_arrival_at").on(table.expectedArrivalAt),
    index("idx_orders_currency_code").on(table.currencyCode),
  ],
);

export const orderApprovalSteps = sqliteTable(
  "order_approval_steps",
  {
    id: idColumn(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    stepOrder: integer("step_order").notNull(),
    approvalQueue: text("approval_queue", { enum: approvalQueueValues }).notNull(),
    status: text("status", { enum: approvalStepStatusValues }).notNull(),
    actedByUserId: integer("acted_by_user_id").references(() => users.id),
    actedAt: text("acted_at"),
    note: text("note"),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("order_approval_steps_order_id_step_order_unique").on(
      table.orderId,
      table.stepOrder,
    ),
    index("idx_order_approval_steps_order_id").on(table.orderId),
    index("idx_order_approval_steps_queue").on(table.approvalQueue),
    index("idx_order_approval_steps_status").on(table.status),
    index("idx_order_approval_steps_acted_by_user_id").on(table.actedByUserId),
  ],
);

export const catalogCategories = sqliteTable(
  "catalog_categories",
  {
    id: idColumn(),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull().unique(),
    status: text("status", { enum: catalogStatusValues }).notNull().default("draft"),
    source: text("source", { enum: catalogSourceValues }).notNull().default("manual"),
    createdByUserId: integer("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedByUserId: integer("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps(),
  },
  (table) => [
    index("idx_catalog_categories_status").on(table.status),
    index("idx_catalog_categories_source").on(table.source),
  ],
);

export const catalogCategoryAliases = sqliteTable(
  "catalog_category_aliases",
  {
    id: idColumn(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => catalogCategories.id, { onDelete: "cascade" }),
    aliasName: text("alias_name").notNull(),
    normalizedAlias: text("normalized_alias").notNull().unique(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("catalog_category_aliases_category_id_alias_name_unique").on(
      table.categoryId,
      table.aliasName,
    ),
    index("idx_catalog_category_aliases_category_id").on(table.categoryId),
  ],
);

export const catalogItemTypes = sqliteTable(
  "catalog_item_types",
  {
    id: idColumn(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => catalogCategories.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    status: text("status", { enum: catalogStatusValues }).notNull().default("draft"),
    source: text("source", { enum: catalogSourceValues }).notNull().default("manual"),
    createdByUserId: integer("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedByUserId: integer("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("catalog_item_types_category_id_normalized_name_unique").on(
      table.categoryId,
      table.normalizedName,
    ),
    index("idx_catalog_item_types_status").on(table.status),
    index("idx_catalog_item_types_source").on(table.source),
  ],
);

export const catalogProducts = sqliteTable(
  "catalog_products",
  {
    id: idColumn(),
    itemTypeId: integer("item_type_id")
      .notNull()
      .references(() => catalogItemTypes.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    productCode: text("product_code").notNull().unique(),
    unit: text("unit").notNull().default("pcs"),
    defaultCurrencyCode: text("default_currency_code", {
      enum: currencyCodeValues,
    }).notNull().default("MNT"),
    defaultUnitCost: real("default_unit_cost"),
    description: text("description"),
    status: text("status", { enum: catalogStatusValues }).notNull().default("draft"),
    source: text("source", { enum: catalogSourceValues }).notNull().default("manual"),
    createdByUserId: integer("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedByUserId: integer("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("catalog_products_item_type_id_normalized_name_unique").on(
      table.itemTypeId,
      table.normalizedName,
    ),
    index("idx_catalog_products_item_type_id").on(table.itemTypeId),
    index("idx_catalog_products_product_code").on(table.productCode),
    index("idx_catalog_products_default_currency_code").on(
      table.defaultCurrencyCode,
    ),
    index("idx_catalog_products_status").on(table.status),
    index("idx_catalog_products_source").on(table.source),
  ],
);

export const catalogTypeAliases = sqliteTable(
  "catalog_type_aliases",
  {
    id: idColumn(),
    itemTypeId: integer("item_type_id")
      .notNull()
      .references(() => catalogItemTypes.id, { onDelete: "cascade" }),
    aliasName: text("alias_name").notNull(),
    normalizedAlias: text("normalized_alias").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("catalog_type_aliases_item_type_id_alias_name_unique").on(
      table.itemTypeId,
      table.aliasName,
    ),
    uniqueIndex("catalog_type_aliases_item_type_id_normalized_alias_unique").on(
      table.itemTypeId,
      table.normalizedAlias,
    ),
    index("idx_catalog_type_aliases_item_type_id").on(table.itemTypeId),
  ],
);

export const catalogAttributeDefinitions = sqliteTable(
  "catalog_attribute_definitions",
  {
    id: idColumn(),
    itemTypeId: integer("item_type_id")
      .notNull()
      .references(() => catalogItemTypes.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),
    status: text("status", { enum: catalogStatusValues }).notNull().default("draft"),
    source: text("source", { enum: catalogSourceValues }).notNull().default("manual"),
    createdByUserId: integer("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedByUserId: integer("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex(
      "catalog_attribute_definitions_item_type_id_normalized_name_unique",
    ).on(table.itemTypeId, table.normalizedName),
    index("idx_catalog_attribute_definitions_status").on(table.status),
    index("idx_catalog_attribute_definitions_source").on(table.source),
  ],
);

export const catalogAttributeAliases = sqliteTable(
  "catalog_attribute_aliases",
  {
    id: idColumn(),
    attributeDefinitionId: integer("attribute_definition_id")
      .notNull()
      .references(() => catalogAttributeDefinitions.id, { onDelete: "cascade" }),
    aliasName: text("alias_name").notNull(),
    normalizedAlias: text("normalized_alias").notNull(),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex(
      "catalog_attribute_aliases_attribute_definition_id_alias_name_unique",
    ).on(table.attributeDefinitionId, table.aliasName),
    uniqueIndex(
      "catalog_attribute_aliases_attribute_definition_id_normalized_alias_unique",
    ).on(table.attributeDefinitionId, table.normalizedAlias),
    index("idx_catalog_attribute_aliases_attribute_definition_id").on(
      table.attributeDefinitionId,
    ),
  ],
);

export const catalogProductImages = sqliteTable(
  "catalog_product_images",
  {
    id: idColumn(),
    productId: integer("product_id")
      .notNull()
      .references(() => catalogProducts.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("catalog_product_images_product_id_image_url_unique").on(
      table.productId,
      table.imageUrl,
    ),
    index("idx_catalog_product_images_product_id").on(table.productId),
    index("idx_catalog_product_images_sort_order").on(table.sortOrder),
  ],
);

export const catalogProductAttributes = sqliteTable(
  "catalog_product_attributes",
  {
    id: idColumn(),
    productId: integer("product_id")
      .notNull()
      .references(() => catalogProducts.id, { onDelete: "cascade" }),
    catalogAttributeDefinitionId: integer("catalog_attribute_definition_id").references(
      () => catalogAttributeDefinitions.id,
      { onDelete: "set null" },
    ),
    attributeName: text("attribute_name").notNull(),
    attributeValue: text("attribute_value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    uniqueIndex("catalog_product_attributes_product_id_attribute_name_unique").on(
      table.productId,
      table.attributeName,
    ),
    uniqueIndex(
      "catalog_product_attributes_product_id_attribute_name_normalized_unique",
    ).on(table.productId, sql`lower(${table.attributeName})`),
    index("idx_catalog_product_attributes_product_id").on(table.productId),
    index("idx_catalog_product_attributes_catalog_attribute_definition_id").on(
      table.catalogAttributeDefinitionId,
    ),
    index("idx_catalog_product_attributes_sort_order").on(table.sortOrder),
    index("idx_catalog_product_attributes_name_value").on(
      table.attributeName,
      table.attributeValue,
    ),
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
    itemCode: text("item_code").notNull(),
    category: text("category").notNull(),
    itemType: text("item_type").notNull(),
    unit: text("unit").notNull().default("pcs"),
    catalogCategoryId: integer("catalog_category_id").references(
      () => catalogCategories.id,
      { onDelete: "set null" },
    ),
    catalogItemTypeId: integer("catalog_item_type_id").references(
      () => catalogItemTypes.id,
      { onDelete: "set null" },
    ),
    catalogProductId: integer("catalog_product_id").references(
      () => catalogProducts.id,
      { onDelete: "set null" },
    ),
    quantity: integer("quantity").notNull(),
    unitCost: real("unit_cost").notNull(),
    currencyCode: text("currency_code", { enum: currencyCodeValues })
      .notNull()
      .default("USD"),
    fromWhere: text("from_where").notNull(),
    additionalNotes: text("additional_notes"),
    eta: text("eta"),
    ...timestamps(),
  },
  (table) => [
    index("idx_order_items_order_id").on(table.orderId),
    index("idx_order_items_item_code").on(table.itemCode),
    index("idx_order_items_category").on(table.category),
    index("idx_order_items_item_type").on(table.itemType),
    index("idx_order_items_catalog_category_id").on(table.catalogCategoryId),
    index("idx_order_items_catalog_item_type_id").on(table.catalogItemTypeId),
    index("idx_order_items_catalog_product_id").on(table.catalogProductId),
    index("idx_order_items_currency_code").on(table.currencyCode),
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
    catalogAttributeDefinitionId: integer("catalog_attribute_definition_id").references(
      () => catalogAttributeDefinitions.id,
      { onDelete: "set null" },
    ),
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
    index("idx_order_item_attributes_catalog_attribute_definition_id").on(
      table.catalogAttributeDefinitionId,
    ),
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
    itemType: text("item_type").notNull(),
    catalogItemTypeId: integer("catalog_item_type_id").references(
      () => catalogItemTypes.id,
      { onDelete: "set null" },
    ),
    catalogProductId: integer("catalog_product_id").references(
      () => catalogProducts.id,
      { onDelete: "set null" },
    ),
    serialNumber: text("serial_number"),
    assetImageObjectKey: text("asset_image_object_key"),
    assetImageFileName: text("asset_image_file_name"),
    assetImageContentType: text("asset_image_content_type"),
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
    index("idx_assets_item_type").on(table.itemType),
    index("idx_assets_catalog_item_type_id").on(table.catalogItemTypeId),
    index("idx_assets_catalog_product_id").on(table.catalogProductId),
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
    catalogAttributeDefinitionId: integer("catalog_attribute_definition_id").references(
      () => catalogAttributeDefinitions.id,
      { onDelete: "set null" },
    ),
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
    index("idx_asset_attributes_catalog_attribute_definition_id").on(
      table.catalogAttributeDefinitionId,
    ),
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
    recipientRole: text("recipient_role"),
    status: text("status", { enum: distributionStatusValues }).notNull(),
    returnedAt: text("returned_at"),
    usageYears: text("usage_years"),
    returnCondition: text("return_condition"),
    returnPower: text("return_power"),
    note: text("note"),
    ...timestamps(),
  },
  (table) => [
    index("idx_asset_distributions_asset_id").on(table.assetId),
    index("idx_asset_distributions_employee_id").on(table.employeeId),
    index("idx_asset_distributions_status").on(table.status),
  ],
);

export const assetAssignmentAcknowledgments = sqliteTable(
  "asset_assignment_acknowledgments",
  {
    id: idColumn(),
    assignmentRequestId: integer("assignment_request_id")
      .notNull()
      .unique()
      .references(() => assetAssignmentRequests.id, { onDelete: "cascade" }),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientName: text("recipient_name").notNull(),
    recipientEmail: text("recipient_email").notNull(),
    recipientRole: text("recipient_role"),
    jwtId: text("jwt_id").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    tokenConsumedAt: text("token_consumed_at"),
    emailStatus: text("email_status", { enum: emailDeliveryStatusValues })
      .notNull()
      .default("pending"),
    emailSentAt: text("email_sent_at"),
    signerName: text("signer_name"),
    signerIpAddress: text("signer_ip_address"),
    signatureText: text("signature_text"),
    signedAt: text("signed_at"),
    pdfObjectKey: text("pdf_object_key"),
    pdfFileName: text("pdf_file_name"),
    pdfUploadedAt: text("pdf_uploaded_at"),
    status: text("status", { enum: assignmentAcknowledgmentStatusValues })
      .notNull()
      .default("pending"),
    ...timestamps(),
  },
  (table) => [
    index("idx_asset_assignment_acknowledgments_assignment_request_id").on(
      table.assignmentRequestId,
    ),
    index("idx_asset_assignment_acknowledgments_asset_id").on(table.assetId),
    index("idx_asset_assignment_acknowledgments_employee_id").on(table.employeeId),
    index("idx_asset_assignment_acknowledgments_jwt_id").on(table.jwtId),
    index("idx_asset_assignment_acknowledgments_status").on(table.status),
    index("idx_asset_assignment_acknowledgments_email_status").on(
      table.emailStatus,
    ),
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
