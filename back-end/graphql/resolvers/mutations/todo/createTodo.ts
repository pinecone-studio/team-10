import type { MutationResolvers } from "../../../generated/types.ts";
import { createTodo as createTodoRecord } from "../../../../lib/todos.ts";

export const createTodo: NonNullable<MutationResolvers["createTodo"]> = (
  _,
  { title },
  context,
) => createTodoRecord(context.db, title);
