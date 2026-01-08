"use client";

import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ApolloProvider as BaseApolloProvider } from "@apollo/client/react";
import { ReactNode, useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth";
import { GET_CURRENT_USER } from "@/graphql/queries/user";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8000/graphql";

// HTTP Link
const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
});

// Auth Link - injects Supabase token
const authLink = setContext(async (_, { headers }) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Helper merge function for cursor-based pagination
function paginationMerge(existing: any, incoming: any, { args }: { args: any }) {
  if (!existing || !args?.after) return incoming;
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
}

// Apollo Client with optimized cache
export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      // Entity type policies for proper cache normalization
      Post: {
        keyFields: ["id"],
        fields: {
          // Ensure booleans have sensible defaults
          isLiked: {
            read(existing) {
              return existing ?? false;
            },
          },
          isBookmarked: {
            read(existing) {
              return existing ?? false;
            },
          },
          isReposted: {
            read(existing) {
              return existing ?? false;
            },
          },
          // Counters default to 0
          likesCount: {
            read(existing) {
              return existing ?? 0;
            },
          },
          repliesCount: {
            read(existing) {
              return existing ?? 0;
            },
          },
          repostsCount: {
            read(existing) {
              return existing ?? 0;
            },
          },
        },
      },
      User: {
        keyFields: ["id"],
        fields: {
          isFollowing: {
            read(existing) {
              return existing ?? false;
            },
          },
          stats: {
            merge(existing, incoming) {
              return { ...existing, ...incoming };
            },
          },
        },
      },
      // Query field policies for pagination
      Query: {
        fields: {
          // Single entity lookups - read from cache first
          getPostById: {
            read(_, { args, toReference }) {
              if (!args?.id) return undefined;
              return toReference({ __typename: "Post", id: args.id });
            },
          },
          getUserById: {
            read(_, { args, toReference }) {
              if (!args?.id) return undefined;
              return toReference({ __typename: "User", id: args.id });
            },
          },
          getUserByUsername: {
            keyArgs: ["username"],
          },
          // Paginated queries
          getHomeFeed: {
            keyArgs: false,
            merge: paginationMerge,
          },
          getPublicFeed: {
            keyArgs: false,
            merge: paginationMerge,
          },
          getTrendingPosts: {
            keyArgs: false,
            merge: paginationMerge,
          },
          getUserPosts: {
            keyArgs: ["userId", "filter"],
            merge: paginationMerge,
          },
          getPostReplies: {
            keyArgs: ["postId"],
            merge: paginationMerge,
          },
          getMyBookmarks: {
            keyArgs: false,
            merge: paginationMerge,
          },
          getPostsByHashtag: {
            keyArgs: ["tag"],
            merge: paginationMerge,
          },
          getFollowers: {
            keyArgs: ["userId"],
            merge: paginationMerge,
          },
          getFollowing: {
            keyArgs: ["userId"],
            merge: paginationMerge,
          },
          searchUsers: {
            keyArgs: ["query"],
            merge: paginationMerge,
          },
          searchPosts: {
            keyArgs: ["query"],
            merge: paginationMerge,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

// Helper to update post in cache (useful for mutations)
export function updatePostInCache(postId: string, updates: Record<string, any>) {
  apolloClient.cache.modify({
    id: apolloClient.cache.identify({ __typename: "Post", id: postId }),
    fields: Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [key, () => value])
    ),
  });
}

// Helper to update user in cache
export function updateUserInCache(userId: string, updates: Record<string, any>) {
  apolloClient.cache.modify({
    id: apolloClient.cache.identify({ __typename: "User", id: userId }),
    fields: Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [key, () => value])
    ),
  });
}

// Apollo Provider with auth initialization
export function ApolloProvider({ children }: { children: ReactNode }) {
  const hasInitialized = useRef(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);

  // Initialize auth on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    async function initAuth() {
      setLoading(true);
      try {
        // 1. Get Supabase Session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
          // 2. Fetch Profile from our DB
          const { data } = await apolloClient.query<{
            getCurrentLoggedInUser: User | null;
          }>({
            query: GET_CURRENT_USER,
            fetchPolicy: "network-only",
          });
          setUser(data?.getCurrentLoggedInUser || null);
        } else {
          setUser(null);
        }
      } catch (err: unknown) {
        console.error(`[AUTH] initAuth failed:`, err);
        setUser(null);
      } finally {
        setLoading(false);
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN' && session) {
          // Re-fetch profile on sign in
          const { data } = await apolloClient.query<{
            getCurrentLoggedInUser: User | null;
          }>({ query: GET_CURRENT_USER });
          setUser(data?.getCurrentLoggedInUser || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
    }

    initAuth();
  }, [setUser, setSession, setLoading]);

  return (
    <BaseApolloProvider client={apolloClient}>{children}</BaseApolloProvider>
  );
}
