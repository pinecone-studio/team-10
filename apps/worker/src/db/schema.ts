import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkUserId: text('clerk_user_id'),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').$type<'EMPLOYEE' | 'INVENTORY_HEAD' | 'FINANCE' | 'IT_ADMIN' | 'HR_MANAGER' | 'SYSTEM_ADMIN'>().notNull(),
  passwordHash: text('password_hash').notNull(),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  requesterId: integer('requester_id')
    .notNull()
    .references(() => users.id),
  whyOrdered: text('why_ordered').notNull(),
  orderProcess: text('order_process').notNull(),
  whichOffice: text('which_office').notNull(),
  status: text('status')
    .$type<'SUBMITTED' | 'FINANCE_APPROVED' | 'FINANCE_REJECTED' | 'IT_RECEIVED'>()
    .notNull()
    .default('SUBMITTED'),
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
});

export const orderItems = sqliteTable('order_items', {
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
  receiveStatus: text('receive_status').$type<'PENDING' | 'RECEIVED'>().notNull().default('PENDING'),
  receivedAt: text('received_at'),
  receivedBy: integer('received_by').references(() => users.id),
  assignedTo: integer('assigned_to').references(() => users.id),
  assignedAt: text('assigned_at'),
  assignmentNote: text('assignment_note'),
});

export const orderStatusHistory = sqliteTable('order_status_history', {
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
});

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  actorUserId: integer('actor_user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  payloadJson: text('payload_json'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const notifications = sqliteTable('notifications', {
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
});

export type UserRow = typeof users.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
