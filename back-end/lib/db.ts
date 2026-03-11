import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "@/database/schema";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;

const endpoint =
  accountId && databaseId
    ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`
    : null;

type D1QueryResult = {
  success: boolean;
  results?: unknown[];
  error?: string;
};

type D1HttpResponse = {
  success: boolean;
  errors?: { message?: string }[];
  result?: D1QueryResult[];
};

const query = async (sql: string, params: unknown[]) => {
  if (!endpoint || !apiToken) {
    throw new Error(
      "Missing Cloudflare D1 credentials. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_API_TOKEN.",
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });

  const payload = (await response.json()) as D1HttpResponse;

  if (!response.ok || !payload.success) {
    const message =
      payload.errors?.[0]?.message ?? `D1 HTTP request failed (${response.status}).`;
    throw new Error(message);
  }

  const firstResult = payload.result?.[0];
  if (!firstResult?.success) {
    throw new Error(firstResult?.error ?? "D1 query execution failed.");
  }

  return {
    rows: firstResult.results ?? [],
  };
};

export const db = drizzle(query, { schema });

export type DB = typeof db;
