import { asc, eq } from "drizzle-orm";
import type { AppDb } from "./db.ts";
import { todos } from "../database/schema.ts";

type TodoRow = {
  id: number;
  title: string;
  completed: boolean;
};

export type TodoRecord = {
  id: string;
  title: string;
  completed: boolean;
};

type UpdateTodoInput = {
  title?: string | null;
  completed?: boolean | null;
};

const todoSelection = {
  id: todos.id,
  title: todos.title,
  completed: todos.completed,
};

function mapTodo(row: TodoRow): TodoRecord {
  return {
    id: String(row.id),
    title: row.title,
    completed: row.completed,
  };
}

function parseTodoId(id: string) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    throw new Error("Todo id must be an integer.");
  }

  return numericId;
}

export async function listTodos(db: AppDb): Promise<TodoRecord[]> {
  const rows = await db
    .select(todoSelection)
    .from(todos)
    .orderBy(asc(todos.id));

  return rows.map(mapTodo);
}

export async function getTodoById(
  db: AppDb,
  id: string,
): Promise<TodoRecord | null> {
  const numericId = parseTodoId(id);

  const [row] = await db
    .select(todoSelection)
    .from(todos)
    .where(eq(todos.id, numericId))
    .limit(1);

  return row ? mapTodo(row) : null;
}

export async function createTodo(db: AppDb, title: string): Promise<TodoRecord> {
  const [row] = await db
    .insert(todos)
    .values({ title, completed: false })
    .returning(todoSelection);

  return mapTodo(row);
}

export async function updateTodo(
  db: AppDb,
  id: string,
  input: UpdateTodoInput,
): Promise<TodoRecord | null> {
  const numericId = parseTodoId(id);
  const updates: Partial<typeof todos.$inferInsert> = {};

  if (input.title !== undefined) {
    updates.title = input.title ?? undefined;
  }

  if (input.completed !== undefined) {
    updates.completed = input.completed ?? undefined;
  }

  if (Object.keys(updates).length === 0) {
    return getTodoById(db, id);
  }

  const [row] = await db
    .update(todos)
    .set(updates)
    .where(eq(todos.id, numericId))
    .returning(todoSelection);

  return row ? mapTodo(row) : null;
}

export async function deleteTodo(db: AppDb, id: string): Promise<boolean> {
  const numericId = parseTodoId(id);

  const rows = await db
    .delete(todos)
    .where(eq(todos.id, numericId))
    .returning({ id: todos.id });

  return rows.length > 0;
}
