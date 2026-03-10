import {
  createTodoRecord,
  deleteTodoRecord,
  getTodoById,
  listTodos,
  updateTodoRecord,
} from "../lib/todo-repository";
import {
  normalizeTodoDescription,
  parseTodoPayload,
  validateCreateTodoPayload,
  validateUpdateTodoPayload,
} from "../lib/todo-payload";
import { deleteTodoImage, getTodoImageResponse, saveTodoImage } from "../lib/todo-storage";
import { jsonResponse } from "../lib/http";
import type { Env, TodoPayload, TodoRecord } from "../types";

export async function handleTodoCollection(request: Request, env: Env): Promise<Response> {
  if (request.method === "GET") {
    return jsonResponse(200, { items: await listTodos(env) });
  }

  if (request.method === "POST") {
    return createTodo(request, env);
  }

  return jsonResponse(405, { error: "Method not allowed" });
}

export async function handleTodoItem(
  request: Request,
  env: Env,
  todoId: string,
  wantsImage: boolean
): Promise<Response> {
  if (request.method === "GET" && wantsImage) {
    return getTodoImageResponse(await getTodoById(todoId, env), env);
  }

  if (request.method === "GET") {
    return jsonResponse(200, { item: await getTodoById(todoId, env) });
  }

  if (request.method === "PUT") {
    return updateTodo(request, env, todoId);
  }

  if (request.method === "DELETE") {
    return removeTodo(env, todoId);
  }

  return jsonResponse(405, { error: "Method not allowed" });
}

async function createTodo(request: Request, env: Env): Promise<Response> {
  const payload = await parseTodoPayload(request);
  validateCreateTodoPayload(payload);
  const todo = buildNewTodo(payload);

  if (payload.imageBase64) {
    await attachImage(todo, payload, env);
  }

  await createTodoRecord(todo, env);
  return jsonResponse(201, { item: await getTodoById(todo.id, env) });
}

async function updateTodo(request: Request, env: Env, todoId: string): Promise<Response> {
  const current = await getTodoById(todoId, env);
  const payload = await parseTodoPayload(request);
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

async function removeTodo(env: Env, todoId: string): Promise<Response> {
  const todo = await getTodoById(todoId, env);
  await deleteTodoImage(todo.image_object_key, env);
  await deleteTodoRecord(todoId, env);
  return jsonResponse(200, { deleted: true, id: todoId });
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
