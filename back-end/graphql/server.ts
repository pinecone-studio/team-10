import { ApolloServer } from "@apollo/server";
import type { GraphQLContext } from "../lib/context.ts";
import { resolvers } from "./resolvers/index.ts";
import { typeDefs } from "./schema/index.ts";

export function createGraphQLServer() {
  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: true,
  });
}
