"use client";

import { useQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Loading";
import { useAuthStore } from "@/stores/auth";
import { GET_PUBLIC_FEED, GET_HOME_FEED } from "@/graphql/queries/post";
import type { PostConnection } from "@/types";

interface TrendingPostsData {
  getTrendingPosts: PostConnection;
}

export default function HomePage() {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const isLoading = useAuthStore((state: any) => state.isLoading);

  // Use getHomeFeed for authenticated users, getPublicFeed (chronological) for guests
  const query = isAuthenticated ? GET_HOME_FEED : GET_PUBLIC_FEED;
  const queryField = isAuthenticated ? "getHomeFeed" : "getPublicFeed";

  const {
    data,
    loading: postsLoading,
    fetchMore,
  } = useQuery<any>(query, {
    variables: { first: 20 },
    notifyOnNetworkStatusChange: true,
    // skip: isLoading, // Only query if we know the auth state
  });

  const response = data?.[queryField];
  const posts = response?.edges || [];
  const pageInfo = response?.pageInfo;

  const handleLoadMore = () => {
    if (!pageInfo?.hasNextPage || postsLoading) return;

    fetchMore({
      variables: {
        after: pageInfo.endCursor,
      },
    });
  };

  return (
    <MainLayout>
      <Header title="Home" />

      {/* Posts Feed */}
      <div className="pb-20 md:pb-4">
        {postsLoading && posts.length === 0 ? (
          // Loading skeletons
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          // Empty state
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              No posts yet. Be the first to share!
            </p>
          </div>
        ) : (
          // Posts list
          <>
            {posts.map(({ node: post }: { node: any }) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Load more */}
            {pageInfo?.hasNextPage && (
              <div className="py-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={postsLoading}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {postsLoading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
