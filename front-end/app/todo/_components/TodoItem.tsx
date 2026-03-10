type Props = {
  id: string;
  title: string;
  completed: boolean;
  onDelete: (id: string) => void;
};

export function TodoItem({ id, title, completed, onDelete }: Props) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <span
        className={`flex-1 text-sm ${completed ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-100"}`}
      >
        {title}
      </span>
      <button
        onClick={() => onDelete(id)}
        className="text-xs text-red-400 hover:text-red-600"
      >
        Delete
      </button>
    </li>
  );
}
