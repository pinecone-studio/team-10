import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabase, getDatabase, type AppDb } from "./db.ts";
import type { D1DatabaseLike } from "./d1.ts";

export type RuntimeConfig = {
  appUrl: string;
  assignmentJwtSecret: string;
  sendgridApiKey: string | null;
  sendgridFromEmail: string | null;
  r2AccountId: string | null;
  r2AccessKeyId: string | null;
  r2SecretAccessKey: string | null;
  r2BucketName: string | null;
};

export type GraphQLContext = {
  db: AppDb;
  currentUserId: string | null;
  runtimeConfig: RuntimeConfig;
  requestIpAddress: string | null;
};

type GraphQLContextOptions = {
  db?: AppDb;
  currentUserId?: string | null;
  requestIpAddress?: string | null;
};

export function createGraphQLContextValue(
  options: GraphQLContextOptions = {},
): GraphQLContext {
  const appUrl =
    process.env.FRONTEND_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "http://localhost:3000";
  const assignmentJwtSecret =
    process.env.ASSET_ASSIGNMENT_JWT_SECRET?.trim() ||
    process.env.CLOUDFLARE_API_TOKEN?.trim() ||
    process.env.CLOUDFLARE_D1_API_TOKEN?.trim() ||
    "development-assignment-secret";

  return {
    db: options.db ?? getDatabase(),
    currentUserId: options.currentUserId ?? null,
    runtimeConfig: {
      appUrl,
      assignmentJwtSecret,
      sendgridApiKey: process.env.SENDGRID_API_KEY?.trim() || null,
      sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL?.trim() || null,
      r2AccountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim() || null,
      r2AccessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim() || null,
      r2SecretAccessKey:
        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim() || null,
      r2BucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim() || null,
    },
    requestIpAddress: options.requestIpAddress ?? null,
  };
}

export async function createGraphQLContext(
  request: Request,
  options: GraphQLContextOptions = {},
): Promise<GraphQLContext> {
  let resolvedDb = options.db;
  const hasRuntimeHttpDatabaseConfig = Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() &&
      process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() &&
      (process.env.CLOUDFLARE_D1_API_TOKEN?.trim() ||
        process.env.CLOUDFLARE_API_TOKEN?.trim()),
  );

  if (!resolvedDb && !hasRuntimeHttpDatabaseConfig) {
    try {
      const cloudflareContext = await getCloudflareContext({ async: true });
      const bindingDatabase = (
        cloudflareContext.env as Record<string, unknown>
      ).DB as { prepare?: unknown; batch?: unknown } | undefined;

      if (
        bindingDatabase &&
        typeof bindingDatabase === "object" &&
        "prepare" in bindingDatabase &&
        typeof bindingDatabase.prepare === "function" &&
        "batch" in bindingDatabase &&
        typeof bindingDatabase.batch === "function"
      ) {
        resolvedDb = createDatabase(bindingDatabase as D1DatabaseLike);
      }
    } catch {
      resolvedDb = undefined;
    }
  }

  return createGraphQLContextValue({
    ...options,
    db: resolvedDb ?? getDatabase(),
    currentUserId:
      options.currentUserId ?? request.headers.get("x-user-id"),
    requestIpAddress:
      options.requestIpAddress ??
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null,
  });
}
