import { HttpError } from "./http";
import { normalizeText } from "./payload";
import type { TodoPayload } from "../types";

export async function parseTodoPayload(request: Request): Promise<TodoPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new HttpError(415, "Content-Type must be application/json");
  }

  return (await request.json()) as TodoPayload;
}

export function validateCreateTodoPayload(payload: TodoPayload): void {
  if (!payload.title?.trim()) {
    throw new HttpError(400, "title is required");
  }

  validateImageFields(payload);
}

export function validateUpdateTodoPayload(payload: TodoPayload): void {
  const hasMutation =
    payload.title !== undefined ||
    payload.description !== undefined ||
    payload.isCompleted !== undefined ||
    payload.imageFileName !== undefined ||
    payload.imageContentType !== undefined ||
    payload.imageBase64 !== undefined ||
    payload.removeImage !== undefined;

  if (!hasMutation) {
    throw new HttpError(400, "At least one field must be provided for update");
  }

  validateImageFields(payload);
}

export function normalizeTodoDescription(value: string | null | undefined): string | null {
  return normalizeText(value);
}

function validateImageFields(payload: TodoPayload): void {
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
