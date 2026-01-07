"use client";

import { use } from "react";
import { useQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Loading";
import { GET_POSTS_BY_HASHTAG } from "@/graphql/queries/post";
import type { PostConnection } from "@/types";

interface HashtagPageProps {
  params: Promise<{ tag: string }>;
}

interface PostsData {
  getPostsByHashtag: PostConnection;
}

export default function HashtagPage({ params }: HashtagPageProps) {
  const resolvedParams = use(params);
  const tag = decodeURIComponent(resolvedParams.tag);

  const { data, loading, error } = useQuery<PostsData>(GET_POSTS_BY_HASHTAG, {
    variables: { tag, first: 20 },
  });

  const posts = data?.getPostsByHashtag.edges || [];

  if (error) {
    return (
      <MainLayout showAuthCard={false}>
        <div className="p-4 text-center text-red-500">
          Error fetching posts: {error.message}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showAuthCard={false}>
      {/* Header */}
      <div className="px-4 py-8 border-b border-border/50">
        <h1 className="text-3xl font-bold text-foreground mb-1">#{tag}</h1>
        <p className="text-muted-foreground">{loading ? "..." : `${posts.length}+ threads`}</p>
      </div>

      {/* Posts */}
      <div className="pb-20 md:pb-4">
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center animate-fade-in">
            <p className="text-muted-foreground text-[15px]">No threads found with this hashtag.</p>
          </div>
        ) : (
          posts.map(({ node: post }) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </MainLayout>
  );
}
