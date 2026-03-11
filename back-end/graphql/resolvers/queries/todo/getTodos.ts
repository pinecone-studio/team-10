import type { QueryResolvers } from "../../../generated/types.ts";
import { listTodos } from "../../../../lib/todos.ts";

export const todos: NonNullable<QueryResolvers["todos"]> = async (
  _parent,
  _args,
  context,
) => listTodos(context.db);
