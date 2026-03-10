import { HttpError } from "../../lib/http";
import { normalizeText } from "../../lib/payload";
import type { TodoPayload } from "../../types";

export async function parseTodoMutationPayload(request: Request): Promise<TodoPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new HttpError(415, "Content-Type must be application/json");
  }

  return (await request.json()) as TodoPayload;
}

export function normalizeTodoDescription(value: string | null | undefined): string | null {
  return normalizeText(value);
}

export function validateTodoImagePayload(payload: TodoPayload): void {
  const hasImageBits =
    payload.imageFileName !== undefined ||
    payload.imageContentType !== undefined ||
    payload.imageBase64 !== undefined;

  if (!hasImageBits) {
    return;
  }

  if (!payload.imageFileName?.trim()) {
    throw new HttpError(400, "imageFileName is required when sending image data");
  }

  if (!payload.imageContentType?.trim()) {
    throw new HttpError(400, "imageContentType is required when sending image data");
  }

  if (!payload.imageBase64?.trim()) {
    throw new HttpError(400, "imageBase64 is required when sending image data");
  }
}
