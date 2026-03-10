import { todos } from "../../store";

export const todo = (_: unknown, { id }: { id: string }) =>
  todos.find((t) => t.id === id) ?? null;
