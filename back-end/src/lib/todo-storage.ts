import { decodeBase64, sanitizeFileName } from "./payload";
import { deleteAssetObject, getObjectResponse, putAssetObject } from "./r2-storage";
import type { Env, TodoPayload, TodoRecord } from "../types";

export async function getTodoImageResponse(todo: TodoRecord, env: Env): Promise<Response> {
  return getObjectResponse(
    todo.image_object_key,
    todo.image_content_type,
    todo.image_file_name,
    todo.image_file_size,
    env
  );
}

export async function saveTodoImage(
  todoId: string,
  payload: TodoPayload,
  env: Env
): Promise<{ key: string; size: number }> {
  const key = `todos/${todoId}/${sanitizeFileName(payload.imageFileName!)}`;
  const buffer = decodeBase64(payload.imageBase64!);
  await putAssetObject(key, buffer, payload.imageContentType!.trim(), env);
  return { key, size: buffer.byteLength };
}

export async function deleteTodoImage(objectKey: string | null, env: Env): Promise<void> {
  if (objectKey) {
    await deleteAssetObject(objectKey, env);
  }
}
