"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { PostActions } from "./PostActions";
import { PostOptionsMenu } from "./PostOptionsMenu";
import { formatRelativeTime } from "@/lib/utils";
import type { Post } from "@/types";
import { Repeat2 } from "lucide-react";

interface PostCardProps {
  post: Post;
  showThread?: boolean;
}

export function PostCard({ post, showThread = false }: PostCardProps) {
  const router = useRouter();
  const { author, content, createdAt, media, repostedBy } = post;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on links, buttons, or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('a, button, video, [role="button"]')) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="relative px-4 py-4 border-b border-border hover:bg-secondary/20 transition-all duration-300 cursor-pointer group/post"
    >
      {/* Reposted By Indicator */}
      {repostedBy && (
        <div className="flex items-center gap-2 mb-2 ml-12 text-muted-foreground text-xs">
          <Repeat2 size={14} className="text-[rgb(0,186,124)]" />
          <Link
            href={`/@${repostedBy.username}`}
            className="hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {repostedBy.username} reposted
          </Link>
        </div>
      )}

      <div className="flex gap-4">
        {/* Left Column: Avatar & Thread Line */}
        <div className="flex flex-col items-center shrink-0 relative">
          <Link
            href={`/@${author.username}`}
            className="z-10 bg-background rounded-full relative"
          >
            <Avatar className="w-11 h-11 border border-border/50">
              <AvatarImage
                src={author.profileImageUrl || ""}
                alt={author.username}
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {author.firstName[0]}
                {author.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          {/* Thread line */}
          {showThread && (
            <div className="absolute left-1/2 top-12 bottom-0 w-0.5 bg-border/50 -translate-x-1/2 rounded-full" />
          )}
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0 pb-1">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <Link
                href={`/@${author.username}`}
                className="font-bold text-foreground hover:underline text-[15px] leading-tight truncate"
              >
                {author.username}
              </Link>
              {author.is_verified && (
                <svg
                  aria-label="Verified"
                  fill="#0095F6"
                  height="12"
                  role="img"
                  viewBox="0 0 40 40"
                  width="12"
                  className="shrink-0"
                >
                  <path
                    d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6 6.162-3.38v-6.354L40 19.964l-5.248-6.29 2.858-5.788-6.163-3.137L25.359 0l-5.36 3.094Zm7.415 12.332-9.6 13.711-6.6-6.6 2.87-2.87 3.73 3.73 6.73-9.6 2.871 2.63Z"
                    fillRule="nonzero"
                  ></path>
                </svg>
              )}

              <span className="text-muted-foreground text-[14px] shrink-0">
                {formatRelativeTime(createdAt)}
              </span>
            </div>

            {/* More options button */}
            <PostOptionsMenu post={post} />
          </div>

          {/* Content text */}
          {content && (
            <div className="text-foreground text-[15px] leading-[1.4] whitespace-pre-wrap wrap-break-word mt-1">
              {renderContent(content)}
            </div>
          )}

          {/* Media */}
          {media && media.length > 0 && (
            <div
              className={`mt-3 overflow-hidden rounded-xl border border-border/50 max-w-full ${media.length > 1 ? "grid gap-1 grid-cols-2" : ""
                }`}
            >
              {media.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-muted w-full aspect-auto min-h-25"
                >
                  {item.mediaType === "VIDEO" ? (
                    <video
                      src={item.mediaUrl}
                      className="w-full h-auto object-cover max-h-128"
                      controls
                      preload="metadata"
                      playsInline
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <Image
                      src={item.mediaUrl}
                      alt="Post media"
                      width={1200}
                      height={800}
                      className="w-full h-auto object-cover max-h-128"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
    if (part.startsWith("#")) {
      const tag = part.slice(1).replace(/[^\w]/g, "");
      return (
        <Link
          key={index}
          href={`/hashtag/${tag}`}
          className="text-primary hover:underline font-medium"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("@")) {
      const username = part.slice(1).replace(/[^\w]/g, "");
      return (
        <Link
          key={index}
          href={`/@${username}`}
          className="text-primary hover:underline font-medium"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}
