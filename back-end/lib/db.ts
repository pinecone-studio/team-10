import { drizzle } from "drizzle-orm/d1";
import * as schema from "../database/schema.ts";
import { createHttpD1Database, type D1DatabaseLike } from "./d1.ts";

type RequiredEnvVar =
  | "CLOUDFLARE_ACCOUNT_ID"
  | "CLOUDFLARE_D1_DATABASE_ID"
  | "CLOUDFLARE_API_TOKEN";

export function createDatabase(client: D1DatabaseLike) {
  return drizzle(client as never, { schema });
}

export type AppDb = ReturnType<typeof createDatabase>;

let cachedDatabase: AppDb | undefined;

function getRequiredEnvVar(name: RequiredEnvVar) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createRuntimeDatabase() {
  return createDatabase(
    createHttpD1Database({
      accountId: getRequiredEnvVar("CLOUDFLARE_ACCOUNT_ID"),
      databaseId: getRequiredEnvVar("CLOUDFLARE_D1_DATABASE_ID"),
      apiToken: getRequiredEnvVar("CLOUDFLARE_API_TOKEN"),
    }),
  );
}

export function getDatabase() {
  cachedDatabase ??= createRuntimeDatabase();
  return cachedDatabase;
}
