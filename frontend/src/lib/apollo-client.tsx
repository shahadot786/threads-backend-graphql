"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
  FetchResult,
} from "@apollo/client/core";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { ReactNode, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth";
import { REFRESH_TOKEN_MUTATION } from "@/graphql/mutations/auth";
import { GET_CURRENT_USER } from "@/graphql/queries/user";
import type { User } from "@/types";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql";

// Track if we're currently refreshing
let isRefreshing = false;
let refreshSubscribers: ((retry: boolean) => void)[] = [];

function subscribeTokenRefresh(cb: (retry: boolean) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshComplete(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

// HTTP Link
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: "include",
});



// Error Link with token refresh
const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      console.log(`[AUTH] GraphQL Error: ${err.message}`, {
        code: err.extensions?.code,
      });

      // Check if it's an auth error
      const isAuthError =
        err.extensions?.code === "UNAUTHENTICATED" ||
        err.message.includes("Not authenticated") ||
        err.message.includes("Token expired");

      if (!isAuthError) continue;

      console.log(
        `[AUTH] Auth error detected in operation: ${operation.operationName}. Triggering refresh flow...`
      );

      // Don't retry refresh token or logout mutations
      const operationName = operation.operationName;
      if (operationName === "RefreshToken" || operationName === "Logout") {
        console.log(
          `[AUTH] Error occurred during RefreshToken or Logout. Not retrying.`
        );
        return;
      }

      return new Observable<FetchResult>((observer) => {
        // If already refreshing, wait for it
        if (isRefreshing) {
          console.log(
            `[AUTH] Already refreshing, subscribing operation: ${operation.operationName}`
          );
          subscribeTokenRefresh((success) => {
            if (success) {
              console.log(
                `[AUTH] Refresh success, retrying operation: ${operation.operationName}`
              );
              forward(operation).subscribe(observer);
            } else {
              console.log(
                `[AUTH] Refresh failed, erroring operation: ${operation.operationName}`
              );
              observer.error(err);
            }
          });
          return;
        }

        console.log(`[AUTH] Starting token refresh mutation...`);
        isRefreshing = true;
        useAuthStore.getState().setRefreshing(true);

        // Try to refresh
        apolloClient
          .mutate<{ refreshToken: { accessToken: string; user: User } }>({
            mutation: REFRESH_TOKEN_MUTATION,
            context: {
              headers: {
                "x-apollo-operation-name": "RefreshToken",
              },
            },
          })
          .then(({ data }) => {
            console.log(
              `[AUTH] Token refresh mutation successful. User: ${data?.refreshToken?.user?.username}`
            );
            if (data?.refreshToken?.user) {
              useAuthStore.getState().login(data.refreshToken.user);
              isRefreshing = false;
              useAuthStore.getState().setRefreshing(false);
              onRefreshComplete(true);

              console.log(
                `[AUTH] Retrying original operation: ${operation.operationName}`
              );
              // Retry the original request
              forward(operation).subscribe(observer);
            } else {
              console.log(`[AUTH] Token refresh mutation returned NO user data.`);
              throw new Error("Refresh failed");
            }
          })
          .catch((refreshError) => {
            console.error(`[AUTH] Token refresh mutation FAILED:`, refreshError);
            isRefreshing = false;
            useAuthStore.getState().setRefreshing(false);
            useAuthStore.getState().logout();
            onRefreshComplete(false);
            observer.error(err);
          });
      });
    }
  }

  if (error && !CombinedGraphQLErrors.is(error)) {
    console.error(`[AUTH] Network error:`, error);
  }
});

// Apollo Client
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getHomeFeed: {
            keyArgs: false,
            merge(existing, incoming) {
              if (!existing) return incoming;
              // Deduplicate by cursor
              const existingCursors = new Set(
                existing.edges.map((e: { cursor: string }) => e.cursor)
              );
              const newEdges = incoming.edges.filter(
                (e: { cursor: string }) => !existingCursors.has(e.cursor)
              );
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
              const existingCursors = new Set(
                existing.edges.map((e: { cursor: string }) => e.cursor)
              );
              const newEdges = incoming.edges.filter(
                (e: { cursor: string }) => !existingCursors.has(e.cursor)
              );
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
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  // Initialize auth on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function initAuth() {
      console.log(`[AUTH] initAuth starting...`);
      try {
        const { data } = await apolloClient.query<{
          getCurrentLoggedInUser: User | null;
        }>({
          query: GET_CURRENT_USER,
          fetchPolicy: "network-only",
        });
        console.log(`[AUTH] initAuth success. User: ${data?.getCurrentLoggedInUser?.username || 'null'}`);
        setUser(data?.getCurrentLoggedInUser || null);
      } catch (err: unknown) {
        console.error(`[AUTH] initAuth failed:`, err instanceof Error ? err.message : String(err));
        // Not authenticated, that's fine
        setUser(null);
      }
    }

    initAuth();
  }, [setUser, setLoading]);

  return (
    <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>
  );
}
