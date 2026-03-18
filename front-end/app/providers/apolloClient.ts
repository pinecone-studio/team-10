"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";

const GRAPHQL_URL = "/api/graphql";

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: GRAPHQL_URL }),
  cache: new InMemoryCache(),
});
