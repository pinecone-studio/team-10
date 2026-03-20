import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabase, getDatabase, type AppDb } from "./db.ts";
import type { D1DatabaseLike } from "./d1.ts";

export type RuntimeConfig = {
  appUrl: string;
  assignmentJwtSecret: string;
  assignmentJwtVerificationSecrets: string[];
  smtpService: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpSecure: boolean;
  smtpUser: string | null;
  smtpPass: string | null;
  emailFrom: string | null;
  emailFromName: string | null;
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
  requestAppUrl?: string | null;
};

const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function uniqueNonEmptySecrets(values: Array<string | null | undefined>) {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}

function normalizeConfiguredAppUrl(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function isLocalhostUrl(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return LOCALHOST_HOSTNAMES.has(parsed.hostname);
  } catch {
    return false;
  }
}

function resolveRuntimeAppUrl(options: { requestAppUrl?: string | null }) {
  const configuredAppUrl = normalizeConfiguredAppUrl(
    process.env.FRONTEND_APP_URL?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      process.env.APP_URL?.trim() ||
      null,
  );
  const requestAppUrl = normalizeConfiguredAppUrl(options.requestAppUrl ?? null);

  // Always trust an explicit non-localhost configured URL first.
  if (configuredAppUrl && !isLocalhostUrl(configuredAppUrl)) {
    return configuredAppUrl;
  }

  // If the configured URL is localhost (or unset), prefer runtime request origin.
  if (requestAppUrl && !isLocalhostUrl(requestAppUrl)) {
    return requestAppUrl;
  }

  // Fall back to whichever value exists (including localhost in local/dev).
  return configuredAppUrl ?? requestAppUrl ?? "http://localhost:3000";
}

function resolveRequestAppUrl(request: Request) {
  const explicitAppOrigin = request.headers.get("x-app-origin")?.trim() || null;
  if (explicitAppOrigin) {
    return explicitAppOrigin;
  }

  const requestOrigin = request.headers.get("origin")?.trim() || null;
  if (requestOrigin) {
    return requestOrigin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.trim() || null;
  if (forwardedHost) {
    const forwardedProto =
      request.headers.get("x-forwarded-proto")?.trim() || "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  return null;
}

export function createGraphQLContextValue(
  options: GraphQLContextOptions = {},
): GraphQLContext {
  const appUrl = resolveRuntimeAppUrl({ requestAppUrl: options.requestAppUrl });
  const legacyAssignmentJwtSecrets = (
    process.env.ASSET_ASSIGNMENT_JWT_LEGACY_SECRETS ?? ""
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const assignmentJwtVerificationSecrets = uniqueNonEmptySecrets([
    process.env.ASSET_ASSIGNMENT_JWT_SECRET,
    process.env.JWT_TOKEN,
    process.env.JWToken,
    ...legacyAssignmentJwtSecrets,
    process.env.CLOUDFLARE_API_TOKEN,
    process.env.CLOUDFLARE_D1_API_TOKEN,
    "development-assignment-secret",
  ]);
  const assignmentJwtSecret =
    assignmentJwtVerificationSecrets[0] ?? "development-assignment-secret";

  return {
    db: options.db ?? getDatabase(),
    currentUserId: options.currentUserId ?? null,
    runtimeConfig: {
      appUrl,
      assignmentJwtSecret,
      assignmentJwtVerificationSecrets,
      smtpService: process.env.SMTP_SERVICE?.trim() || null,
      smtpHost: process.env.SMTP_HOST?.trim() || null,
      smtpPort: process.env.SMTP_PORT?.trim()
        ? Number(process.env.SMTP_PORT.trim())
        : null,
      smtpSecure: (process.env.SMTP_SECURE?.trim() || "").toLowerCase() === "true",
      smtpUser: process.env.SMTP_USER?.trim() || null,
      smtpPass: process.env.SMTP_PASS?.trim() || null,
      emailFrom: process.env.EMAIL_FROM?.trim() || null,
      emailFromName: process.env.EMAIL_FROM_NAME?.trim() || null,
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

  // In Cloudflare Workers, prefer bound D1 first to avoid API-token auth failures.
  if (!resolvedDb) {
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

  // Fall back to HTTP D1 runtime config for local/dev and non-worker environments.
  if (!resolvedDb) {
    try {
      resolvedDb = getDatabase();
    } catch {
      resolvedDb = undefined;
    }
  }

  return createGraphQLContextValue({
    ...options,
    db: resolvedDb ?? getDatabase(),
    requestAppUrl: options.requestAppUrl ?? resolveRequestAppUrl(request),
    currentUserId:
      options.currentUserId ?? request.headers.get("x-user-id"),
    requestIpAddress:
      options.requestIpAddress ??
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null,
  });
}
