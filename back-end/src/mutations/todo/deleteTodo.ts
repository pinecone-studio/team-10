import { jsonResponse } from "../../lib/http";
import { deleteTodoRecord, getTodoById } from "../../lib/todo-repository";
import { deleteTodoImage } from "../../lib/todo-storage";
import type { Env } from "../../types";

export async function deleteTodoMutation(todoId: string, env: Env): Promise<Response> {
  const todo = await getTodoById(todoId, env);
  await deleteTodoImage(todo.image_object_key, env);
  await deleteTodoRecord(todoId, env);
  return jsonResponse(200, { deleted: true, id: todoId });
}
