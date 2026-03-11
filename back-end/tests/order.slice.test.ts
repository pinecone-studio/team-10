import assert from "node:assert/strict";
import test from "node:test";
import { createGraphQLServer } from "../graphql/server.ts";
import { createGraphQLContextValue } from "../lib/context.ts";
import { createDatabase } from "../lib/db.ts";
import { FakeD1Database } from "./support/fake-d1.ts";

type GraphQLSingleResult<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

type OrderSeed = {
  id?: number;
  userId: number;
  officeId: number;
  orderProcessId: number;
  whyOrdered: string;
  status: string;
  expectedArrivalAt?: string | null;
  totalCost?: number | null;
};

type SeedConfig = {
  orders?: OrderSeed[];
  users?: Array<{ id?: number; role?: string; isActive?: boolean }>;
  offices?: Array<{ id?: number }>;
  orderProcesses?: Array<{ id?: number }>;
  currentUserId?: string | null;
};

async function createExecutor(seed: SeedConfig = {}) {
  const server = createGraphQLServer();
  await server.start();

  const database = createDatabase(new FakeD1Database(seed));

  return {
    execute: async <TData>(
      query: string,
      variables?: Record<string, unknown>,
    ) => {
      const response = await server.executeOperation(
        {
          query,
          variables,
        },
        {
          contextValue: createGraphQLContextValue({
            db: database,
            currentUserId: seed.currentUserId ?? null,
          }),
        },
      );

      assert.equal(response.body.kind, "single");

      const result = response.body.singleResult as GraphQLSingleResult<TData>;

      assert.equal(result.errors, undefined);

      return JSON.parse(JSON.stringify(result.data)) as TData;
    },
    stop: async () => {
      await server.stop();
    },
  };
}

test("Query.orders returns persisted order rows", async () => {
  const executor = await createExecutor({
    orders: [
      {
        id: 1,
        userId: 10,
        officeId: 20,
        orderProcessId: 30,
        whyOrdered: "Laptop refresh",
        status: "pending",
        expectedArrivalAt: "2026-03-20",
        totalCost: 1500,
      },
    ],
  });

  try {
    const data = await executor.execute<{
      orders: Array<{
        id: string;
        userId: string;
        officeId: string;
        orderProcessId: string;
        whyOrdered: string;
        status: string;
        expectedArrivalAt: string | null;
        totalCost: number | null;
      }>;
    }>(
      `
        query GetOrders {
          orders {
            id
            userId
            officeId
            orderProcessId
            whyOrdered
            status
            expectedArrivalAt
            totalCost
          }
        }
      `,
    );

    assert.deepEqual(data.orders, [
      {
        id: "1",
        userId: "10",
        officeId: "20",
        orderProcessId: "30",
        whyOrdered: "Laptop refresh",
        status: "pending",
        expectedArrivalAt: "2026-03-20",
        totalCost: 1500,
      },
    ]);
  } finally {
    await executor.stop();
  }
});

test("Mutation.createOrder persists and can be queried back", async () => {
  const executor = await createExecutor();

  try {
    const created = await executor.execute<{
      createOrder: {
        id: string;
        userId: string;
        officeId: string;
        orderProcessId: string;
        whyOrdered: string;
        status: string;
        expectedArrivalAt: string | null;
        totalCost: number | null;
      };
    }>(
      `
        mutation CreateOrder(
          $userId: ID!
          $officeId: ID!
          $orderProcessId: ID!
          $whyOrdered: String!
          $status: String!
          $expectedArrivalAt: String
          $totalCost: Float
        ) {
          createOrder(
            userId: $userId
            officeId: $officeId
            orderProcessId: $orderProcessId
            whyOrdered: $whyOrdered
            status: $status
            expectedArrivalAt: $expectedArrivalAt
            totalCost: $totalCost
          ) {
            id
            userId
            officeId
            orderProcessId
            whyOrdered
            status
            expectedArrivalAt
            totalCost
          }
        }
      `,
      {
        userId: "11",
        officeId: "21",
        orderProcessId: "31",
        whyOrdered: "New monitor order",
        status: "approved",
        expectedArrivalAt: "2026-03-25",
        totalCost: 499.99,
      },
    );

    assert.deepEqual(created.createOrder, {
      id: "1",
      userId: "11",
      officeId: "21",
      orderProcessId: "31",
      whyOrdered: "New monitor order",
      status: "approved",
      expectedArrivalAt: "2026-03-25",
      totalCost: 499.99,
    });

    const queried = await executor.execute<{
      order: {
        id: string;
        status: string;
        whyOrdered: string;
      } | null;
    }>(
      `
        query GetOrder($id: ID!) {
          order(id: $id) {
            id
            status
            whyOrdered
          }
        }
      `,
      { id: "1" },
    );

    assert.deepEqual(queried.order, {
      id: "1",
      status: "approved",
      whyOrdered: "New monitor order",
    });
  } finally {
    await executor.stop();
  }
});

test("Mutation.updateOrderStatus changes the stored order", async () => {
  const executor = await createExecutor({
    orders: [
      {
        id: 2,
        userId: 12,
        officeId: 22,
        orderProcessId: 32,
        whyOrdered: "Printer replacement",
        status: "pending",
        expectedArrivalAt: null,
        totalCost: null,
      },
    ],
  });

  try {
    const updated = await executor.execute<{
      updateOrderStatus: {
        id: string;
        status: string;
      } | null;
    }>(
      `
        mutation UpdateOrderStatus($id: ID!, $status: String!) {
          updateOrderStatus(id: $id, status: $status) {
            id
            status
          }
        }
      `,
      {
        id: "2",
        status: "ordered",
      },
    );

    assert.deepEqual(updated.updateOrderStatus, {
      id: "2",
      status: "ordered",
    });

    const queried = await executor.execute<{
      order: {
        id: string;
        status: string;
      } | null;
    }>(
      `
        query GetOrder($id: ID!) {
          order(id: $id) {
            id
            status
          }
        }
      `,
      { id: "2" },
    );

    assert.deepEqual(queried.order, {
      id: "2",
      status: "ordered",
    });
  } finally {
    await executor.stop();
  }
});

test("Mutation.createOrder can fall back to demo user and default reference ids", async () => {
  const executor = await createExecutor({
    users: [{ id: 7, role: "employee", isActive: true }],
    offices: [{ id: 8 }],
    orderProcesses: [{ id: 9 }],
    currentUserId: "7",
  });

  try {
    const created = await executor.execute<{
      createOrder: {
        id: string;
        userId: string;
        officeId: string;
        orderProcessId: string;
        whyOrdered: string;
        status: string;
      };
    }>(
      `
        mutation CreateOrderForDemo($whyOrdered: String!, $status: String!) {
          createOrder(whyOrdered: $whyOrdered, status: $status) {
            id
            userId
            officeId
            orderProcessId
            whyOrdered
            status
          }
        }
      `,
      {
        whyOrdered: "Demo order without manual ids",
        status: "pending",
      },
    );

    assert.deepEqual(created.createOrder, {
      id: "1",
      userId: "7",
      officeId: "8",
      orderProcessId: "9",
      whyOrdered: "Demo order without manual ids",
      status: "pending",
    });
  } finally {
    await executor.stop();
  }
});
