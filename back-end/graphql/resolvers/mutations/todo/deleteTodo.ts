import type { MutationResolvers } from "../../../generated/types";
import { deleteTodo as deleteTodoItem } from "../../../lib/todo-api";

export const deleteTodo: NonNullable<MutationResolvers["deleteTodo"]> = (
  _,
  { id },
) => deleteTodoItem(id);
