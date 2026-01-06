"use client";

import { useQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { CreatePost } from "@/components/post/CreatePost";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Loading";
import { useAuthStore } from "@/stores/auth";
import { GET_TRENDING_POSTS } from "@/graphql/queries/post";
import type { PostConnection } from "@/types";

interface TrendingPostsData {
  getTrendingPosts: PostConnection;
}

export default function HomePage() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);

  const { data, loading: postsLoading, fetchMore } = useQuery<TrendingPostsData>(
    GET_TRENDING_POSTS,
    {
      variables: { first: 20 },
      notifyOnNetworkStatusChange: true,
    }
  );

  const posts = data?.getTrendingPosts?.edges || [];
  const pageInfo = data?.getTrendingPosts?.pageInfo;

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

      {/* Create Post (for authenticated users) */}
      {!isLoading && isAuthenticated && <CreatePost />}

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
            <p className="text-text-secondary">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          // Posts list
          <>
            {posts.map(({ node: post }) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Load more */}
            {pageInfo?.hasNextPage && (
              <div className="py-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={postsLoading}
                  className="text-text-secondary hover:text-text-primary transition-colors"
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
