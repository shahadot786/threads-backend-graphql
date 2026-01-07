"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
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

// Icons - Pixel Perfect Threads Style
const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" className={filled ? "text-[rgb(255,48,64)]" : "text-currentColor"} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2} aria-label="Like">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} aria-label="Reply">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" transform="scale(0.9) translate(1,1)" />
  </svg>
);

const RepostIcon = () => (
  <svg aria-label="Repost" color="currentColor" fill="currentColor" height="20" role="img" viewBox="0 0 24 24" width="20">
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 8.999v4.229a1 1 0 0 0 2 0V9.002a3.276 3.276 0 0 1 3.27-3.27h5.319Z"></path>
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} aria-label="Share">
    <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round"></polygon>
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg aria-label="Save" color="currentColor" fill={filled ? "currentColor" : "none"} height="20" role="img" viewBox="0 0 24 24" width="20" stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path d="M19.998 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function PostActions({ post, onUpdate }: PostActionsProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { openLoginModal, openReplyModal, showToast } = useUIStore();

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);

  const [likePost] = useMutation(LIKE_POST_MUTATION);
  const [unlikePost] = useMutation(UNLIKE_POST_MUTATION);
  const [bookmarkPost] = useMutation(BOOKMARK_POST_MUTATION);
  const [unbookmarkPost] = useMutation(UNBOOKMARK_POST_MUTATION);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    openReplyModal(post);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    // Repost functionality coming soon
    showToast("Repost coming soon!");
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const postUrl = `${window.location.origin}/post/${post.id}`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.author.username}`,
          text: post.content || "",
          url: postUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall back to clipboard
      }
    }

    // Fall back to clipboard copy
    try {
      await navigator.clipboard.writeText(postUrl);
      showToast("Link copied to clipboard!");
    } catch {
      showToast("Failed to copy link");
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      if (isBookmarked) {
        setIsBookmarked(false);
        await unbookmarkPost({ variables: { postId: post.id } });
        showToast("Removed from bookmarks");
      } else {
        setIsBookmarked(true);
        await bookmarkPost({ variables: { postId: post.id } });
        showToast("Added to bookmarks");
      }
    } catch {
      setIsBookmarked(!isBookmarked);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-3 -ml-2">
      <button
        onClick={handleLike}
        className="group flex items-center gap-1.5 p-2 rounded-full hover:bg-hover transition-colors"
      >
        <div className={`transition-transform duration-200 group-active:scale-90 ${isLiked ? 'text-[rgb(255,48,64)]' : 'text-icon hover:text-icon-active'}`}>
          <HeartIcon filled={isLiked} />
        </div>
        {likesCount > 0 && (
          <span className={`text-sm ${isLiked ? 'text-[rgb(255,48,64)]' : 'text-text-secondary'}`}>
            {formatCount(likesCount)}
          </span>
        )}
      </button>

      <button
        onClick={handleComment}
        className="group flex items-center gap-1.5 p-2 rounded-full hover:bg-hover transition-colors text-icon hover:text-icon-active"
      >
        <div className="transition-transform duration-200 group-active:scale-90">
          <CommentIcon />
        </div>
        {post.repliesCount > 0 && (
          <span className="text-sm text-text-secondary">{formatCount(post.repliesCount)}</span>
        )}
      </button>

      <button
        onClick={handleRepost}
        className="group p-2 rounded-full hover:bg-hover transition-colors text-icon hover:text-icon-active"
      >
        <div className="transition-transform duration-200 group-active:scale-90">
          <RepostIcon />
        </div>
      </button>

      <button
        onClick={handleShare}
        className="group p-2 rounded-full hover:bg-hover transition-colors text-icon hover:text-icon-active"
      >
        <div className="transition-transform duration-200 group-active:scale-90">
          <ShareIcon />
        </div>
      </button>
    </div>
  );
}
