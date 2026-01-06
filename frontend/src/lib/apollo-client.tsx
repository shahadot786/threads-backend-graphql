"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  Observable,
  FetchResult
} from "@apollo/client/core";
import { onError } from "@apollo/client/link/error";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { ReactNode, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth";
import { REFRESH_TOKEN_MUTATION } from "@/graphql/mutations/auth";
import { GET_CURRENT_USER } from "@/graphql/queries/user";
import type { User } from "@/types";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql";

// Track if we're currently refreshing
let isRefreshing = false;
let refreshSubscribers: ((retry: boolean) => void)[] = [];

function subscribeTokenRefresh(cb: (retry: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshComplete(success: boolean) {
  refreshSubscribers.forEach(cb => cb(success));
  refreshSubscribers = [];
}

// HTTP Link
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: "include",
});

// Type for error handler params (Apollo v4 compatible)
interface ErrorHandlerParams {
  graphQLErrors?: ReadonlyArray<{
    message: string;
    extensions?: Record<string, unknown>
  }>;
  operation: {
    operationName: string;
    [key: string]: unknown;
  };
  forward: (op: unknown) => Observable<FetchResult>;
}

// Error Link with token refresh
const errorLink = onError((params: unknown) => {
  const { graphQLErrors, operation, forward } = params as ErrorHandlerParams;

  if (!graphQLErrors) return;

  for (const err of graphQLErrors) {
    // Check if it's an auth error
    const isAuthError =
      err.extensions?.code === "UNAUTHENTICATED" ||
      err.message.includes("Not authenticated") ||
      err.message.includes("Token expired");

    if (!isAuthError) continue;

    // Don't retry refresh token or logout mutations
    const operationName = operation.operationName;
    if (operationName === "RefreshToken" || operationName === "Logout") {
      return;
    }

    return new Observable<FetchResult>(observer => {
      // If already refreshing, wait for it
      if (isRefreshing) {
        subscribeTokenRefresh((success) => {
          if (success) {
            forward(operation).subscribe(observer);
          } else {
            observer.error(err);
          }
        });
        return;
      }

      isRefreshing = true;
      useAuthStore.getState().setRefreshing(true);

      // Try to refresh
      apolloClient
        .mutate<{ refreshToken: { accessToken: string; user: User } }>({
          mutation: REFRESH_TOKEN_MUTATION,
        })
        .then(({ data }) => {
          if (data?.refreshToken?.user) {
            useAuthStore.getState().login(data.refreshToken.user);
            isRefreshing = false;
            useAuthStore.getState().setRefreshing(false);
            onRefreshComplete(true);
            // Retry the original request
            forward(operation).subscribe(observer);
          } else {
            throw new Error("Refresh failed");
          }
        })
        .catch(() => {
          isRefreshing = false;
          useAuthStore.getState().setRefreshing(false);
          useAuthStore.getState().logout();
          onRefreshComplete(false);
          observer.error(err);
        });
    });
  }
});

// Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getHomeFeed: {
            keyArgs: false,
            merge(existing, incoming) {
              if (!existing) return incoming;
              // Deduplicate by cursor
              const existingCursors = new Set(existing.edges.map((e: { cursor: string }) => e.cursor));
              const newEdges = incoming.edges.filter((e: { cursor: string }) => !existingCursors.has(e.cursor));
              return {
                ...incoming,
                edges: [...existing.edges, ...newEdges],
              };
            },
          },
          getTrendingPosts: {
            keyArgs: false,
            merge(existing, incoming) {
              if (!existing) return incoming;
              // Deduplicate by cursor
              const existingCursors = new Set(existing.edges.map((e: { cursor: string }) => e.cursor));
              const newEdges = incoming.edges.filter((e: { cursor: string }) => !existingCursors.has(e.cursor));
              return {
                ...incoming,
                edges: [...existing.edges, ...newEdges],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
  },
});

// Apollo Provider with auth initialization
export function ApolloProvider({ children }: { children: ReactNode }) {
  const hasInitialized = useRef(false);
  const setUser = useAuthStore(state => state.setUser);
  const setLoading = useAuthStore(state => state.setLoading);

  // Initialize auth on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function initAuth() {
      try {
        const { data } = await apolloClient.query<{ getCurrentLoggedInUser: User | null }>({
          query: GET_CURRENT_USER,
          fetchPolicy: "network-only",
        });
        setUser(data?.getCurrentLoggedInUser || null);
      } catch {
        // Not authenticated, that's fine
        setUser(null);
      }
    }

    initAuth();
  }, [setUser, setLoading]);

  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}
