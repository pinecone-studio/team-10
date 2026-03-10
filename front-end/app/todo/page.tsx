import { TodoList } from "./_features/TodoList";

export default function TodoPage() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-xl px-6 py-16">
        <h1 className="mb-8 text-2xl font-semibold text-zinc-900 dark:text-white">
          Todos
        </h1>
        <TodoList />
      </main>
    </div>
  );
}
