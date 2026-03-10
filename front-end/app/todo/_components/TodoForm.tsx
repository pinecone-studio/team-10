"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function TodoForm({ value, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        placeholder="New todo..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="submit"
        className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Add
      </button>
    </form>
  );
}
