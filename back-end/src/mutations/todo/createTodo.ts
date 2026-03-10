import { HttpError, jsonResponse } from "../../lib/http";
import { createTodoRecord, getTodoById } from "../../lib/todo-repository";
import { saveTodoImage } from "../../lib/todo-storage";
import type { Env, TodoPayload, TodoRecord } from "../../types";
import {
  normalizeTodoDescription,
  parseTodoMutationPayload,
  validateTodoImagePayload,
} from "./shared";

export async function createTodoMutation(
  request: Request,
  env: Env
): Promise<Response> {
  const payload = await parseTodoMutationPayload(request);

  if (!payload.title?.trim()) {
    throw new HttpError(400, "title is required");
  }

  validateTodoImagePayload(payload);

  const todo = buildNewTodo(payload);

  if (payload.imageBase64) {
    await attachImage(todo, payload, env);
  }

  await createTodoRecord(todo, env);
  return jsonResponse(201, { item: await getTodoById(todo.id, env) });
}

function buildNewTodo(payload: TodoPayload): TodoRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: payload.title!.trim(),
    description: normalizeTodoDescription(payload.description),
    is_completed: payload.isCompleted ? 1 : 0,
    image_object_key: null,
    image_file_name: null,
    image_content_type: null,
    image_file_size: null,
    created_at: now,
    updated_at: now,
  };
}

async function attachImage(todo: TodoRecord, payload: TodoPayload, env: Env): Promise<void> {
  const image = await saveTodoImage(todo.id, payload, env);
  todo.image_object_key = image.key;
  todo.image_file_name = payload.imageFileName!.trim();
  todo.image_content_type = payload.imageContentType!.trim();
  todo.image_file_size = image.size;
}
