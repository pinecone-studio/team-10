import type { MutationResolvers } from "../../../generated/types";
import { todos } from "../../store";

export const updateTodo: NonNullable<MutationResolvers["updateTodo"]> = (
  _,
  { id, title, completed }
) => {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return null;
  if (title != null) todo.title = title;
  if (completed != null) todo.completed = completed;
  return todo;
};
