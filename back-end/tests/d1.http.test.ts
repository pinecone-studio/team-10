import assert from "node:assert/strict";
import test from "node:test";
import {
  createHttpD1Database,
  type D1ExecResult,
  type D1QueryResult,
} from "../lib/d1.ts";

type FetchCall = {
  url: string | URL | globalThis.Request;
  init?: RequestInit;
};

function installFetchStub(responder: (call: FetchCall) => Promise<unknown>) {
  const originalFetch = globalThis.fetch;
  const calls: FetchCall[] = [];

  globalThis.fetch = (async (url, init) => {
    const call = { url, init };
    calls.push(call);

    return {
      ok: true,
      json: async () => responder(call),
    } as Response;
  }) as typeof fetch;

  return {
    calls,
    restore() {
      globalThis.fetch = originalFetch;
    },
  };
}

test("HttpD1Database raw queries return array rows from the query endpoint", async () => {
  const fetchStub = installFetchStub(async () => ({
    success: true,
    result: [
      {
        success: true,
        results: [
          { id: 1, email: "demo-user-1@example.local" },
          { id: 2, email: "demo-user-2@example.local" },
        ],
        meta: {},
      } satisfies D1QueryResult<Record<string, unknown>>,
    ],
  }));

  try {
    const database = createHttpD1Database({
      accountId: "account-id",
      databaseId: "database-id",
      apiToken: "api-token",
      baseUrl: "https://example.test/client/v4",
    });

    const rows = await database
      .prepare("select id, email from users order by id")
      .bind()
      .raw();

    assert.deepEqual(rows, [
      [1, "demo-user-1@example.local"],
      [2, "demo-user-2@example.local"],
    ]);
    assert.equal(fetchStub.calls.length, 1);
    assert.equal(
      String(fetchStub.calls[0]?.url),
      "https://example.test/client/v4/accounts/account-id/d1/database/database-id/query",
    );
  } finally {
    fetchStub.restore();
  }
});

test("HttpD1Database exec queries keep the D1 exec response shape", async () => {
  const fetchStub = installFetchStub(async () => ({
    success: true,
    result: [
      {
        success: true,
        results: [],
        meta: { duration: 1 },
      } satisfies D1QueryResult<Record<string, unknown>>,
    ],
  }));

  try {
    const database = createHttpD1Database({
      accountId: "account-id",
      databaseId: "database-id",
      apiToken: "api-token",
    });

    const result = await database
      .prepare("insert into users (email) values (?)")
      .bind("demo-user@example.local")
      .run();

    assert.deepEqual(result, {
      success: true,
      meta: { duration: 1 },
    } satisfies D1ExecResult);
  } finally {
    fetchStub.restore();
  }
});
