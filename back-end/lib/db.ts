import { drizzle } from "drizzle-orm/d1";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as schema from "../database/schema.ts";
import { createHttpD1Database, type D1DatabaseLike } from "./d1.ts";

type RequiredEnvVar =
  | "CLOUDFLARE_ACCOUNT_ID"
  | "CLOUDFLARE_D1_DATABASE_ID"
  | "CLOUDFLARE_API_TOKEN"
  | "CLOUDFLARE_D1_API_TOKEN";

export function createDatabase(client: D1DatabaseLike) {
  return drizzle(client as never, { schema });
}

export type AppDb = ReturnType<typeof createDatabase>;

let cachedDatabase: AppDb | undefined;

function loadDotEnvValue(name: RequiredEnvVar) {
  try {
    const envPath = resolve(process.cwd(), ".env");
    const envContents = readFileSync(envPath, "utf8");
    const lines = envContents.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex < 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (key !== name) {
        continue;
      }

      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      if (
        (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'"))
      ) {
        return rawValue.slice(1, -1);
      }

      return rawValue;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getRequiredEnvVar(name: RequiredEnvVar) {
  const value = loadDotEnvValue(name) ?? process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createRuntimeDatabase() {
  const apiToken =
    loadDotEnvValue("CLOUDFLARE_API_TOKEN") ??
    process.env.CLOUDFLARE_API_TOKEN ??
    loadDotEnvValue("CLOUDFLARE_D1_API_TOKEN") ??
    process.env.CLOUDFLARE_D1_API_TOKEN ??
    getRequiredEnvVar("CLOUDFLARE_D1_API_TOKEN");

  return createDatabase(
    createHttpD1Database({
      accountId: getRequiredEnvVar("CLOUDFLARE_ACCOUNT_ID"),
      databaseId: getRequiredEnvVar("CLOUDFLARE_D1_DATABASE_ID"),
      apiToken,
    }),
  );
}

export function getDatabase() {
  cachedDatabase ??= createRuntimeDatabase();
  return cachedDatabase;
}
