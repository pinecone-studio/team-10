import type { MutationResolvers } from "../../../generated/types";
import { eq } from "drizzle-orm";
import { todos as todosTable } from "@/database/schema";

export const deleteTodo: NonNullable<MutationResolvers["deleteTodo"]> = async (
  _,
  { id },
  { db },
) => {
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId)) return false;

  const [existing] = await db
    .select({ id: todosTable.id })
    .from(todosTable)
    .where(eq(todosTable.id, parsedId))
    .limit(1);

  if (!existing) return false;

  await db.delete(todosTable).where(eq(todosTable.id, parsedId));
  return true;
};
