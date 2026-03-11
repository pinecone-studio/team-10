import test from "node:test";
import assert from "node:assert/strict";
import { createDatabase } from "../lib/db.ts";
import { createGraphQLContextValue } from "../lib/context.ts";
import { createGraphQLServer } from "../graphql/server.ts";
import { FakeD1Database } from "./support/fake-d1.ts";

type GraphQLSingleResult<TData> = {
  data?: TData;
  errors?: Array<{ message: string }>;
};

async function executeOperation<TData>(
  query: string,
  variables: Record<string, unknown> | undefined,
  seedTodos: Array<{ id?: number; title: string; completed: boolean }> = [],
) {
  const server = createGraphQLServer();
  await server.start();

  const database = createDatabase(new FakeD1Database(seedTodos));
  const response = await server.executeOperation(
    {
      query,
      variables,
    },
    {
      contextValue: createGraphQLContextValue({ db: database }),
    },
  );

  await server.stop();

  assert.equal(response.body.kind, "single");

  const result = response.body.singleResult as GraphQLSingleResult<TData>;

  assert.equal(result.errors, undefined);

  return JSON.parse(JSON.stringify(result.data)) as TData;
}

test("Query.todos returns rows from Drizzle-backed storage", async () => {
  const data = await executeOperation<{
    todos: Array<{ id: string; title: string; completed: boolean }>;
  }>(
    `
      query GetTodos {
        todos {
          id
          title
          completed
        }
      }
    `,
    undefined,
    [
      { id: 1, title: "Buy groceries", completed: false },
      { id: 2, title: "Walk the dog", completed: true },
    ],
  );

  assert.deepEqual(data.todos, [
    { id: "1", title: "Buy groceries", completed: false },
    { id: "2", title: "Walk the dog", completed: true },
  ]);
});

test("Mutation.createTodo persists a new todo", async () => {
  const data = await executeOperation<{
    createTodo: { id: string; title: string; completed: boolean };
  }>(
    `
      mutation CreateTodo($title: String!) {
        createTodo(title: $title) {
          id
          title
          completed
        }
      }
    `,
    { title: "Ship D1 integration" },
  );

  assert.deepEqual(data.createTodo, {
    id: "1",
    title: "Ship D1 integration",
    completed: false,
  });
});

test("Mutation.updateTodo changes persisted fields", async () => {
  const data = await executeOperation<{
    updateTodo: { id: string; title: string; completed: boolean } | null;
  }>(
    `
      mutation UpdateTodo($id: ID!, $title: String, $completed: Boolean) {
        updateTodo(id: $id, title: $title, completed: $completed) {
          id
          title
          completed
        }
      }
    `,
    {
      id: "2",
      title: "Walk the dog again",
      completed: false,
    },
    [{ id: 2, title: "Walk the dog", completed: true }],
  );

  assert.deepEqual(data.updateTodo, {
    id: "2",
    title: "Walk the dog again",
    completed: false,
  });
});

test("Mutation.deleteTodo removes the todo", async () => {
  const data = await executeOperation<{ deleteTodo: boolean }>(
    `
      mutation DeleteTodo($id: ID!) {
        deleteTodo(id: $id)
      }
    `,
    { id: "3" },
    [{ id: 3, title: "Read a book", completed: false }],
  );

  assert.equal(data.deleteTodo, true);
});
