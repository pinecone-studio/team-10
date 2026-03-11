import { desc } from "drizzle-orm";
import { todos as todosTable } from "@/database/schema";
import type { QueryResolvers } from "../../../generated/types";

export const todos: NonNullable<QueryResolvers["todos"]> = async (
  _,
  __,
  { db },
) => {
  const rows = await db.select().from(todosTable).orderBy(desc(todosTable.id));
  return rows.map((row) => ({
    id: String(row.id),
    title: row.title,
    completed: row.completed,
  }));
};
