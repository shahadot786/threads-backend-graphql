"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Loading";
import { GET_POST_BY_ID, GET_POST_REPLIES } from "@/graphql/queries/post";
import type { Post, PostConnection } from "@/types";
import { ArrowLeft } from "lucide-react";

interface PostData {
  getPostById: Post;
}

interface RepliesData {
  getPostReplies: PostConnection;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params?.id as string;

  const {
    data: postData,
    loading: postLoading,
    error: postError,
  } = useQuery<PostData>(GET_POST_BY_ID, {
    variables: { id: postId },
    skip: !postId,
  });

  const {
    data: repliesData,
    loading: repliesLoading,
    fetchMore,
  } = useQuery<RepliesData>(GET_POST_REPLIES, {
    variables: { postId, first: 20 },
    skip: !postId,
  });

  const post = postData?.getPostById;
  const replies = repliesData?.getPostReplies?.edges || [];
  const pageInfo = repliesData?.getPostReplies?.pageInfo;

  const handleLoadMore = () => {
    if (!pageInfo?.hasNextPage || repliesLoading) return;
    fetchMore({
      variables: { after: pageInfo.endCursor },
    });
  };

  if (postLoading) {
    return (
      <MainLayout>
        <Header title="Thread" showBackButton />
        <PostSkeleton />
        <PostSkeleton />
      </MainLayout>
    );
  }

  if (postError || !post) {
    return (
      <MainLayout>
        <Header title="Thread" showBackButton />
        <div className="py-16 text-center">
          <p className="text-muted-foreground">Post not found</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header title="Thread" showBackButton />

      {/* Main Post */}
      <PostCard post={post} />

      {/* Replies Section */}
      <div className="border-t border-border">
        {/* Replies Header */}
        {replies.length > 0 && (
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <span className="text-sm font-medium text-muted-foreground">
              {post.repliesCount} {post.repliesCount === 1 ? "Reply" : "Replies"}
            </span>
          </div>
        )}

        {/* Replies List */}
        {repliesLoading && replies.length === 0 ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : replies.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No replies yet. Be the first to reply!
            </p>
          </div>
        ) : (
          <>
            {replies.map(({ node: reply }) => (
              <PostCard key={reply.id} post={reply} />
            ))}

            {/* Load More */}
            {pageInfo?.hasNextPage && (
              <div className="py-4 text-center border-t border-border">
                <button
                  onClick={handleLoadMore}
                  disabled={repliesLoading}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  {repliesLoading ? "Loading..." : "Load more replies"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
