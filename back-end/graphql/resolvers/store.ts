export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export const todos: Todo[] = [
  { id: "1", title: "Buy groceries", completed: false },
  { id: "2", title: "Walk the dog", completed: true },
  { id: "3", title: "Read a book", completed: false },
];

let nextId = 4;

export const getNextId = () => String(nextId++);
