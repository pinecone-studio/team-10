import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    clerkUserId: text('clerk_user_id'),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    role: text('role').notNull(),
    passwordHash: text('password_hash').notNull(),
    isActive: integer('is_active').notNull().default(1),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    clerkUserIdIdx: index('idx_users_clerk_user_id').on(table.clerkUserId),
    emailIdx: index('idx_users_email').on(table.email),
    roleIdx: index('idx_users_role').on(table.role),
  }),
);

export const orders = sqliteTable(
  'orders',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    requesterId: integer('requester_id')
      .notNull()
      .references(() => users.id),
    whyOrdered: text('why_ordered').notNull(),
    orderProcess: text('order_process').notNull(),
    whichOffice: text('which_office').notNull(),
    status: text('status').notNull().default('SUBMITTED'),
    inventoryApproverId: integer('inventory_approver_id').references(() => users.id),
    inventoryComment: text('inventory_comment'),
    inventoryActionAt: text('inventory_action_at'),
    financeApproverId: integer('finance_approver_id').references(() => users.id),
    financeComment: text('finance_comment'),
    financeActionAt: text('finance_action_at'),
    whenToArrive: text('when_to_arrive'),
    totalCost: real('total_cost').notNull().default(0),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    requesterIdx: index('idx_orders_requester_id').on(table.requesterId),
    statusIdx: index('idx_orders_status').on(table.status),
    officeIdx: index('idx_orders_which_office').on(table.whichOffice),
    arriveIdx: index('idx_orders_when_to_arrive').on(table.whenToArrive),
  }),
);

export const orderItems = sqliteTable(
  'order_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    itemName: text('item_name').notNull(),
    category: text('category'),
    quantity: integer('quantity').notNull().default(1),
    unitCost: real('unit_cost').notNull(),
    fromWhere: text('from_where').notNull(),
    additionalNotes: text('additional_notes'),
    eta: text('eta'),
    qrCode: text('qr_code'),
    manufacturedAt: text('manufactured_at'),
    serialNumber: text('serial_number'),
    powerSpec: text('power_spec'),
    conditionNote: text('condition_note'),
    receiveStatus: text('receive_status').notNull().default('PENDING'),
    receivedAt: text('received_at'),
    receivedBy: integer('received_by').references(() => users.id),
    assignedTo: integer('assigned_to').references(() => users.id),
    assignedAt: text('assigned_at'),
    assignmentNote: text('assignment_note'),
  },
  (table) => ({
    orderIdx: index('idx_order_items_order_id').on(table.orderId),
    categoryIdx: index('idx_order_items_category').on(table.category),
    receiveStatusIdx: index('idx_order_items_receive_status').on(table.receiveStatus),
    assignedToIdx: index('idx_order_items_assigned_to').on(table.assignedTo),
    qrCodeIdx: index('idx_order_items_qr_code').on(table.qrCode),
  }),
);

export const orderStatusHistory = sqliteTable(
  'order_status_history',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    changedBy: integer('changed_by')
      .notNull()
      .references(() => users.id),
    fromStatus: text('from_status'),
    toStatus: text('to_status').notNull(),
    note: text('note'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    orderIdx: index('idx_order_status_history_order_id').on(table.orderId),
    changedByIdx: index('idx_order_status_history_changed_by').on(table.changedBy),
  }),
);

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    actorUserId: integer('actor_user_id').references(() => users.id),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    payloadJson: text('payload_json'),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    actorIdx: index('idx_audit_logs_actor_user_id').on(table.actorUserId),
    entityIdx: index('idx_audit_logs_entity').on(table.entityType, table.entityId),
  }),
);

export const notifications = sqliteTable(
  'notifications',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    isRead: integer('is_read').notNull().default(0),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    readAt: text('read_at'),
  },
  (table) => ({
    userIdx: index('idx_notifications_user_id').on(table.userId),
    isReadIdx: index('idx_notifications_is_read').on(table.isRead),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
