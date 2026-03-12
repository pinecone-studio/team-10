import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import type { GraphQLContext } from "../lib/context.ts";
import { resolvers } from "./resolvers/index.ts";
import { typeDefs } from "./schema/index.ts";

export function createGraphQLServer() {
  return new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        embed: true,
        footer: false,
      }),
    ],
  });
}
