export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type",
} as const;

export function jsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: jsonHeaders,
  });
}

export function preflightResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: jsonHeaders,
  });
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return jsonResponse(error.status, { error: error.message });
  }

  if (isHttpErrorLike(error)) {
    return jsonResponse(error.status, { error: error.message });
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  return jsonResponse(500, { error: message });
}

function isHttpErrorLike(error: unknown): error is { status: number; message: string } {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { status?: unknown; message?: unknown };
  return typeof candidate.status === "number" && typeof candidate.message === "string";
}
