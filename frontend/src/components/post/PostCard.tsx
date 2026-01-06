"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PostActions } from "./PostActions";
import { formatRelativeTime } from "@/lib/utils";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  showThread?: boolean;
}

export function PostCard({ post, showThread = false }: PostCardProps) {
  const { author, content, createdAt, media } = post;

  return (
    <article className="relative px-4 py-4 border-b border-border hover:bg-hover/30 transition-colors">
      {/* Thread line for replies */}
      {showThread && <div className="thread-line" />}

      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/@${author.username}`} className="flex-shrink-0">
          <Avatar
            src={author.profileImageUrl}
            firstName={author.firstName}
            lastName={author.lastName}
            size="md"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-0.5">
            <Link
              href={`/@${author.username}`}
              className="font-semibold text-text-primary hover:underline truncate"
            >
              {author.username}
            </Link>
            {author.is_verified && (
              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-text-secondary text-sm">
              {formatRelativeTime(createdAt)}
            </span>

            {/* More options button */}
            <button className="ml-auto p-1 rounded-full hover:bg-hover text-text-secondary">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>

          {/* Content text */}
          {content && (
            <div className="text-text-primary whitespace-pre-wrap break-words">
              {renderContent(content)}
            </div>
          )}

          {/* Media */}
          {media && media.length > 0 && (
            <div className={`mt-3 grid gap-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {media.map((item) => (
                <div key={item.id} className="relative rounded-xl overflow-hidden">
                  {item.mediaType === 'VIDEO' ? (
                    <video
                      src={item.mediaUrl}
                      className="w-full max-h-[400px] object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt=""
                      className="w-full max-h-[400px] object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <PostActions post={post} />
        </div>
      </div>
    </article>
  );
}

// Helper to render content with hashtags and mentions
function renderContent(content: string): React.ReactNode {
  const parts = content.split(/(\s+)/);

  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part.slice(1).replace(/[^\w]/g, '');
      return (
        <Link key={index} href={`/hashtag/${tag}`} className="text-blue-500 hover:underline">
          {part}
        </Link>
      );
    }
    if (part.startsWith('@')) {
      const username = part.slice(1).replace(/[^\w]/g, '');
      return (
        <Link key={index} href={`/@${username}`} className="text-blue-500 hover:underline">
          {part}
        </Link>
      );
    }
    return part;
  });
}
