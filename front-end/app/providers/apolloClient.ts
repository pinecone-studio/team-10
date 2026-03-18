"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  "https://team10-backend.team10-backend-2026-tsatska.workers.dev/api/graphql";

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache(),
});
