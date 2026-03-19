import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_GRAPHQL_URL = "http://localhost:3001/api/graphql";

function normalizeGraphqlUrl(value: string) {
  if (value.endsWith("/api/graphql")) {
    return value;
  }

  return new URL("/api/graphql", value).toString();
}

function buildCandidateUrls(request: NextRequest) {
  const explicitUrls = [
    process.env.BACKEND_GRAPHQL_URL,
    process.env.NEXT_PUBLIC_GRAPHQL_URL,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => normalizeGraphqlUrl(value.trim()));

  const requestHost = request.headers.get("host");
  const isLocalRequest =
    requestHost?.includes("localhost") || requestHost?.includes("127.0.0.1");

  const inferredUrls = (() => {
    if (!isLocalRequest) {
      return [DEFAULT_BACKEND_GRAPHQL_URL];
    }

    const requestUrl = new URL(request.url);
    const frontendPort = Number(requestUrl.port || (requestUrl.protocol === "https:" ? 443 : 80));
    const localPorts = [
      3001,
      3000,
      frontendPort + 1,
      frontendPort - 1,
      3002,
      3010,
      4000,
    ].filter((port, index, ports) => port > 0 && ports.indexOf(port) === index);

    return localPorts.map(
      (port) => `${requestUrl.protocol}//${requestUrl.hostname}:${port}/api/graphql`,
    );
  })();

  return [...new Set([...explicitUrls, ...inferredUrls, DEFAULT_BACKEND_GRAPHQL_URL])];
}

export async function POST(request: NextRequest) {
  const requestBody = await request.text();
  const candidateUrls = buildCandidateUrls(request);
  const failures: string[] = [];

  for (const candidateUrl of candidateUrls) {
    try {
      const response = await fetch(candidateUrl, {
        method: "POST",
        headers: {
          "content-type": request.headers.get("content-type") ?? "application/json",
        },
        body: requestBody,
        cache: "no-store",
      });

      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "content-type":
            response.headers.get("content-type") ?? "application/json",
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
          },
        },
      ],
    },
    { status: 503 },
  );
}
