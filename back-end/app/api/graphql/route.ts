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

export function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const res = await handler(req);
  Object.entries(CORS_HEADERS).forEach(([key, value]) =>
    res.headers.set(key, value),
  );
  return res;
}

export async function POST(req: NextRequest) {
  const res = await handler(req);
  Object.entries(CORS_HEADERS).forEach(([key, value]) =>
    res.headers.set(key, value),
  );
  return res;
}
