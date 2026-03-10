import { jsonResponse } from "../lib/http";
import { getTodoById, listTodos } from "../lib/todo-repository";
import { getTodoImageResponse } from "../lib/todo-storage";
import type { Env } from "../types";

export async function queryTodos(env: Env): Promise<Response> {
  return jsonResponse(200, { items: await listTodos(env) });
}

export async function queryTodo(todoId: string, env: Env): Promise<Response> {
  return jsonResponse(200, { item: await getTodoById(todoId, env) });
}

export async function queryTodoImage(todoId: string, env: Env): Promise<Response> {
  return getTodoImageResponse(await getTodoById(todoId, env), env);
}
