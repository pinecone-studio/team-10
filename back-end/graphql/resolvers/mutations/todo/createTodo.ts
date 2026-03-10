import type { MutationResolvers } from "../../../generated/types";
import { todos, getNextId, type Todo } from "../../store";

export const createTodo: NonNullable<MutationResolvers["createTodo"]> = (
  _,
  { title }
) => {
  const todo: Todo = { id: getNextId(), title, completed: false };
  todos.push(todo);
  return todo;
};
