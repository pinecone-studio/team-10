import { HttpError } from "./http";
import type { Env, TodoRecord } from "../types";

const todoSelect = `
  SELECT
    id, title, description, is_completed, image_object_key, image_file_name,
    image_content_type, image_file_size, created_at, updated_at
  FROM todos
`;

export async function listTodos(env: Env): Promise<TodoRecord[]> {
  const result = await env.DB.prepare(`${todoSelect} ORDER BY created_at DESC`).all<TodoRecord>();
  return result.results ?? [];
}

export async function getTodoById(todoId: string, env: Env): Promise<TodoRecord> {
  const todo = await env.DB.prepare(`${todoSelect} WHERE id = ?1`)
    .bind(todoId)
    .first<TodoRecord>();

  if (!todo) {
    throw new HttpError(404, "Todo not found");
  }

  return todo;
}

export async function createTodoRecord(todo: TodoRecord, env: Env): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO todos (
      id, title, description, is_completed, image_object_key, image_file_name,
      image_content_type, image_file_size, created_at, updated_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
  )
    .bind(
      todo.id,
      todo.title,
      todo.description,
      todo.is_completed,
      todo.image_object_key,
      todo.image_file_name,
      todo.image_content_type,
      todo.image_file_size,
      todo.created_at,
      todo.updated_at
    )
    .run();
}

export async function updateTodoRecord(todo: TodoRecord, env: Env): Promise<void> {
  await env.DB.prepare(
    `UPDATE todos
     SET title = ?1,
         description = ?2,
         is_completed = ?3,
         image_object_key = ?4,
         image_file_name = ?5,
         image_content_type = ?6,
         image_file_size = ?7,
         updated_at = ?8
     WHERE id = ?9`
  )
    .bind(
      todo.title,
      todo.description,
      todo.is_completed,
      todo.image_object_key,
      todo.image_file_name,
      todo.image_content_type,
      todo.image_file_size,
      todo.updated_at,
      todo.id
    )
    .run();
}

export async function deleteTodoRecord(todoId: string, env: Env): Promise<void> {
  await env.DB.prepare("DELETE FROM todos WHERE id = ?1").bind(todoId).run();
}
