import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const createSql = `
CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, clerk_user_id TEXT UNIQUE, email TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL, role TEXT NOT NULL, password_hash TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, requester_id INTEGER NOT NULL, why_ordered TEXT NOT NULL, order_process TEXT NOT NULL, which_office TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'SUBMITTED', inventory_approver_id INTEGER, inventory_comment TEXT, inventory_action_at TEXT, finance_approver_id INTEGER, finance_comment TEXT, finance_action_at TEXT, when_to_arrive TEXT, total_cost REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, item_name TEXT NOT NULL, category TEXT, quantity INTEGER NOT NULL DEFAULT 1, unit_cost REAL NOT NULL, from_where TEXT NOT NULL, additional_notes TEXT, eta TEXT, qr_code TEXT, manufactured_at TEXT, serial_number TEXT, power_spec TEXT, condition_note TEXT, receive_status TEXT NOT NULL DEFAULT 'PENDING', received_at TEXT, received_by INTEGER, assigned_to INTEGER, assigned_at TEXT, assignment_note TEXT);
CREATE TABLE IF NOT EXISTS order_status_history (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, changed_by INTEGER NOT NULL, from_status TEXT, to_status TEXT NOT NULL, note TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, actor_user_id INTEGER, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, payload_json TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT, is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, read_at TEXT);
`;

const runGraphql = async (
  query: string,
  variables?: Record<string, unknown>,
  headers?: Record<string, string>,
) => {
  const request = new IncomingRequest('http://example.com/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ query, variables }),
  });
  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);
  return { status: response.status, body: (await response.json()) as { data?: Record<string, unknown>; errors?: Array<{ message: string }> } };
};

describe('Asset workflow', () => {
  beforeAll(async () => {
    await env.DB.exec(createSql);
  });

  beforeEach(async () => {
    await env.DB.exec('DELETE FROM notifications; DELETE FROM audit_logs; DELETE FROM order_status_history; DELETE FROM order_items; DELETE FROM orders; DELETE FROM users;');
  });

  it('syncs inventory head and creates order', async () => {
    const headers = { 'x-dev-user-email': 'inv1@assets.com', 'x-dev-user-name': 'Inventory One', 'x-dev-user-id': 'u_inv1' };
    await env.DB.exec("INSERT INTO users(clerk_user_id,email,full_name,role,password_hash,is_active) VALUES('u_inv1','inv1@assets.com','Inventory One','INVENTORY_HEAD','CLERK_AUTH',1);");
    const synced = await runGraphql('mutation { syncMe { email role } }', undefined, headers);
    expect((synced.body.data?.syncMe as { role: string }).role).toBe('INVENTORY_HEAD');
    const created = await runGraphql(
      'mutation($input: CreateOrderInput!) { createOrder(input: $input) { status totalCost items { itemName } } }',
      { input: { whyOrdered: 'Laptop', orderProcess: 'Standard', whichOffice: 'HQ', items: [{ itemName: 'Laptop', quantity: 2, unitCost: 1000, fromWhere: 'Vendor' }] } },
      headers,
    );
    expect(created.status).toBe(200);
    expect((created.body.data?.createOrder as { status: string; totalCost: number }).status).toBe('SUBMITTED');
    expect((created.body.data?.createOrder as { totalCost: number }).totalCost).toBe(2000);
  });

  it('inventory -> finance -> it -> hr flow works', async () => {
    await env.DB.exec("INSERT INTO users(clerk_user_id,email,full_name,role,password_hash,is_active) VALUES('u_inv1','inventory1@assets.com','Inventory One','INVENTORY_HEAD','CLERK_AUTH',1);");
    await env.DB.exec("INSERT INTO users(clerk_user_id,email,full_name,role,password_hash,is_active) VALUES('u_fin1','finance1@assets.com','Finance One','FINANCE','CLERK_AUTH',1);");
    await env.DB.exec("INSERT INTO users(clerk_user_id,email,full_name,role,password_hash,is_active) VALUES('u_it1','it1@assets.com','IT One','IT_ADMIN','CLERK_AUTH',1);");
    await env.DB.exec("INSERT INTO users(clerk_user_id,email,full_name,role,password_hash,is_active) VALUES('u_hr1','hr1@assets.com','HR One','HR_MANAGER','CLERK_AUTH',1);");
    await env.DB.exec("INSERT INTO users(clerk_user_id,email,full_name,role,password_hash,is_active) VALUES('u_emp2','emp2@assets.com','Employee Two','EMPLOYEE','CLERK_AUTH',1);");
    const inventoryHeaders = { 'x-dev-user-email': 'inventory1@assets.com', 'x-dev-user-name': 'Inventory One', 'x-dev-user-id': 'u_inv1' };
    const financeHeaders = { 'x-dev-user-email': 'finance1@assets.com', 'x-dev-user-name': 'Finance One', 'x-dev-user-id': 'u_fin1' };
    const itHeaders = { 'x-dev-user-email': 'it1@assets.com', 'x-dev-user-name': 'IT One', 'x-dev-user-id': 'u_it1' };
    const hrHeaders = { 'x-dev-user-email': 'hr1@assets.com', 'x-dev-user-name': 'HR One', 'x-dev-user-id': 'u_hr1' };
    const usersResult = await runGraphql('query { users { id email } }', undefined, hrHeaders);
    const empId = (usersResult.body.data?.users as Array<{ id: string; email: string }>).find((u) => u.email === 'emp2@assets.com')?.id;
    expect(empId).toBeTruthy();
    const createResult = await runGraphql(
      'mutation($input: CreateOrderInput!) { createOrder(input: $input) { id items { id } } }',
      { input: { whyOrdered: 'Chair', orderProcess: 'Fast', whichOffice: 'Branch', items: [{ itemName: 'Chair', quantity: 1, unitCost: 180, fromWhere: 'Store' }] } },
      inventoryHeaders,
    );
    const orderId = (createResult.body.data?.createOrder as { id: string }).id;
    const itemId = (createResult.body.data?.createOrder as { items: Array<{ id: string }> }).items[0].id;
    const reviewResult = await runGraphql(
      'mutation($orderId: ID!) { reviewOrder(orderId: $orderId, decision: APPROVE) { status } }',
      { orderId },
      financeHeaders,
    );
    expect(reviewResult.status).toBe(200);
    expect((reviewResult.body.data?.reviewOrder as { status: string }).status).toBe('FINANCE_APPROVED');
    const receiveResult = await runGraphql(
      'mutation($orderId: ID!, $items: [ReceiveOrderItemInput!]!) { receiveOrderItems(orderId: $orderId, items: $items) { status items { receiveStatus qrCode } } }',
      { orderId, items: [{ itemId, serialNumber: 'SN-100', manufacturedAt: '2026-01', powerSpec: '220V', conditionNote: 'OK' }] },
      itHeaders,
    );
    expect(receiveResult.status).toBe(200);
    expect((receiveResult.body.data?.receiveOrderItems as { status: string }).status).toBe('IT_RECEIVED');
    const assignResult = await runGraphql(
      'mutation($orderId: ID!, $items: [AssignOrderItemInput!]!) { assignOrderItems(orderId: $orderId, items: $items) { items { assignedTo { email } } } }',
      { orderId, items: [{ itemId, assignedToUserId: empId, assignmentNote: 'Issued to user' }] },
      hrHeaders,
    );
    expect(assignResult.status).toBe(200);
    expect((assignResult.body.data?.assignOrderItems as { items: Array<{ assignedTo: { email: string } }> }).items[0].assignedTo.email).toBe('emp2@assets.com');
  });
});
