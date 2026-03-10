import { HttpError } from "./http";
import type { AssetPayload } from "../types";

export async function parsePayload(request: Request): Promise<AssetPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new HttpError(415, "Content-Type must be application/json");
  }

  return (await request.json()) as AssetPayload;
}

export function validateCreatePayload(payload: AssetPayload): void {
  if (!payload.title?.trim()) {
    throw new HttpError(400, "title is required");
  }

  if (!payload.fileName?.trim()) {
    throw new HttpError(400, "fileName is required");
  }

  if (!payload.contentType?.trim()) {
    throw new HttpError(400, "contentType is required");
  }

  if (!payload.fileBase64?.trim()) {
    throw new HttpError(400, "fileBase64 is required");
  }
}

export function validateUpdatePayload(payload: AssetPayload): void {
  const hasMutation =
    payload.title !== undefined ||
    payload.description !== undefined ||
    payload.fileName !== undefined ||
    payload.contentType !== undefined ||
    payload.fileBase64 !== undefined;

  if (!hasMutation) {
    throw new HttpError(400, "At least one field must be provided for update");
  }
}

export function normalizeText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function sanitizeFileName(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
}

export function decodeBase64(value: string): ArrayBuffer {
  const cleaned = value.includes(",") ? value.split(",").pop() ?? "" : value;
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}
