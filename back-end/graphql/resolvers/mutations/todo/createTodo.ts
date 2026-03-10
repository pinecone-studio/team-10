import type { MutationResolvers } from "../../../generated/types";
import { createTodo as createTodoItem } from "../../../lib/todo-api";

export const createTodo: NonNullable<MutationResolvers["createTodo"]> = (
  _,
  { title }
) => createTodoItem(title);
