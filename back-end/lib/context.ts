import { getDatabase, type AppDb } from "./db.ts";

export type GraphQLContext = {
  db: AppDb;
  currentUserId: string | null;
};

type GraphQLContextOptions = {
  db?: AppDb;
  currentUserId?: string | null;
};

export function createGraphQLContextValue(
  options: GraphQLContextOptions = {},
): GraphQLContext {
  return {
    db: options.db ?? getDatabase(),
    currentUserId: options.currentUserId ?? null,
  };
}

export async function createGraphQLContext(
  request: Request,
  options: GraphQLContextOptions = {},
): Promise<GraphQLContext> {
  return createGraphQLContextValue({
    ...options,
    currentUserId:
      options.currentUserId ?? request.headers.get("x-user-id"),
  });
}
