import { asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { buildSchema, graphql } from 'graphql';
import { getDb, type WorkerEnv } from './db/client';
import { orderItems, orders, type OrderItemRow, type OrderRow } from './db/schema';

type GraphQLVariables = Record<string, unknown>;

type CreateOrderItemInput = {
  itemName: string;
  category?: string | null;
  quantity?: number | null;
  unitCost: number;
  fromWhere: string;
  additionalNotes?: string | null;
  eta?: string | null;
};

type CreateOrderInput = {
  whyOrdered: string;
  whoApproved: string;
  orderProcess: string;
  whichOffice: string;
  whenToArrive?: string | null;
  items?: CreateOrderItemInput[] | null;
};

type GraphQLOrderItem = {
  id: string;
  orderId: string;
  itemName: string;
  category: string | null;
  quantity: number;
  unitCost: number;
  fromWhere: string;
  additionalNotes: string | null;
  eta: string | null;
};

type GraphQLOrder = {
  id: string;
  whyOrdered: string;
  whoApproved: string;
  orderProcess: string;
  whichOffice: string;
  whenToArrive: string | null;
  totalCost: number;
  items: GraphQLOrderItem[];
  createdAt: string;
  updatedAt: string;
};

const orderSchema = buildSchema(`
  type OrderItem {
    id: ID!
    orderId: ID!
    itemName: String!
    category: String
    quantity: Int!
    unitCost: Float!
    fromWhere: String!
    additionalNotes: String
    eta: String
  }

  type Order {
    id: ID!
    whyOrdered: String!
    whoApproved: String!
    orderProcess: String!
    whichOffice: String!
    whenToArrive: String
    totalCost: Float!
    items: [OrderItem!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreateOrderItemInput {
    itemName: String!
    category: String
    quantity: Int
    unitCost: Float!
    fromWhere: String!
    additionalNotes: String
    eta: String
  }

  input CreateOrderInput {
    whyOrdered: String!
    whoApproved: String!
    orderProcess: String!
    whichOffice: String!
    whenToArrive: String
    items: [CreateOrderItemInput!]
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
    orderItems(orderId: ID!): [OrderItem!]!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    addOrderItem(orderId: ID!, input: CreateOrderItemInput!): OrderItem!
  }
`);

const jsonResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const parseId = (rawId: string, fieldName: string): number => {
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer string`);
  }
  return parsed;
};

const normalizeRequiredString = (value: string, fieldName: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  return trimmed;
};

const normalizeOptionalString = (value?: string | null): string | null => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeQuantity = (value?: number | null): number => {
  const candidate = value ?? 1;
  if (!Number.isInteger(candidate) || candidate <= 0) {
    throw new Error('quantity must be a positive integer');
  }
  return candidate;
};

const normalizeUnitCost = (value: number): number => {
  if (Number.isNaN(value) || value < 0) {
    throw new Error('unitCost must be a non-negative number');
  }
  return value;
};

const mapOrderItem = (row: OrderItemRow): GraphQLOrderItem => ({
  id: String(row.id),
  orderId: String(row.orderId),
  itemName: row.itemName,
  category: row.category,
  quantity: row.quantity,
  unitCost: row.unitCost,
  fromWhere: row.fromWhere,
  additionalNotes: row.additionalNotes,
  eta: row.eta,
});

const mapOrder = (row: OrderRow, items: GraphQLOrderItem[]): GraphQLOrder => ({
  id: String(row.id),
  whyOrdered: row.whyOrdered,
  whoApproved: row.whoApproved,
  orderProcess: row.orderProcess,
  whichOffice: row.whichOffice,
  whenToArrive: row.whenToArrive,
  totalCost: row.totalCost,
  items,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const getOrderById = async (
  db: ReturnType<typeof getDb>,
  orderId: number,
): Promise<GraphQLOrder | null> => {
  const [orderRow] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!orderRow) {
    return null;
  }

  const itemRows = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.id));

  return mapOrder(orderRow, itemRows.map(mapOrderItem));
};

const getAllOrders = async (db: ReturnType<typeof getDb>): Promise<GraphQLOrder[]> => {
  const orderRows = await db.select().from(orders).orderBy(desc(orders.id));
  if (orderRows.length === 0) {
    return [];
  }

  const orderIds = orderRows.map((row) => row.id);
  const itemRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.id));

  const itemsByOrderId = new Map<number, GraphQLOrderItem[]>();
  for (const row of itemRows) {
    const list = itemsByOrderId.get(row.orderId) ?? [];
    list.push(mapOrderItem(row));
    itemsByOrderId.set(row.orderId, list);
  }

  return orderRows.map((row) => mapOrder(row, itemsByOrderId.get(row.id) ?? []));
};

const normalizeOrderItemInput = (input: CreateOrderItemInput) => {
  const quantity = normalizeQuantity(input.quantity);
  const unitCost = normalizeUnitCost(input.unitCost);

  return {
    itemName: normalizeRequiredString(input.itemName, 'itemName'),
    category: normalizeOptionalString(input.category),
    quantity,
    unitCost,
    fromWhere: normalizeRequiredString(input.fromWhere, 'fromWhere'),
    additionalNotes: normalizeOptionalString(input.additionalNotes),
    eta: normalizeOptionalString(input.eta),
    lineTotal: quantity * unitCost,
  };
};

const createRootResolvers = (db: ReturnType<typeof getDb>) => ({
  orders: async (): Promise<GraphQLOrder[]> => getAllOrders(db),

  order: async ({ id }: { id: string }): Promise<GraphQLOrder | null> => {
    const orderId = parseId(id, 'id');
    return getOrderById(db, orderId);
  },

  orderItems: async ({ orderId }: { orderId: string }): Promise<GraphQLOrderItem[]> => {
    const parsedOrderId = parseId(orderId, 'orderId');
    const rows = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, parsedOrderId))
      .orderBy(asc(orderItems.id));

    return rows.map(mapOrderItem);
  },

  createOrder: async ({ input }: { input: CreateOrderInput }): Promise<GraphQLOrder> => {
    const [inserted] = await db
      .insert(orders)
      .values({
        whyOrdered: normalizeRequiredString(input.whyOrdered, 'whyOrdered'),
        whoApproved: normalizeRequiredString(input.whoApproved, 'whoApproved'),
        orderProcess: normalizeRequiredString(input.orderProcess, 'orderProcess'),
        whichOffice: normalizeRequiredString(input.whichOffice, 'whichOffice'),
        whenToArrive: normalizeOptionalString(input.whenToArrive),
      })
      .returning({ id: orders.id });

    if (!inserted) {
      throw new Error('Failed to create order');
    }

    const normalizedItems = (input.items ?? []).map(normalizeOrderItemInput);
    if (normalizedItems.length > 0) {
      await db.insert(orderItems).values(
        normalizedItems.map((item) => ({
          orderId: inserted.id,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unitCost: item.unitCost,
          fromWhere: item.fromWhere,
          additionalNotes: item.additionalNotes,
          eta: item.eta,
        })),
      );

      const totalCost = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
      await db
        .update(orders)
        .set({
          totalCost,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(orders.id, inserted.id));
    }

    const created = await getOrderById(db, inserted.id);
    if (!created) {
      throw new Error('Failed to fetch created order');
    }

    return created;
  },

  addOrderItem: async ({
    orderId,
    input,
  }: {
    orderId: string;
    input: CreateOrderItemInput;
  }): Promise<GraphQLOrderItem> => {
    const parsedOrderId = parseId(orderId, 'orderId');

    const [existingOrder] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.id, parsedOrderId))
      .limit(1);

    if (!existingOrder) {
      throw new Error(`Order ${orderId} does not exist`);
    }

    const normalizedItem = normalizeOrderItemInput(input);
    const [insertedItem] = await db
      .insert(orderItems)
      .values({
        orderId: parsedOrderId,
        itemName: normalizedItem.itemName,
        category: normalizedItem.category,
        quantity: normalizedItem.quantity,
        unitCost: normalizedItem.unitCost,
        fromWhere: normalizedItem.fromWhere,
        additionalNotes: normalizedItem.additionalNotes,
        eta: normalizedItem.eta,
      })
      .returning();

    if (!insertedItem) {
      throw new Error('Failed to add item');
    }

    await db
      .update(orders)
      .set({
        totalCost: sql`${orders.totalCost} + ${normalizedItem.lineTotal}`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(orders.id, parsedOrderId));

    return mapOrderItem(insertedItem);
  },
});

const extractRequestPayload = async (
  request: Request,
): Promise<{ query: string; variables?: GraphQLVariables; operationName?: string }> => {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    if (!query) {
      throw new Error('Missing GraphQL query in query string');
    }

    const variablesParam = url.searchParams.get('variables');
    const variables = variablesParam ? (JSON.parse(variablesParam) as GraphQLVariables) : undefined;
    const operationName = url.searchParams.get('operationName') ?? undefined;

    return { query, variables, operationName };
  }

  if (request.method === 'POST') {
    const body = (await request.json()) as {
      query?: string;
      variables?: GraphQLVariables;
      operationName?: string;
    };

    if (!body.query) {
      throw new Error('Missing GraphQL query in request body');
    }

    return {
      query: body.query,
      variables: body.variables,
      operationName: body.operationName,
    };
  }

  throw new Error('Only GET and POST are supported for /graphql');
};

export const handleGraphQLRequest = async (request: Request, env: WorkerEnv): Promise<Response> => {
  try {
    const payload = await extractRequestPayload(request);
    const result = await graphql({
      schema: orderSchema,
      source: payload.query,
      rootValue: createRootResolvers(getDb(env)),
      variableValues: payload.variables,
      operationName: payload.operationName,
    });

    return jsonResponse(result, result.errors ? 400 : 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return jsonResponse({ errors: [{ message }] }, 400);
  }
};
