import type { MutationResolvers } from "../../../generated/types";
import { updateTodo as updateTodoItem } from "../../../lib/todo-api";

export const updateTodo: NonNullable<MutationResolvers["updateTodo"]> = (
  _,
  { id, title, completed }
) => updateTodoItem(id, title, completed);
