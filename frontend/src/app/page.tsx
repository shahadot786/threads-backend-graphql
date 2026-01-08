"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { VirtualizedFeed } from "@/components/post/VirtualizedFeed";
import { PostSkeleton } from "@/components/ui/Loading";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { GET_PUBLIC_FEED, GET_HOME_FEED } from "@/graphql/queries/post";
import { useSocketEvent } from "@/hooks/useSocket";
import { updatePostInCache } from "@/lib/apollo-client";
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
    refetch,
  } = useQuery<any>(query, {
    variables: { first: 20 },
    notifyOnNetworkStatusChange: true,
    skip: isLoading, // Don't fetch until auth state is determined
  });

  const response = data?.[queryField];
  const posts = response?.edges || [];
  const pageInfo = response?.pageInfo;

  // Handle new post event - refetch to get latest posts
  const handleNewPost = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle like/unlike events - update cache optimistically
  const handleLikeUpdate = useCallback(
    (data: { postId: string; likesCount: number; userId: string }) => {
      updatePostInCache(data.postId, { likesCount: data.likesCount });
    },
    []
  );

  // Subscribe to socket events
  useSocketEvent("post:created", handleNewPost);
  useSocketEvent("post:liked", handleLikeUpdate);
  useSocketEvent("post:unliked", handleLikeUpdate);

  const handleLoadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || postsLoading) return;

    fetchMore({
      variables: {
        after: pageInfo.endCursor,
      },
    });
  }, [pageInfo, postsLoading, fetchMore]);

  // Home Refresh Trigger Logic
  const homeRefreshTrigger = useUIStore((state) => state.homeRefreshTrigger);
  const homeScrollPosition = useUIStore((state) => state.homeScrollPosition);
  const setHomeScrollPosition = useUIStore((state) => state.setHomeScrollPosition);
  const clearHomeScrollPosition = useUIStore((state) => state.clearHomeScrollPosition);
  const [isHomeRefreshing, setIsHomeRefreshing] = useState(false);
  const hasRestoredScroll = useRef(false);

  useEffect(() => {
    if (homeRefreshTrigger > 0) {
      if (window.scrollY > 0) {
        // Already scrolled down - just scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // At top - refresh the feed
        setIsHomeRefreshing(true);
        clearHomeScrollPosition();
        refetch().finally(() => {
          setTimeout(() => setIsHomeRefreshing(false), 500);
        });
      }
    }
  }, [homeRefreshTrigger, refetch, clearHomeScrollPosition]);

  // Save scroll position on unmount
  useEffect(() => {
    return () => {
      setHomeScrollPosition(window.scrollY);
    };
  }, [setHomeScrollPosition]);

  // Restore scroll position on mount when cached data is available
  useEffect(() => {
    if (!hasRestoredScroll.current && posts.length > 0 && homeScrollPosition > 0) {
      hasRestoredScroll.current = true;
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: homeScrollPosition, behavior: "instant" });
      });
    }
  }, [posts.length, homeScrollPosition]);

  // Pull to Refresh Logic
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Add resistance
      const newDistance = Math.min(diff * 0.5, MAX_PULL);
      setPullDistance(newDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);
    if (pullDistance > PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(50); // Keep it visible while refreshing
      await refetch();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
  };

  return (
    <MainLayout>
      <Header title="Home" />

      {/* Home Refresh Loader */}
      {isHomeRefreshing && (
        <div className="flex justify-center py-4">
          <div className="relative w-6 h-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-0 w-[2px] h-[6px] bg-current rounded-full origin-[center_12px]"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                  opacity: 0.2 + (i * 0.1),
                  animation: `fadeLoader 0.8s linear infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <style jsx>{`
            @keyframes fadeLoader {
              0%, 100% { opacity: 0.2; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Posts Feed */}
      <div
        className="pb-20 md:pb-4 min-h-screen relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to Refresh Spinner */}
        <div
          className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none transition-transform duration-200"
          style={{
            height: '50px',
            transform: `translateY(${pullDistance - 50}px)`,
            opacity: pullDistance > 0 ? 1 : 0
          }}
        >
          {isRefreshing ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
          ) : (
            <div className="transform transition-transform duration-200" style={{ rotate: `${pullDistance * 2}deg` }}>
              ⬇️
            </div>
          )}
        </div>

        <div
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0,0,0.2,1)'
          }}
        >
          {(isLoading || postsLoading) && posts.length === 0 ? (
            // Loading skeletons (shown while auth or posts are loading)
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : (
            <VirtualizedFeed
              posts={posts}
              pageInfo={pageInfo}
              loading={postsLoading}
              onLoadMore={handleLoadMore}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
