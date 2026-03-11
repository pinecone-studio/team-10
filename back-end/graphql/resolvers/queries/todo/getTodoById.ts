import type { QueryResolvers } from "../../../generated/types.ts";
import { getTodoById } from "../../../../lib/todos.ts";

export const todo: NonNullable<QueryResolvers["todo"]> = async (
  _parent,
  { id },
  context,
) => getTodoById(context.db, id);
