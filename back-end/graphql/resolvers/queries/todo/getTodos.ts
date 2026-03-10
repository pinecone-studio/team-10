import type { QueryResolvers } from "../../../generated/types";
import { fetchTodos } from "../../../lib/todo-api";

export const todos: NonNullable<QueryResolvers["todos"]> = async () => fetchTodos();
