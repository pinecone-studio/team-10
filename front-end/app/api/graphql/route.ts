import { NextRequest, NextResponse } from "next/server";

const BACKEND_GRAPHQL_URL =
  process.env.BACKEND_GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  "http://localhost:3001/api/graphql";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(BACKEND_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") ?? "application/json",
      },
      body: await request.text(),
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        errors: [
          {
            message: `Frontend GraphQL proxy could not reach backend at ${BACKEND_GRAPHQL_URL}. Start the backend there or set BACKEND_GRAPHQL_URL/NEXT_PUBLIC_GRAPHQL_URL to the correct backend endpoint.`,
            extensions: {
              code: "BACKEND_UNAVAILABLE",
            },
          },
        ],
      },
      { status: 503 },
    );
  }
}
