"use client";

import { useState } from "react";
import {
  useGetTodosQuery,
  useCreateTodoMutation,
  useDeleteTodoMutation,
} from "@/graphql/generated/hooks";
import { TodoForm } from "../_components/TodoForm";
import { TodoItem } from "../_components/TodoItem";
import { Todo } from "@/graphql/generated/graphql";

export function TodoList() {
  const [newTitle, setNewTitle] = useState("");

  const { data, loading, error } = useGetTodosQuery();
  const [createTodo] = useCreateTodoMutation({ refetchQueries: ["GetTodos"] });
  const [deleteTodo] = useDeleteTodoMutation({ refetchQueries: ["GetTodos"] });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTodo({ variables: { title: newTitle.trim() } });
    setNewTitle("");
  };

  const handleDelete = (id: string) => {
    deleteTodo({ variables: { id } });
  };

  if (loading) return <p className="text-zinc-500">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  return (
    <div className="flex flex-col gap-6">
      <TodoForm
        value={newTitle}
        onChange={setNewTitle}
        onSubmit={handleCreate}
      />
      <ul className="flex flex-col gap-2">
        {data?.todos.map((todo: Todo) => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            title={todo.title}
            completed={todo.completed}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}
