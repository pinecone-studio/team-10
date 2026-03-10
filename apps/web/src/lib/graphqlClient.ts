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

export type DevAuthHeaders = {
  email: string;
  fullName: string;
  userId?: string;
  role?: 'EMPLOYEE' | 'INVENTORY_HEAD' | 'FINANCE' | 'IT_ADMIN' | 'HR_MANAGER' | 'SYSTEM_ADMIN';
};

export type RequestOptions = {
  token?: string | null;
  devAuth?: DevAuthHeaders;
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
        ...(options?.devAuth
          ? {
              'x-dev-user-email': options.devAuth.email,
              'x-dev-user-name': options.devAuth.fullName,
              ...(options.devAuth.userId ? { 'x-dev-user-id': options.devAuth.userId } : {}),
              ...(options.devAuth.role ? { 'x-dev-user-role': options.devAuth.role } : {}),
            }
          : {}),
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
