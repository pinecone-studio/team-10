import type { QueryResolvers } from "../../../generated/types";
import { fetchTodoById } from "../../../lib/todo-api";

export const todo: NonNullable<QueryResolvers["todo"]> = async (_, { id }) =>
  fetchTodoById(id);
