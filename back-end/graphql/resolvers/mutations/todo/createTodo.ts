import type { MutationResolvers } from "../../../generated/types";
import { todos as todosTable } from "@/database/schema";

export const createTodo: NonNullable<MutationResolvers["createTodo"]> = (
  _,
  { title },
  { db },
) =>
  db
    .insert(todosTable)
    .values({ title, completed: false })
    .returning()
    .then((rows) => rows[0])
    .then((row) => ({
      id: String(row.id),
      title: row.title,
      completed: row.completed,
    }));
