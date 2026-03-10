import { HttpError, jsonResponse } from "../../lib/http";
import { getTodoById, updateTodoRecord } from "../../lib/todo-repository";
import { deleteTodoImage, saveTodoImage } from "../../lib/todo-storage";
import type { Env, TodoPayload, TodoRecord } from "../../types";
import {
  normalizeTodoDescription,
  parseTodoMutationPayload,
  validateTodoImagePayload,
} from "./shared";

export async function updateTodoMutation(
  request: Request,
  env: Env,
  todoId: string
): Promise<Response> {
  const current = await getTodoById(todoId, env);
  const payload = await parseTodoMutationPayload(request);
  validateUpdateTodoPayload(payload);
  const nextTodo = buildUpdatedTodo(current, payload);

  if (payload.removeImage) {
    await deleteTodoImage(current.image_object_key, env);
    clearImage(nextTodo);
  }

  if (payload.imageBase64) {
    await deleteTodoImage(current.image_object_key, env);
    await attachImage(nextTodo, payload, env);
  }

  await updateTodoRecord(nextTodo, env);
  return jsonResponse(200, { item: await getTodoById(todoId, env) });
}

function validateUpdateTodoPayload(payload: TodoPayload): void {
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

  validateTodoImagePayload(payload);
}

function buildUpdatedTodo(current: TodoRecord, payload: TodoPayload): TodoRecord {
  return {
    ...current,
    title: payload.title?.trim() || current.title,
    description:
      payload.description !== undefined
        ? normalizeTodoDescription(payload.description)
        : current.description,
    is_completed:
      payload.isCompleted !== undefined ? Number(payload.isCompleted) : current.is_completed,
    updated_at: new Date().toISOString(),
  };
}

async function attachImage(todo: TodoRecord, payload: TodoPayload, env: Env): Promise<void> {
  const image = await saveTodoImage(todo.id, payload, env);
  todo.image_object_key = image.key;
  todo.image_file_name = payload.imageFileName!.trim();
  todo.image_content_type = payload.imageContentType!.trim();
  todo.image_file_size = image.size;
}

function clearImage(todo: TodoRecord): void {
  todo.image_object_key = null;
  todo.image_file_name = null;
  todo.image_content_type = null;
  todo.image_file_size = null;
}
