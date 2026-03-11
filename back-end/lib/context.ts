import { db, type DB } from "./db";

export type GraphQLContext = {
  db: DB;
};

export const createGraphQLContext = (): GraphQLContext => ({
  db,
});
