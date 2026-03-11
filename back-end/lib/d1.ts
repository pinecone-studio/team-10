type D1Meta = Record<string, unknown>;

export type D1QueryResult<T = Record<string, unknown>> = {
  success: boolean;
  results: T[];
  meta: D1Meta;
};

export type D1ExecResult = {
  success: boolean;
  meta: D1Meta;
};

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  all<T = Record<string, unknown>>(): Promise<D1QueryResult<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
  run(): Promise<D1ExecResult>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
  batch(
    statements: D1PreparedStatementLike[],
  ): Promise<Array<D1QueryResult | D1ExecResult>>;
}

type D1HttpEnvelope<T> = {
  success: boolean;
  result: T[];
  errors?: Array<{ message?: string }>;
  messages?: Array<{ message?: string }>;
};

type D1HttpClientConfig = {
  accountId: string;
  databaseId: string;
  apiToken: string;
  baseUrl?: string;
};

const DEFAULT_BASE_URL = "https://api.cloudflare.com/client/v4";

class HttpD1PreparedStatement implements D1PreparedStatementLike {
  private readonly client: HttpD1Database;
  private readonly query: string;
  private readonly params: unknown[];

  constructor(
    client: HttpD1Database,
    query: string,
    params: unknown[] = [],
  ) {
    this.client = client;
    this.query = query;
    this.params = params;
  }

  bind(...values: unknown[]) {
    return new HttpD1PreparedStatement(this.client, this.query, values);
  }

  all<T = Record<string, unknown>>() {
    return this.client.executeQuery<T>(this.query, this.params);
  }

  raw<T = unknown[]>() {
    return this.client.executeRaw<T>(this.query, this.params);
  }

  run() {
    return this.client.executeExec(this.query, this.params);
  }
}

export class HttpD1Database implements D1DatabaseLike {
  private readonly queryUrl: string;
  private readonly rawUrl: string;
  private readonly headers: HeadersInit;

  constructor(config: D1HttpClientConfig) {
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    const databasePath = `${baseUrl}/accounts/${config.accountId}/d1/database/${config.databaseId}`;

    this.queryUrl = `${databasePath}/query`;
    this.rawUrl = `${databasePath}/raw`;
    this.headers = {
      Authorization: `Bearer ${config.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  prepare(query: string) {
    return new HttpD1PreparedStatement(this, query);
  }

  async batch(statements: D1PreparedStatementLike[]) {
    return Promise.all(statements.map((statement) => statement.run()));
  }

  async executeQuery<T>(
    query: string,
    params: unknown[],
  ): Promise<D1QueryResult<T>> {
    return this.request<D1QueryResult<T>>(this.queryUrl, query, params);
  }

  async executeRaw<T>(query: string, params: unknown[]): Promise<T[]> {
    const result = await this.request<D1QueryResult<T>>(this.rawUrl, query, params);
    return result.results;
  }

  async executeExec(query: string, params: unknown[]): Promise<D1ExecResult> {
    const result = await this.request<D1QueryResult>(this.queryUrl, query, params);
    return {
      success: result.success,
      meta: result.meta,
    };
  }

  private async request<T>(
    url: string,
    query: string,
    params: unknown[],
  ): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        sql: query,
        params,
      }),
      cache: "no-store",
    });

    const payload = (await response.json()) as D1HttpEnvelope<T>;

    if (!response.ok || !payload.success || !payload.result[0]) {
      const details = [...(payload.errors ?? []), ...(payload.messages ?? [])]
        .map((item) => item.message)
        .filter(Boolean)
        .join("; ");

      throw new Error(
        details || `Cloudflare D1 request failed with status ${response.status}`,
      );
    }

    return payload.result[0];
  }
}

export function createHttpD1Database(config: D1HttpClientConfig) {
  return new HttpD1Database(config);
}
