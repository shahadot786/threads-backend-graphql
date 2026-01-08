"use client";

import { useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { PostCard } from "./PostCard";
import { PostSkeleton } from "@/components/ui/Loading";
import type { PostEdge, PageInfo } from "@/types";
import { LogIn } from "lucide-react";

interface VirtualizedFeedProps {
  posts: PostEdge[];
  pageInfo: PageInfo | undefined;
  loading: boolean;
  onLoadMore: () => void;
  isAuthenticated?: boolean;
  guestPostLimit?: number;
}

const DEFAULT_GUEST_LIMIT = 40;

// Infinite Scroll Feed with IntersectionObserver
export function VirtualizedFeed({
  posts,
  pageInfo,
  loading,
  onLoadMore,
  isAuthenticated = true,
  guestPostLimit = DEFAULT_GUEST_LIMIT,
}: VirtualizedFeedProps) {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasNextPage = pageInfo?.hasNextPage ?? false;

  // For guests, limit posts and stop infinite scroll after limit
  const isGuestLimitReached = !isAuthenticated && posts.length >= guestPostLimit;
  const shouldLoadMore = hasNextPage && !isGuestLimitReached;

  // Proper IntersectionObserver with cleanup
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Don't observe if no more pages, limit reached, or currently loading
    if (!shouldLoadMore || loading || !loaderRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && shouldLoadMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observerRef.current.observe(loaderRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [shouldLoadMore, loading, onLoadMore]);

  // Empty state
  if (posts.length === 0 && !loading) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          No posts yet. Be the first to share!
        </p>
      </div>
    );
  }

  // Initial loading state
  if (posts.length === 0 && loading) {
    return (
      <>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </>
    );
  }

  // Limit displayed posts for guests
  const displayPosts = isAuthenticated ? posts : posts.slice(0, guestPostLimit);

  return (
    <>
      {displayPosts.map(({ node: post }) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Infinite Scroll Loader - only for authenticated or under limit */}
      {shouldLoadMore && (
        <div
          ref={loaderRef}
          className="py-8 flex justify-center"
        >
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground opacity-50" />
        </div>
      )}

      {/* Guest Login Prompt - shown when limit is reached */}
      {isGuestLimitReached && (
        <div className="mx-4 my-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-border/50 backdrop-blur-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Want to see more?
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Log in to unlock unlimited posts, follow your favorite creators, and join the conversation.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-full bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 rounded-full border border-border text-foreground font-medium text-sm hover:bg-secondary/50 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
