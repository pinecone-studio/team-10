import type {
  D1DatabaseLike,
  D1ExecResult,
  D1PreparedStatementLike,
  D1QueryResult,
} from "../../lib/d1.ts";

type TodoSeed = {
  id?: number;
  title: string;
  completed: boolean;
};

type StoredTodo = {
  id: number;
  title: string;
  completed: boolean;
};

type QueryMode = "rows" | "raw";

export class FakeD1Database implements D1DatabaseLike {
  private todos: StoredTodo[] = [];
  private nextTodoId = 1;

  constructor(seedTodos: TodoSeed[] = []) {
    this.seed(seedTodos);
  }

  prepare(query: string): D1PreparedStatementLike {
    return new FakeD1PreparedStatement(this, query);
  }

  async batch(statements: D1PreparedStatementLike[]) {
    return Promise.all(statements.map((statement) => statement.run()));
  }

  async execute(
    query: string,
    params: unknown[],
    mode: QueryMode,
  ): Promise<D1QueryResult | D1ExecResult | unknown[][]> {
    const normalized = query.replace(/\s+/g, " ").trim().toLowerCase();

    if (
      normalized.startsWith('select "id", "title", "completed" from "todos"')
    ) {
      const rows = normalized.includes("where")
        ? this.todos.filter((todo) => todo.id === Number(params[0]))
        : [...this.todos];

      return this.formatTodoRows(rows, mode);
    }

    if (normalized.startsWith('insert into "todos"')) {
      const todo: StoredTodo = {
        id: this.nextTodoId++,
        title: String(params[0]),
        completed: false,
      };

      this.todos.push(todo);
      return this.formatTodoRows([todo], mode);
    }

    if (normalized.startsWith('update "todos"')) {
      const todoId = Number(params[params.length - 1]);
      const todo = this.todos.find((entry) => entry.id === todoId);

      if (!todo) {
        return this.formatTodoRows([], mode);
      }

      let index = 0;

      if (normalized.includes('"title" = ?')) {
        todo.title = String(params[index++]);
      }

      if (normalized.includes('"completed" = ?')) {
        todo.completed = Boolean(params[index++]);
      }

      return this.formatTodoRows([todo], mode);
    }

    if (normalized.startsWith('delete from "todos"')) {
      const todoId = Number(params[0]);
      const index = this.todos.findIndex((todo) => todo.id === todoId);

      if (index === -1) {
        return this.formatDeletedRows([], mode);
      }

      const [deletedTodo] = this.todos.splice(index, 1);
      return this.formatDeletedRows([deletedTodo.id], mode);
    }

    throw new Error(`Unsupported fake D1 query: ${query}`);
  }

  private seed(seedTodos: TodoSeed[]) {
    for (const todo of seedTodos) {
      const id = todo.id ?? this.nextTodoId++;
      this.nextTodoId = Math.max(this.nextTodoId, id + 1);
      this.todos.push({
        id,
        title: todo.title,
        completed: todo.completed,
      });
    }
  }

  private formatTodoRows(rows: StoredTodo[], mode: QueryMode) {
    if (mode === "raw") {
      return rows.map((todo) => [todo.id, todo.title, todo.completed ? 1 : 0]);
    }

    return {
      success: true,
      meta: {},
      results: rows.map((todo) => ({
        id: todo.id,
        title: todo.title,
        completed: todo.completed ? 1 : 0,
      })),
    } satisfies D1QueryResult;
  }

  private formatDeletedRows(ids: number[], mode: QueryMode) {
    if (mode === "raw") {
      return ids.map((id) => [id]);
    }

    return {
      success: true,
      meta: {},
      results: ids.map((id) => ({ id })),
    } satisfies D1QueryResult;
  }
}

class FakeD1PreparedStatement implements D1PreparedStatementLike {
  private readonly database: FakeD1Database;
  private readonly query: string;
  private readonly params: unknown[];

  constructor(
    database: FakeD1Database,
    query: string,
    params: unknown[] = [],
  ) {
    this.database = database;
    this.query = query;
    this.params = params;
  }

  bind(...values: unknown[]) {
    return new FakeD1PreparedStatement(this.database, this.query, values);
  }

  async all<T = Record<string, unknown>>() {
    return this.database.execute(this.query, this.params, "rows") as Promise<D1QueryResult<T>>;
  }

  async raw<T = unknown[]>() {
    return this.database.execute(this.query, this.params, "raw") as Promise<T[]>;
  }

  async run() {
    return {
      success: true,
      meta: {},
    } satisfies D1ExecResult;
  }
}
