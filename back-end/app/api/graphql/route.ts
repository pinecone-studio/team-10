import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { type NextRequest, NextResponse } from "next/server";
import { createGraphQLServer } from "@/graphql/server";
import { createGraphQLContext, type GraphQLContext } from "@/lib/context";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const server = createGraphQLServer();

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  {
    context: async (req) => createGraphQLContext(req),
  },
);

function isMissingRuntimeConfigError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.startsWith("Missing required environment variable:")
  );
}

function withCorsHeaders(res: Response) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) =>
    res.headers.set(key, value),
  );
  return res;
}

function createRuntimeConfigErrorResponse() {
  return withCorsHeaders(
    NextResponse.json(
      {
        errors: [
          {
            message:
              "GraphQL backend is not configured. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and either CLOUDFLARE_D1_API_TOKEN or CLOUDFLARE_API_TOKEN.",
            extensions: {
              code: "SERVICE_CONFIGURATION_ERROR",
            },
          },
        ],
      },
      { status: 503 },
    ),
  );
}

async function handleRequest(req: NextRequest) {
  try {
    return withCorsHeaders(await handler(req));
  } catch (error) {
    if (isMissingRuntimeConfigError(error)) {
      return createRuntimeConfigErrorResponse();
    }

    throw error;
  }
}

export function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}
