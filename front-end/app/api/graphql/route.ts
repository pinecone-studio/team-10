import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_GRAPHQL_URL = "http://localhost:3001/api/graphql";
const PRODUCTION_LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeGraphqlUrl(value: string, request: NextRequest) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("GraphQL URL cannot be empty.");
  }

  if (trimmed.startsWith("/")) {
    return new URL(trimmed, request.url).toString();
  }

  if (trimmed.endsWith("/api/graphql")) {
    return trimmed;
  }

  return new URL("/api/graphql", trimmed).toString();
}

function buildCandidateUrls(request: NextRequest) {
  const explicitUrls = [
    process.env.BACKEND_GRAPHQL_URL,
    process.env.NEXT_PUBLIC_GRAPHQL_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.GRAPHQL_PROXY_BACKEND_URL,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => normalizeGraphqlUrl(value, request));

  const developmentFallbackUrls =
    process.env.NODE_ENV === "production"
      ? []
      : [
          DEFAULT_BACKEND_GRAPHQL_URL,
          "http://localhost:3003/api/graphql",
        ];

  if (explicitUrls.length > 0) {
    return [...new Set([...explicitUrls, ...developmentFallbackUrls])];
  }

  return [...new Set(developmentFallbackUrls)];
}

function defaultPort(protocol: string) {
  return protocol === "https:" ? "443" : "80";
}

function isSelfProxyTarget(request: NextRequest, candidateUrl: string) {
  try {
    const requestUrl = new URL(request.url);
    const candidate = new URL(candidateUrl);

    return (
      requestUrl.protocol === candidate.protocol &&
      requestUrl.hostname === candidate.hostname &&
      (requestUrl.port || defaultPort(requestUrl.protocol)) ===
        (candidate.port || defaultPort(candidate.protocol)) &&
      requestUrl.pathname === candidate.pathname
    );
  } catch {
    return false;
  }
}

function isLocalhostTargetInProduction(candidateUrl: string) {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  try {
    const parsed = new URL(candidateUrl);
    return PRODUCTION_LOCALHOST_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

function buildForwardHeaders(request: NextRequest) {
  const headers = new Headers();

  headers.set(
    "content-type",
    request.headers.get("content-type") ?? "application/json",
  );

  const forwardHeaderNames = [
    "authorization",
    "cookie",
    "x-user-id",
    "apollo-require-preflight",
    "x-forwarded-for",
    "x-forwarded-proto",
    "x-forwarded-host",
    "cf-connecting-ip",
  ] as const;

  for (const headerName of forwardHeaderNames) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  // Preserve the frontend origin so backend-generated email links use the deployed UI URL.
  headers.set("x-app-origin", request.nextUrl.origin);
  if (!headers.get("origin")) {
    headers.set("origin", request.nextUrl.origin);
  }
  if (!headers.get("x-forwarded-proto")) {
    headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
  }
  if (!headers.get("x-forwarded-host")) {
    headers.set("x-forwarded-host", request.nextUrl.host);
  }

  return headers;
}

export async function POST(request: NextRequest) {
  const requestBody = await request.text();
  const candidateUrls = buildCandidateUrls(request);
  const failures: string[] = [];

  for (const candidateUrl of candidateUrls) {
    if (isSelfProxyTarget(request, candidateUrl)) {
      failures.push(`${candidateUrl} (skipped self-proxy target)`);
      continue;
    }

    if (isLocalhostTargetInProduction(candidateUrl)) {
      failures.push(`${candidateUrl} (skipped localhost target in production)`);
      continue;
    }

    try {
      const response = await fetch(candidateUrl, {
        method: "POST",
        headers: buildForwardHeaders(request),
        body: requestBody,
        cache: "no-store",
      });

      if (response.status >= 500) {
        failures.push(`${candidateUrl} (returned ${response.status})`);
        continue;
      }

      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "content-type":
            response.headers.get("content-type") ?? "application/json",
          "cache-control":
            response.headers.get("cache-control") ?? "no-store",
        },
      });
    } catch (error) {
      failures.push(
        `${candidateUrl} (${error instanceof Error ? error.message : "unreachable"})`,
      );
    }
  }

  return NextResponse.json(
    {
      errors: [
        {
          message:
            "Frontend GraphQL proxy could not reach the backend on any known URL.",
          extensions: {
            code: "BACKEND_UNAVAILABLE",
            attemptedUrls: candidateUrls,
            failures,
            guidance:
              "Set BACKEND_GRAPHQL_URL in Vercel to your backend GraphQL endpoint.",
          },
        },
      ],
    },
    { status: 503 },
  );
}
