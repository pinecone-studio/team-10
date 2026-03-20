"use client";

import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache,
  Observable,
} from "@apollo/client/core";

function getGraphqlUrl() {
  if (typeof window !== "undefined") {
    return "/api/graphql";
  }

  const runtimePort = process.env.PORT?.trim();
  if (runtimePort) {
    return `http://localhost:${runtimePort}/api/graphql`;
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000";

  return new URL("/api/graphql", appUrl).toString();
}

let activeRequestCount = 0;

function syncBackendBusyState() {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.backendBusy =
    activeRequestCount > 0 ? "true" : "false";
}

const backendBusyLink = new ApolloLink((operation, forward) => {
  if (!forward) {
    return new Observable((observer) => {
      observer.complete();
    });
  }

  activeRequestCount += 1;
  syncBackendBusyState();

  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (value) => observer.next(value),
      error: (error) => {
        observer.error(error);
      },
      complete: () => {
        observer.complete();
      },
    });

    return () => {
      subscription.unsubscribe();
      activeRequestCount = Math.max(0, activeRequestCount - 1);
      syncBackendBusyState();
    };
  });
});

export const apolloClient = new ApolloClient({
  link: from([backendBusyLink, new HttpLink({ uri: getGraphqlUrl() })]),
  cache: new InMemoryCache(),
  ssrMode: typeof window === "undefined",
});
