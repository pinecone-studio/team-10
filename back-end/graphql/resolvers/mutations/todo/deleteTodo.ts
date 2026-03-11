import type { MutationResolvers } from "../../../generated/types.ts";
import { deleteTodo as deleteTodoRecord } from "../../../../lib/todos.ts";

export const deleteTodo: NonNullable<MutationResolvers["deleteTodo"]> = (
  _,
  { id },
  context,
) => deleteTodoRecord(context.db, id);
