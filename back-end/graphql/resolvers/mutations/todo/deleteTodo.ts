import type { MutationResolvers } from "../../../generated/types";
import { todos } from "../../store";

export const deleteTodo: NonNullable<MutationResolvers["deleteTodo"]> = (
  _,
  { id },
) => {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
};
