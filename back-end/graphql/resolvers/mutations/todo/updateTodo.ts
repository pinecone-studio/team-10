import type { MutationResolvers } from "../../../generated/types";
import { eq } from "drizzle-orm";
import { todos as todosTable } from "@/database/schema";

export const updateTodo: NonNullable<MutationResolvers["updateTodo"]> = async (
  _,
  { id, title, completed },
  { db },
) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId)) return null;

  const updates: Partial<typeof todosTable.$inferInsert> = {};
  if (title != null) updates.title = title;
  if (completed != null) updates.completed = completed;

  if (Object.keys(updates).length > 0) {
    await db.update(todosTable).set(updates).where(eq(todosTable.id, parsedId));
  }

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
