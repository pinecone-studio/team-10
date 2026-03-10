import { and, asc, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { assertOrgEmail, isSystemAdminEmail, normalizeEmail, type ClerkIdentity } from './auth';
import { getDb, type WorkerEnv } from './db/client';
import { auditLogs, notifications, orderItems, orders, orderStatusHistory, users, type UserRow } from './db/schema';

type Role = 'EMPLOYEE' | 'INVENTORY_HEAD' | 'FINANCE' | 'IT_ADMIN' | 'HR_MANAGER' | 'SYSTEM_ADMIN';
type Status = 'SUBMITTED' | 'FINANCE_APPROVED' | 'FINANCE_REJECTED' | 'IT_RECEIVED';
type Decision = 'APPROVE' | 'REJECT';
type CreateUserInput = { email: string; fullName: string; role: Role };
type ItemInput = { itemName: string; category?: string | null; quantity?: number | null; unitCost: number; fromWhere: string; additionalNotes?: string | null; eta?: string | null };
type CreateOrderInput = { whyOrdered: string; orderProcess: string; whichOffice: string; whenToArrive?: string | null; items: ItemInput[] };
type ReceiveItemInput = { itemId: string; serialNumber: string; manufacturedAt: string; powerSpec: string; conditionNote?: string | null };
type AssignItemInput = { itemId: string; assignedToUserId: string; assignmentNote?: string | null };

const required = (v: string, f: string) => { const x = v.trim(); if (!x) throw new Error(`${f} cannot be empty`); return x; };
const optional = (v?: string | null) => v?.trim() || null;
const parseId = (v: string, f: string) => { const x = Number.parseInt(v, 10); if (!Number.isInteger(x) || x < 1) throw new Error(`${f} must be positive integer`); return x; };
const deny = (m = 'Unauthorized'): never => { throw new Error(m); };
const mapUser = (u: UserRow) => ({ id: String(u.id), email: u.email, fullName: u.fullName, role: u.role, createdAt: u.createdAt });

export const createRootResolvers = (env: WorkerEnv, viewer: ClerkIdentity | null) => {
  const db = getDb(env);
  let cache: Promise<UserRow> | null = null;
  const makeUniqueQrCode = async (orderId: number, itemId: number): Promise<string> => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
      const qrCode = `AST-${orderId}-${itemId}-${suffix}`;
      const [existing] = await db
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(eq(orderItems.qrCode, qrCode))
        .limit(1);
      if (!existing) return qrCode;
    }
    throw new Error('Failed to generate unique QR code');
  };
  const log = (uid: number | null, action: string, entity: string, entityId: string | null, payload: unknown) =>
    db.insert(auditLogs).values({ actorUserId: uid, action, entityType: entity, entityId, payloadJson: JSON.stringify(payload) });
  const mapNotification = (n: typeof notifications.$inferSelect) => ({ id: String(n.id), type: n.type, title: n.title, message: n.message, entityType: n.entityType, entityId: n.entityId, isRead: n.isRead === 1, createdAt: n.createdAt, readAt: n.readAt });
  const usersByRole = async (role: Role): Promise<number[]> => (await db.select({ id: users.id }).from(users).where(eq(users.role, role))).map((u) => u.id);
  const notify = async (userIds: number[], type: string, title: string, message: string, entityType: string, entityId: string) => {
    if (!userIds.length) return;
    await db.insert(notifications).values(userIds.map((userId) => ({ userId, type, title, message, entityType, entityId })));
  };
  const me = async (): Promise<UserRow> => {
    if (!viewer) deny();
    if (cache) return cache;
    cache = (async () => {
      if (!viewer.isDevAuth) {
        assertOrgEmail(viewer.email, env);
      }
      const [row] = await db.select().from(users).where(or(eq(users.clerkUserId, viewer.clerkUserId), eq(users.email, normalizeEmail(viewer.email)))).limit(1);
      if (row) {
        if (viewer.isDevAuth) {
          return viewer.role ? { ...row, role: viewer.role } : row;
        }
        const promote = isSystemAdminEmail(viewer.email, env) && row.role !== 'SYSTEM_ADMIN';
        if (row.clerkUserId !== viewer.clerkUserId || row.fullName !== viewer.fullName || promote) {
          const [u] = await db.update(users).set({ clerkUserId: viewer.clerkUserId, fullName: viewer.fullName, role: promote ? 'SYSTEM_ADMIN' : row.role, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(users.id, row.id)).returning();
          const saved = u ?? row;
          return viewer.role ? { ...saved, role: viewer.role } : saved;
        }
        return viewer.role ? { ...row, role: viewer.role } : row;
      }
      const role: Role = isSystemAdminEmail(viewer.email, env) ? 'SYSTEM_ADMIN' : 'EMPLOYEE';
      const [created] = await db.insert(users).values({ clerkUserId: viewer.clerkUserId, email: viewer.email, fullName: viewer.fullName, role, passwordHash: 'CLERK_AUTH' }).returning();
      if (!created) throw new Error('Failed to create profile');
      await log(created.id, 'SYNC_USER', 'user', String(created.id), { role });
      return viewer.role ? { ...created, role: viewer.role } : created;
    })();
    return cache;
  };
  const mapOrders = async () => {
    const actor = await me();
    const employeeViewScoped = actor.role === 'EMPLOYEE' && !viewer?.isDevAuth;
    const where = employeeViewScoped ? eq(orderItems.assignedTo, actor.id) : undefined;
    const itemScope = where ? await db.select().from(orderItems).where(where) : null;
    const scopedOrderIds = itemScope ? [...new Set(itemScope.map((i) => i.orderId))] : null;
    const rows = scopedOrderIds ? (scopedOrderIds.length ? await db.select().from(orders).where(inArray(orders.id, scopedOrderIds)).orderBy(desc(orders.id)) : []) : await db.select().from(orders).orderBy(desc(orders.id));
    if (!rows.length) return [];
    const ids = rows.map((r) => r.id);
    const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)).orderBy(asc(orderItems.id));
    const userIds = [...new Set(rows.flatMap((r) => [r.requesterId, r.financeApproverId]).concat(items.flatMap((i) => [i.receivedBy, i.assignedTo])).filter((x): x is number => Boolean(x)))];
    const people = userIds.length ? await db.select().from(users).where(inArray(users.id, userIds)) : [];
    const userMap = new Map(people.map((u) => [u.id, mapUser(u)]));
    const mapItem = (i: (typeof items)[number]) => ({ id: String(i.id), orderId: String(i.orderId), itemName: i.itemName, category: i.category, quantity: i.quantity, unitCost: i.unitCost, fromWhere: i.fromWhere, additionalNotes: i.additionalNotes, eta: i.eta, qrCode: i.qrCode, manufacturedAt: i.manufacturedAt, serialNumber: i.serialNumber, powerSpec: i.powerSpec, conditionNote: i.conditionNote, receiveStatus: i.receiveStatus, receivedAt: i.receivedAt, receivedBy: i.receivedBy ? userMap.get(i.receivedBy) ?? null : null, assignedTo: i.assignedTo ? userMap.get(i.assignedTo) ?? null : null, assignedAt: i.assignedAt, assignmentNote: i.assignmentNote });
    const itemMap = new Map<number, ReturnType<typeof mapItem>[]>(); for (const it of items) itemMap.set(it.orderId, [...(itemMap.get(it.orderId) ?? []), mapItem(it)]);
    return rows.map((r) => ({ id: String(r.id), requester: userMap.get(r.requesterId), whyOrdered: r.whyOrdered, orderProcess: r.orderProcess, whichOffice: r.whichOffice, status: r.status, financeApprover: r.financeApproverId ? userMap.get(r.financeApproverId) : null, financeComment: r.financeComment, financeActionAt: r.financeActionAt, whenToArrive: r.whenToArrive, totalCost: r.totalCost, items: (itemMap.get(r.id) ?? []).filter((i) => actor.role !== 'EMPLOYEE' || !employeeViewScoped || i.assignedTo?.id === String(actor.id)), createdAt: r.createdAt, updatedAt: r.updatedAt }));
  };

  return {
    me: async () => mapUser(await me()),
    syncMe: async () => mapUser(await me()),
    orders: async () => mapOrders(),
    notifications: async () => {
      const a = await me();
      return (await db.select().from(notifications).where(eq(notifications.userId, a.id)).orderBy(desc(notifications.id)).limit(100)).map(mapNotification);
    },
    users: async () => { const a = await me(); if (!['SYSTEM_ADMIN', 'HR_MANAGER'].includes(a.role)) deny(); return (await db.select().from(users).orderBy(desc(users.id))).map(mapUser); },
    lookupItemByQr: async ({ qrCode }: { qrCode: string }) => (await mapOrders()).flatMap((o) => o.items).find((i) => i.qrCode === required(qrCode, 'qrCode')) ?? null,
    createUser: async ({ input }: { input: CreateUserInput }) => {
      const a = await me(); if (a.role !== 'SYSTEM_ADMIN') deny(); assertOrgEmail(input.email, env);
      const email = normalizeEmail(input.email); const [old] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const [u] = old ? await db.update(users).set({ fullName: required(input.fullName, 'fullName'), role: input.role, isActive: 1, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(users.id, old.id)).returning() : await db.insert(users).values({ email, fullName: required(input.fullName, 'fullName'), role: input.role, passwordHash: 'CLERK_INVITED' }).returning();
      if (!u) throw new Error('Failed to upsert user'); await log(a.id, 'UPSERT_USER', 'user', String(u.id), { email: u.email, role: u.role }); return mapUser(u);
    },
    updateUserRole: async ({ userId, role }: { userId: string; role: Role }) => {
      const a = await me(); if (a.role !== 'SYSTEM_ADMIN') deny(); const id = parseId(userId, 'userId');
      const [t] = await db.select().from(users).where(eq(users.id, id)).limit(1); if (!t) throw new Error('User not found');
      if (id === a.id && role !== 'SYSTEM_ADMIN') throw new Error('You cannot downgrade your own role');
      if (t.role === 'SYSTEM_ADMIN' && role !== 'SYSTEM_ADMIN') { const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, 'SYSTEM_ADMIN')); if (Number(count) <= 1) throw new Error('At least one SYSTEM_ADMIN must remain'); }
      const [u] = await db.update(users).set({ role, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(users.id, id)).returning(); if (!u) throw new Error('Failed to update role');
      await log(a.id, 'UPDATE_USER_ROLE', 'user', String(id), { from: t.role, to: role }); return mapUser(u);
    },
    deleteUser: async ({ userId }: { userId: string }) => {
      const a = await me(); if (a.role !== 'SYSTEM_ADMIN') deny(); const id = parseId(userId, 'userId'); if (id === a.id) throw new Error('You cannot delete yourself');
      const [t] = await db.select().from(users).where(eq(users.id, id)).limit(1); if (!t) throw new Error('User not found');
      if (t.role === 'SYSTEM_ADMIN') { const [{ count }] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(eq(users.role, 'SYSTEM_ADMIN')); if (Number(count) <= 1) throw new Error('At least one SYSTEM_ADMIN must remain'); }
      const [{ refs }] = await db.select({ refs: sql<number>`COUNT(*)` }).from(orders).where(or(eq(orders.requesterId, id), eq(orders.inventoryApproverId, id), eq(orders.financeApproverId, id)));
      const [{ itemRefs }] = await db.select({ itemRefs: sql<number>`COUNT(*)` }).from(orderItems).where(or(eq(orderItems.receivedBy, id), eq(orderItems.assignedTo, id)));
      if (Number(refs) > 0 || Number(itemRefs) > 0) throw new Error('Cannot delete user linked to asset flow');
      await db.delete(users).where(eq(users.id, id)); await log(a.id, 'DELETE_USER', 'user', String(id), { email: t.email, role: t.role }); return true;
    },
    createOrder: async ({ input }: { input: CreateOrderInput }) => {
      const a = await me(); if (!['INVENTORY_HEAD', 'SYSTEM_ADMIN'].includes(a.role)) throw new Error('Only INVENTORY_HEAD can create orders');
      const items = input.items.map((i) => ({ itemName: required(i.itemName, 'itemName'), category: optional(i.category), quantity: i.quantity ?? 1, unitCost: i.unitCost, fromWhere: required(i.fromWhere, 'fromWhere'), additionalNotes: optional(i.additionalNotes), eta: optional(i.eta) }));
      for (const i of items) if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.unitCost < 0) throw new Error('Invalid quantity or unitCost');
      const [o] = await db.insert(orders).values({ requesterId: a.id, whyOrdered: required(input.whyOrdered, 'whyOrdered'), orderProcess: required(input.orderProcess, 'orderProcess'), whichOffice: required(input.whichOffice, 'whichOffice'), whenToArrive: optional(input.whenToArrive), status: 'SUBMITTED' }).returning();
      if (!o) throw new Error('Failed to create order'); await db.insert(orderItems).values(items.map((i) => ({ orderId: o.id, ...i })));
      const totalCost = items.reduce((s, i) => s + i.quantity * i.unitCost, 0); await db.update(orders).set({ totalCost, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, o.id));
      await db.insert(orderStatusHistory).values({ orderId: o.id, changedBy: a.id, fromStatus: null, toStatus: 'SUBMITTED', note: 'Created by inventory head' }); await log(a.id, 'CREATE_ORDER', 'order', String(o.id), { totalCost, itemCount: items.length });
      await notify(await usersByRole('FINANCE'), 'ORDER_SUBMITTED', 'Order Awaiting Finance Review', `Order #${o.id} was submitted by ${a.fullName}.`, 'order', String(o.id));
      return (await mapOrders()).find((x) => x.id === String(o.id));
    },
    reviewOrder: async ({ orderId, decision, comment }: { orderId: string; decision: Decision; comment?: string | null }) => {
      const a = await me(); if (!['FINANCE', 'SYSTEM_ADMIN'].includes(a.role)) deny(); const id = parseId(orderId, 'orderId');
      const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1); if (!o) throw new Error('Order not found'); if (o.status !== 'SUBMITTED') throw new Error('Only SUBMITTED order can be reviewed');
      const next: Status = decision === 'APPROVE' ? 'FINANCE_APPROVED' : 'FINANCE_REJECTED';
      await db.update(orders).set({ status: next, financeApproverId: a.id, financeComment: optional(comment), financeActionAt: sql`CURRENT_TIMESTAMP`, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, id));
      await db.insert(orderStatusHistory).values({ orderId: id, changedBy: a.id, fromStatus: o.status, toStatus: next, note: optional(comment) }); await log(a.id, 'REVIEW_ORDER', 'order', String(id), { decision, next });
      if (next === 'FINANCE_APPROVED') await notify(await usersByRole('IT_ADMIN'), 'ORDER_APPROVED', 'Order Ready for Receiving', `Order #${id} is approved by finance.`, 'order', String(id));
      if (next === 'FINANCE_REJECTED') await notify([o.requesterId], 'ORDER_REJECTED', 'Order Rejected by Finance', `Order #${id} was rejected by finance.`, 'order', String(id));
      return (await mapOrders()).find((x) => x.id === String(id));
    },
    receiveOrderItems: async ({ orderId, items }: { orderId: string; items: ReceiveItemInput[] }) => {
      const a = await me(); if (!['IT_ADMIN', 'SYSTEM_ADMIN'].includes(a.role)) deny(); const id = parseId(orderId, 'orderId');
      const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1); if (!o) throw new Error('Order not found'); if (o.status !== 'FINANCE_APPROVED') throw new Error('Only FINANCE_APPROVED orders can be received');
      if (!items.length) throw new Error('At least one item is required');
      const dbItems = await db.select().from(orderItems).where(eq(orderItems.orderId, id)); const map = new Map(dbItems.map((i) => [String(i.id), i]));
      for (const p of items) { const itemId = parseId(p.itemId, 'itemId'); if (!map.get(String(itemId))) throw new Error(`Item ${itemId} not found in order`);
        const manufacturedAt = required(p.manufacturedAt, 'manufacturedAt');
        if (!/^\d{4}-\d{2}$/.test(manufacturedAt)) throw new Error('manufacturedAt must be YYYY-MM');
        const qrCode = await makeUniqueQrCode(id, itemId);
        await db.update(orderItems).set({ serialNumber: required(p.serialNumber, 'serialNumber'), manufacturedAt, powerSpec: required(p.powerSpec, 'powerSpec'), conditionNote: optional(p.conditionNote), receiveStatus: 'RECEIVED', qrCode, receivedBy: a.id, receivedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orderItems.id, itemId)); }
      const [{ pending }] = await db.select({ pending: sql<number>`COUNT(*)` }).from(orderItems).where(and(eq(orderItems.orderId, id), eq(orderItems.receiveStatus, 'PENDING')));
      if (!Number(pending)) { await db.update(orders).set({ status: 'IT_RECEIVED', updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(orders.id, id)); await db.insert(orderStatusHistory).values({ orderId: id, changedBy: a.id, fromStatus: 'FINANCE_APPROVED', toStatus: 'IT_RECEIVED', note: 'Received by IT admin' }); await notify(await usersByRole('HR_MANAGER'), 'ORDER_RECEIVED', 'Order Ready for HR Assignment', `Order #${id} is fully received by IT.`, 'order', String(id)); }
      await log(a.id, 'RECEIVE_ORDER_ITEMS', 'order', String(id), { count: items.length }); return (await mapOrders()).find((x) => x.id === String(id));
    },
    assignOrderItems: async ({ orderId, items }: { orderId: string; items: AssignItemInput[] }) => {
      const a = await me(); if (!['HR_MANAGER', 'SYSTEM_ADMIN'].includes(a.role)) deny(); const id = parseId(orderId, 'orderId');
      const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1); if (!o) throw new Error('Order not found'); if (o.status !== 'IT_RECEIVED') throw new Error('Only IT_RECEIVED orders can be assigned');
      if (!items.length) throw new Error('At least one item must be assigned');
      const notified = new Set<number>();
      for (const p of items) { const itemId = parseId(p.itemId, 'itemId'); const uid = parseId(p.assignedToUserId, 'assignedToUserId');
        const [item] = await db.select().from(orderItems).where(and(eq(orderItems.id, itemId), eq(orderItems.orderId, id))).limit(1); if (!item || item.receiveStatus !== 'RECEIVED') throw new Error(`Item ${itemId} is not received yet`);
        const [assignee] = await db.select().from(users).where(eq(users.id, uid)).limit(1); if (!assignee) throw new Error('Assigned user not found');
        if (assignee.role !== 'EMPLOYEE') throw new Error('Item can be assigned only to EMPLOYEE');
        await db.update(orderItems).set({ assignedTo: uid, assignedAt: sql`CURRENT_TIMESTAMP`, assignmentNote: optional(p.assignmentNote) }).where(eq(orderItems.id, itemId)); notified.add(uid); }
      await notify([...notified], 'ASSET_ASSIGNED', 'Asset Assigned', `An asset from order #${id} has been assigned to you.`, 'order', String(id));
      await log(a.id, 'ASSIGN_ORDER_ITEMS', 'order', String(id), { count: items.length }); return (await mapOrders()).find((x) => x.id === String(id));
    },
    markNotificationRead: async ({ notificationId }: { notificationId: string }) => {
      const a = await me();
      const id = parseId(notificationId, 'notificationId');
      const [n] = await db.select().from(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, a.id))).limit(1);
      if (!n) throw new Error('Notification not found');
      const [u] = await db.update(notifications).set({ isRead: 1, readAt: sql`CURRENT_TIMESTAMP` }).where(eq(notifications.id, id)).returning();
      if (!u) throw new Error('Failed to update notification');
      return mapNotification(u);
    },
  };
};
