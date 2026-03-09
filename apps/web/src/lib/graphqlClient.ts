type GraphQLResponse<TData> = {
  data?: TData;
  errors?: { message: string }[];
};

const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_URL?.trim() || '/graphql';

export class GraphQLError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GraphQLError';
  }
}

type RequestOptions = {
  token?: string | null;
};

export async function graphqlRequest<TData, TVariables extends object | undefined>(
  query: string,
  variables?: TVariables,
  options?: RequestOptions,
): Promise<TData> {
  let response: Response;
  try {
    response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(options?.token ? { authorization: `Bearer ${options.token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new GraphQLError(
      `Cannot connect to GraphQL API at ${GRAPHQL_ENDPOINT}. Ensure worker is running.`,
    );
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;
  if (payload.errors?.length) {
    const message = payload.errors.map((error) => error.message).join(', ');
    throw new GraphQLError(message);
  }
  if (!response.ok) {
    throw new GraphQLError(`Request failed with status ${response.status}`);
  }

  if (!payload.data) {
    throw new GraphQLError('No data returned from GraphQL API');
  }

  return payload.data;
}
