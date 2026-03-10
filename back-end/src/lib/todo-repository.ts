import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { todos } from "../db/schema";
import { HttpError } from "./http";
import type { Env, TodoRecord } from "../types";

export async function listTodos(env: Env): Promise<TodoRecord[]> {
  return getDb(env).select().from(todos).orderBy(desc(todos.created_at));
}

export async function getTodoById(todoId: string, env: Env): Promise<TodoRecord> {
  const todo = await getDb(env).select().from(todos).where(eq(todos.id, todoId)).get();

  if (!todo) {
    throw new HttpError(404, "Todo not found");
  }

  return todo;
}

export async function createTodoRecord(todo: TodoRecord, env: Env): Promise<void> {
  await getDb(env).insert(todos).values(todo);
}

export async function updateTodoRecord(todo: TodoRecord, env: Env): Promise<void> {
  await getDb(env)
    .update(todos)
    .set({
      title: todo.title,
      description: todo.description,
      is_completed: todo.is_completed,
      image_object_key: todo.image_object_key,
      image_file_name: todo.image_file_name,
      image_content_type: todo.image_content_type,
      image_file_size: todo.image_file_size,
      updated_at: todo.updated_at,
    })
    .where(eq(todos.id, todo.id));
}

export async function deleteTodoRecord(todoId: string, env: Env): Promise<void> {
  await getDb(env).delete(todos).where(eq(todos.id, todoId));
}
