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

const MoreIcon = () => (
  <svg aria-label="More" color="currentColor" fill="currentColor" height="20" role="img" viewBox="0 0 24 24" width="20">
    <circle cx="12" cy="12" r="1.5"></circle>
    <circle cx="6" cy="12" r="1.5"></circle>
    <circle cx="18" cy="12" r="1.5"></circle>
  </svg>
);

export function PostCard({ post, showThread = false }: PostCardProps) {
  const { author, content, createdAt, media } = post;

  return (
    <article className="relative px-4 py-4 border-b border-border/10 hover:bg-hover/30 transition-all duration-200 cursor-pointer group/post">
      <div className="flex gap-4">
        {/* Left Column: Avatar & Thread Line */}
        <div className="flex flex-col items-center flex-shrink-0 relative">
          <Link href={`/@${author.username}`} className="z-10 bg-bg-primary rounded-full relative">
            <Avatar
              src={author.profileImageUrl}
              firstName={author.firstName}
              lastName={author.lastName}
              size="md"
              className="w-[44px] h-[44px] border border-border/10"
            />
          </Link>
          {/* Thread line */}
          {showThread && (
            <div className="thread-line" />
          )}
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0 pb-1">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Link
                href={`/@${author.username}`}
                className="font-bold text-text-primary hover:underline text-[15px] leading-tight truncate"
              >
                {author.username}
              </Link>
              {author.is_verified && (
                <svg aria-label="Verified" fill="rgb(0, 149, 246)" height="12" role="img" viewBox="0 0 40 40" width="12" className="flex-shrink-0">
                  <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6 6.162-3.38v-6.354L40 19.964l-5.248-6.29 2.858-5.788-6.163-3.137L25.359 0l-5.36 3.094Zm7.415 12.332-9.6 13.711-6.6-6.6 2.87-2.87 3.73 3.73 6.73-9.6 2.871 2.63Z" fillRule="nonzero"></path>
                </svg>
              )}

              <span className="text-text-tertiary text-[14px] flex-shrink-0">
                {formatRelativeTime(createdAt)}
              </span>
            </div>

            {/* More options button */}
            <button className="p-2 -mr-2 -mt-1 rounded-full hover:bg-hover text-text-secondary transition-all active:scale-90 group">
              <MoreIcon />
            </button>
          </div>

          {/* Content text */}
          {content && (
            <div className="text-text-primary text-[15px] leading-[1.4] whitespace-pre-wrap break-words mt-1">
              {renderContent(content)}
            </div>
          )}

          {/* Media */}
          {media && media.length > 0 && (
            <div className={`mt-3 overflow-hidden rounded-[14px] border border-border/20 max-w-full ${media.length > 1 ? 'grid gap-1 grid-cols-2' : ''}`}>
              {media.map((item) => (
                <div key={item.id} className="relative bg-[#1e1e1e] w-full aspect-auto min-h-[100px]">
                  {item.mediaType === 'VIDEO' ? (
                    <video
                      src={item.mediaUrl}
                      className="w-full h-auto object-cover max-h-[512px]"
                      controls
                      preload="metadata"
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt="Post media"
                      className="w-full h-auto object-cover max-h-[512px]"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-2 -ml-2">
            <PostActions post={post} />
          </div>
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
        <Link key={index} href={`/hashtag/${tag}`} className="text-[rgb(0,149,246)] hover:underline">
          {part}
        </Link>
      );
    }
    if (part.startsWith('@')) {
      const username = part.slice(1).replace(/[^\w]/g, '');
      return (
        <Link key={index} href={`/@${username}`} className="text-[rgb(0,149,246)] hover:underline">
          {part}
        </Link>
      );
    }
    return part;
  });
}
