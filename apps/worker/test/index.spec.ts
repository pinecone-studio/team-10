import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

const createOrdersTableSql =
  'CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, why_ordered TEXT NOT NULL, who_approved TEXT NOT NULL, order_process TEXT NOT NULL, which_office TEXT NOT NULL, when_to_arrive TEXT, total_cost REAL NOT NULL DEFAULT 0 CHECK (total_cost >= 0), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);';

const createOrderItemsTableSql =
  'CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, item_name TEXT NOT NULL, category TEXT, quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0), unit_cost REAL NOT NULL CHECK (unit_cost >= 0), from_where TEXT NOT NULL, additional_notes TEXT, eta TEXT, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE);';

const runGraphql = async (query: string, variables?: Record<string, unknown>) => {
  const request = new IncomingRequest('http://example.com/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const ctx = createExecutionContext();
  const response = await worker.fetch(request, env, ctx);
  await waitOnExecutionContext(ctx);

  return {
    status: response.status,
    body: (await response.json()) as {
      data?: Record<string, unknown>;
      errors?: Array<{ message: string }>;
    },
  };
};

describe('Order GraphQL worker', () => {
  beforeAll(async () => {
    await env.DB.exec(createOrdersTableSql);
    await env.DB.exec(createOrderItemsTableSql);
  });

  beforeEach(async () => {
    await env.DB.exec('DELETE FROM order_items; DELETE FROM orders;');
  });

  it('creates an order with multiple items and returns total cost', async () => {
    const mutation = `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id
          totalCost
          items {
            id
            itemName
            quantity
            unitCost
          }
        }
      }
    `;

    const variables = {
      input: {
        whyOrdered: 'Set up new workspace',
        whoApproved: 'Finance Lead',
        orderProcess: 'Standard procurement',
        whichOffice: 'Ulaanbaatar HQ',
        items: [
          {
            itemName: 'MacBook Air M3',
            category: 'Electronics',
            quantity: 1,
            unitCost: 1400,
            fromWhere: 'Apple Store',
          },
          {
            itemName: 'Office Table',
            category: 'Furniture',
            quantity: 1,
            unitCost: 1400,
            fromWhere: 'IKEA',
          },
        ],
      },
    };

    const result = await runGraphql(mutation, variables);
    expect(result.status).toBe(200);
    expect(result.body.errors).toBeUndefined();

    const createdOrder = result.body.data?.createOrder as {
      totalCost: number;
      items: Array<{ itemName: string }>;
    };

    expect(createdOrder.totalCost).toBe(2800);
    expect(createdOrder.items).toHaveLength(2);
    expect(createdOrder.items.map((item) => item.itemName)).toEqual(['MacBook Air M3', 'Office Table']);
  });

  it('adds a new item to an existing order and updates total cost', async () => {
    const createOrderMutation = `
      mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input) {
          id
          totalCost
        }
      }
    `;

    const createResult = await runGraphql(createOrderMutation, {
      input: {
        whyOrdered: 'Office setup',
        whoApproved: 'Ops Manager',
        orderProcess: 'Vendor request',
        whichOffice: 'UB West',
      },
    });

    const orderId = (createResult.body.data?.createOrder as { id: string }).id;

    const addItemMutation = `
      mutation AddItem($orderId: ID!, $input: CreateOrderItemInput!) {
        addOrderItem(orderId: $orderId, input: $input) {
          id
          itemName
          quantity
          unitCost
        }
      }
    `;

    const addItemResult = await runGraphql(addItemMutation, {
      orderId,
      input: {
        itemName: 'Monitor',
        category: 'Electronics',
        quantity: 2,
        unitCost: 250,
        fromWhere: 'Dell Store',
      },
    });

    expect(addItemResult.status).toBe(200);
    expect(addItemResult.body.errors).toBeUndefined();

    const orderQuery = `
      query OrderById($id: ID!) {
        order(id: $id) {
          id
          totalCost
          items {
            itemName
            quantity
          }
        }
      }
    `;

    const orderResult = await runGraphql(orderQuery, { id: orderId });
    const order = orderResult.body.data?.order as {
      totalCost: number;
      items: Array<{ itemName: string; quantity: number }>;
    };

    expect(order.totalCost).toBe(500);
    expect(order.items).toEqual([{ itemName: 'Monitor', quantity: 2 }]);
  });
});
