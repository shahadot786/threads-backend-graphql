"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo-client";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import {
  LIKE_POST_MUTATION,
  UNLIKE_POST_MUTATION,
  BOOKMARK_POST_MUTATION,
  UNBOOKMARK_POST_MUTATION
} from "@/graphql/mutations/post";
import { formatCount } from "@/lib/utils";
import type { Post } from "@/types";

interface PostActionsProps {
  post: Post;
  onUpdate?: (post: Partial<Post>) => void;
}

// Icons
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill={filled ? "#ff3040" : "none"} stroke={filled ? "#ff3040" : "currentColor"} strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
  </svg>
);

const RepostIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
  </svg>
);

export function PostActions({ post, onUpdate }: PostActionsProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const openLoginModal = useUIStore(state => state.openLoginModal);

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);

  const [likePost] = useMutation(LIKE_POST_MUTATION);
  const [unlikePost] = useMutation(UNLIKE_POST_MUTATION);
  const [bookmarkPost] = useMutation(BOOKMARK_POST_MUTATION);
  const [unbookmarkPost] = useMutation(UNBOOKMARK_POST_MUTATION);

  const handleLike = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      if (isLiked) {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        await unlikePost({ variables: { postId: post.id } });
      } else {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        await likePost({ variables: { postId: post.id } });
      }
      onUpdate?.({ isLiked: !isLiked, likesCount: isLiked ? likesCount - 1 : likesCount + 1 });
    } catch {
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      if (isBookmarked) {
        setIsBookmarked(false);
        await unbookmarkPost({ variables: { postId: post.id } });
      } else {
        setIsBookmarked(true);
        await bookmarkPost({ variables: { postId: post.id } });
      }
      onUpdate?.({ isBookmarked: !isBookmarked });
    } catch {
      setIsBookmarked(!isBookmarked);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-3">
      <button
        onClick={handleLike}
        className="flex items-center gap-1.5 p-2 -ml-2 rounded-full hover:bg-hover transition-colors text-text-secondary"
      >
        <HeartIcon filled={isLiked} />
        {likesCount > 0 && (
          <span className={`text-sm ${isLiked ? 'text-[#ff3040]' : ''}`}>
            {formatCount(likesCount)}
          </span>
        )}
      </button>

      <button className="flex items-center gap-1.5 p-2 rounded-full hover:bg-hover transition-colors text-text-secondary">
        <CommentIcon />
        {post.repliesCount > 0 && (
          <span className="text-sm">{formatCount(post.repliesCount)}</span>
        )}
      </button>

      <button className="p-2 rounded-full hover:bg-hover transition-colors text-text-secondary">
        <RepostIcon />
      </button>

      <button className="p-2 rounded-full hover:bg-hover transition-colors text-text-secondary">
        <ShareIcon />
      </button>

      <div className="flex-1" />

      <button
        onClick={handleBookmark}
        className="p-2 rounded-full hover:bg-hover transition-colors text-text-secondary"
      >
        <BookmarkIcon filled={isBookmarked} />
      </button>
    </div>
  );
}
