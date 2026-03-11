import type { MutationResolvers } from "../../../generated/types.ts";
import { updateTodo as updateTodoRecord } from "../../../../lib/todos.ts";

export const updateTodo: NonNullable<MutationResolvers["updateTodo"]> = (
  _,
  { id, title, completed },
  context,
) => updateTodoRecord(context.db, id, { title, completed });
