import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  whyOrdered: text('why_ordered').notNull(),
  whoApproved: text('who_approved').notNull(),
  orderProcess: text('order_process').notNull(),
  whichOffice: text('which_office').notNull(),
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
});

export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
