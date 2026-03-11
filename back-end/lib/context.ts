import { getDatabase, type AppDb } from "./db.ts";

export type GraphQLContext = {
  db: AppDb;
};

type GraphQLContextOptions = {
  db?: AppDb;
};

export function createGraphQLContextValue(
  options: GraphQLContextOptions = {},
): GraphQLContext {
  return {
    db: options.db ?? getDatabase(),
  };
}

export async function createGraphQLContext(
  _request: Request,
  options: GraphQLContextOptions = {},
): Promise<GraphQLContext> {
  return createGraphQLContextValue(options);
}
