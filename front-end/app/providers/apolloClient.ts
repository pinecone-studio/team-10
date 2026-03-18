"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";

function getGraphqlUrl() {
  if (typeof window !== "undefined") {
    return "/api/graphql";
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000";

  return new URL("/api/graphql", appUrl).toString();
}

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: getGraphqlUrl() }),
  cache: new InMemoryCache(),
  ssrMode: typeof window === "undefined",
});
