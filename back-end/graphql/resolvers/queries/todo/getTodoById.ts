import { eq } from "drizzle-orm";
import { todos as todosTable } from "@/database/schema";
import type { QueryResolvers } from "../../../generated/types";

export const todo: NonNullable<QueryResolvers["todo"]> = async (
  _,
  { id },
  { db },
) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId)) return null;

  const [row] = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.id, parsedId))
    .limit(1);

  if (!row) return null;

  return {
    id: String(row.id),
    title: row.title,
    completed: row.completed,
  };
};
