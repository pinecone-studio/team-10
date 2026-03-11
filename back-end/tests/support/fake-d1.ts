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

type OrderSeed = {
  id?: number;
  userId: number;
  officeId: number;
  orderProcessId: number;
  whyOrdered: string;
  status: string;
  expectedArrivalAt?: string | null;
  totalCost?: number | null;
};

type UserSeed = {
  id?: number;
  role?: string;
  isActive?: boolean;
};

type OfficeSeed = {
  id?: number;
};

type OrderProcessSeed = {
  id?: number;
};

type StoredTodo = {
  id: number;
  title: string;
  completed: boolean;
};

type StoredOrder = {
  id: number;
  userId: number;
  officeId: number;
  orderProcessId: number;
  whyOrdered: string;
  status: string;
  expectedArrivalAt: string | null;
  totalCost: number | null;
};

type StoredUser = {
  id: number;
  role: string;
  isActive: boolean;
};

type StoredOffice = {
  id: number;
};

type StoredOrderProcess = {
  id: number;
};

type SeedConfig = {
  todos?: TodoSeed[];
  orders?: OrderSeed[];
  users?: UserSeed[];
  offices?: OfficeSeed[];
  orderProcesses?: OrderProcessSeed[];
};

type QueryMode = "rows" | "raw";

export class FakeD1Database implements D1DatabaseLike {
  private todos: StoredTodo[] = [];
  private orders: StoredOrder[] = [];
  private users: StoredUser[] = [];
  private offices: StoredOffice[] = [];
  private orderProcesses: StoredOrderProcess[] = [];
  private nextTodoId = 1;
  private nextOrderId = 1;
  private nextUserId = 1;
  private nextOfficeId = 1;
  private nextOrderProcessId = 1;

  constructor(seed: TodoSeed[] | SeedConfig = []) {
    if (Array.isArray(seed)) {
      this.seedTodos(seed);
      return;
    }

    this.seedTodos(seed.todos ?? []);
    this.seedOrders(seed.orders ?? []);
    this.seedUsers(seed.users ?? []);
    this.seedOffices(seed.offices ?? []);
    this.seedOrderProcesses(seed.orderProcesses ?? []);
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

    if (
      normalized.startsWith(
        'select "id", "user", "office_id", "order_process_id", "why_ordered", "status", "expected_arrival_at", "total_cost" from "orders"',
      )
    ) {
      const rows = normalized.includes("where")
        ? this.orders.filter((order) => order.id === Number(params[0]))
        : [...this.orders];

      return this.formatOrderRows(rows, mode);
    }

    if (normalized.startsWith('insert into "orders"')) {
      const order: StoredOrder = {
        id: this.nextOrderId++,
        userId: Number(params[0]),
        officeId: Number(params[1]),
        orderProcessId: Number(params[2]),
        whyOrdered: String(params[3]),
        status: String(params[4]),
        expectedArrivalAt:
          params[5] == null ? null : String(params[5]),
        totalCost: params[6] == null ? null : Number(params[6]),
      };

      this.orders.push(order);
      return this.formatOrderRows([order], mode);
    }

    if (normalized.startsWith('update "orders"')) {
      const orderId = Number(params[params.length - 1]);
      const order = this.orders.find((entry) => entry.id === orderId);

      if (!order) {
        return this.formatOrderRows([], mode);
      }

      let index = 0;

      if (normalized.includes('"status" = ?')) {
        order.status = String(params[index++]);
      }

      if (normalized.includes('"expected_arrival_at" = ?')) {
        order.expectedArrivalAt = params[index] == null ? null : String(params[index]);
        index += 1;
      }

      if (normalized.includes('"total_cost" = ?')) {
        order.totalCost = params[index] == null ? null : Number(params[index]);
      }

      return this.formatOrderRows([order], mode);
    }

    if (
      normalized.startsWith(
        'select "id" from "users" where ("users"."is_active" = ? and "users"."role" = ?) order by "users"."id" asc limit ?',
      )
    ) {
      const rows = this.users
        .filter((user) => user.isActive === Boolean(params[0]) && user.role === String(params[1]))
        .slice(0, Number(params[2]));

      return this.formatIdRows(rows.map((user) => user.id), mode);
    }

    if (
      normalized.startsWith(
        'select "id" from "users" where "users"."is_active" = ? order by "users"."id" asc limit ?',
      )
    ) {
      const rows = this.users
        .filter((user) => user.isActive === Boolean(params[0]))
        .slice(0, Number(params[1]));

      return this.formatIdRows(rows.map((user) => user.id), mode);
    }

    if (
      normalized.startsWith(
        'select "id" from "offices" order by "offices"."id" asc limit ?',
      )
    ) {
      return this.formatIdRows(
        this.offices.slice(0, Number(params[0])).map((office) => office.id),
        mode,
      );
    }

    if (
      normalized.startsWith(
        'select "id" from "order_processes" order by "order_processes"."id" asc limit ?',
      )
    ) {
      return this.formatIdRows(
        this.orderProcesses
          .slice(0, Number(params[0]))
          .map((orderProcess) => orderProcess.id),
        mode,
      );
    }

    throw new Error(`Unsupported fake D1 query: ${query}`);
  }

  private seedTodos(seedTodos: TodoSeed[]) {
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

  private seedOrders(seedOrders: OrderSeed[]) {
    for (const order of seedOrders) {
      const id = order.id ?? this.nextOrderId++;
      this.nextOrderId = Math.max(this.nextOrderId, id + 1);
      this.orders.push({
        id,
        userId: order.userId,
        officeId: order.officeId,
        orderProcessId: order.orderProcessId,
        whyOrdered: order.whyOrdered,
        status: order.status,
        expectedArrivalAt: order.expectedArrivalAt ?? null,
        totalCost: order.totalCost ?? null,
      });
    }
  }

  private seedUsers(seedUsers: UserSeed[]) {
    for (const user of seedUsers) {
      const id = user.id ?? this.nextUserId++;
      this.nextUserId = Math.max(this.nextUserId, id + 1);
      this.users.push({
        id,
        role: user.role ?? "employee",
        isActive: user.isActive ?? true,
      });
    }
  }

  private seedOffices(seedOffices: OfficeSeed[]) {
    for (const office of seedOffices) {
      const id = office.id ?? this.nextOfficeId++;
      this.nextOfficeId = Math.max(this.nextOfficeId, id + 1);
      this.offices.push({ id });
    }
  }

  private seedOrderProcesses(seedOrderProcesses: OrderProcessSeed[]) {
    for (const orderProcess of seedOrderProcesses) {
      const id = orderProcess.id ?? this.nextOrderProcessId++;
      this.nextOrderProcessId = Math.max(this.nextOrderProcessId, id + 1);
      this.orderProcesses.push({ id });
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

  private formatOrderRows(rows: StoredOrder[], mode: QueryMode) {
    if (mode === "raw") {
      return rows.map((order) => [
        order.id,
        order.userId,
        order.officeId,
        order.orderProcessId,
        order.whyOrdered,
        order.status,
        order.expectedArrivalAt,
        order.totalCost,
      ]);
    }

    return {
      success: true,
      meta: {},
      results: rows.map((order) => ({
        id: order.id,
        user: order.userId,
        office_id: order.officeId,
        order_process_id: order.orderProcessId,
        why_ordered: order.whyOrdered,
        status: order.status,
        expected_arrival_at: order.expectedArrivalAt,
        total_cost: order.totalCost,
      })),
    } satisfies D1QueryResult;
  }

  private formatIdRows(ids: number[], mode: QueryMode) {
    if (mode === "raw") {
      return ids.map((id) => [id]);
    }

    return {
      success: true,
      meta: {},
      results: ids.map((id) => ({ id })),
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
