type TodoApiItem = {
  id: string;
  title: string;
  is_completed: number;
};

type TodoApiListResponse = {
  items: TodoApiItem[];
};

type TodoApiItemResponse = {
  item: TodoApiItem;
};

type TodoApiDeleteResponse = {
  deleted: boolean;
  id: string;
};

export type GraphqlTodo = {
  id: string;
  title: string;
  completed: boolean;
};

export function getTodoApiBaseUrl(): string {
  return (
    process.env.TODO_API_BASE_URL ??
    process.env.NEXT_PUBLIC_TODO_API_BASE_URL ??
    "http://127.0.0.1:8787"
  );
}

export async function fetchTodos(): Promise<GraphqlTodo[]> {
  const response = await fetch(`${getTodoApiBaseUrl()}/api/todos`, {
    cache: "no-store",
  });

  const payload = (await response.json()) as TodoApiListResponse;
  ensureOk(response, "Failed to fetch todos");
  return payload.items.map(mapTodo);
}

export async function fetchTodoById(id: string): Promise<GraphqlTodo | null> {
  const response = await fetch(`${getTodoApiBaseUrl()}/api/todos/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  const payload = (await response.json()) as TodoApiItemResponse;
  ensureOk(response, `Failed to fetch todo ${id}`);
  return mapTodo(payload.item);
}

export async function createTodo(title: string): Promise<GraphqlTodo> {
  const response = await fetch(`${getTodoApiBaseUrl()}/api/todos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      isCompleted: false,
    }),
  });

  const payload = (await response.json()) as TodoApiItemResponse;
  ensureOk(response, "Failed to create todo");
  return mapTodo(payload.item);
}

export async function updateTodo(
  id: string,
  title: string | null | undefined,
  completed: boolean | null | undefined
): Promise<GraphqlTodo | null> {
  const body: Record<string, string | boolean> = {};

  if (title !== undefined && title !== null) {
    body.title = title;
  }

  if (completed !== undefined && completed !== null) {
    body.isCompleted = completed;
  }

  const response = await fetch(`${getTodoApiBaseUrl()}/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.status === 404) {
    return null;
  }

  const payload = (await response.json()) as TodoApiItemResponse;
  ensureOk(response, `Failed to update todo ${id}`);
  return mapTodo(payload.item);
}

export async function deleteTodo(id: string): Promise<boolean> {
  const response = await fetch(`${getTodoApiBaseUrl()}/api/todos/${id}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    return false;
  }

  const payload = (await response.json()) as TodoApiDeleteResponse;
  ensureOk(response, `Failed to delete todo ${id}`);
  return payload.deleted;
}

function ensureOk(response: Response, message: string): void {
  if (!response.ok) {
    throw new Error(`${message}: ${response.status} ${response.statusText}`);
  }
}

function mapTodo(item: TodoApiItem): GraphqlTodo {
  return {
    id: item.id,
    title: item.title,
    completed: item.is_completed === 1,
  };
}
