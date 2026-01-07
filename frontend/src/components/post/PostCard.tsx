"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { PostActions } from "./PostActions";
import { PostOptionsMenu } from "./PostOptionsMenu";
import { formatRelativeTime } from "@/lib/utils";
import type { Post } from "@/types";
import { Repeat2, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MediaLightbox } from "@/components/common/MediaLightbox";

interface PostCardProps {
  post: Post;
  showThread?: boolean;
}

// Custom Video Component
const CustomVideoPlayer = ({ src, onClick, shouldPause }: { src: string, onClick: (e: React.MouseEvent) => void, shouldPause: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Intersection Observer for Auto-play when visible
  useEffect(() => {
    if (shouldPause && videoRef.current) {
      videoRef.current.pause();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && videoRef.current && !shouldPause) {
            videoRef.current.play().catch(() => { });
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [shouldPause]);

  return (
    <div className="relative group/video w-full h-full cursor-zoom-in" onClick={onClick}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
      />
      {/* Controls Overlay - Mute Only */}
      <div className="absolute bottom-3 right-3 flex gap-2 z-10 transition-opacity opacity-0 group-hover/video:opacity-100">
        <button
          onClick={toggleMute}
          className="p-1.5 bg-black/50 rounded-full text-white backdrop-blur-sm hover:bg-black/70 transition-all"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
};

export function PostCard({ post, showThread = false }: PostCardProps) {
  const router = useRouter();
  const { author, content, createdAt, media, repostedBy } = post;

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [initialLightboxIndex, setInitialLightboxIndex] = useState(0);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on links, buttons, or interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('a, button, [role="button"], .media-container')) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  const openLightbox = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setInitialLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
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

            {/* Media - Horizontal Scrollable View */}
            {media && media.length > 0 && (
              <div className="mt-3 media-container">
                <div
                  className={`flex gap-3 overflow-x-auto snap-x hide-scrollbar pb-2 ${media.length === 1 ? 'overflow-visible' : ''}`}
                  style={{ maskImage: media.length > 1 ? 'linear-gradient(to right, black 80%, transparent 100%)' : 'none' }}
                >
                  {media.map((item, index) => (
                    <div
                      key={item.id}
                      className={`relative bg-muted shrink-0 rounded-xl overflow-hidden border border-border/50 snap-center cursor-zoom-in group
                        ${media.length === 1 ? 'w-full aspect-auto max-h-[500px]' : 'w-[280px] h-[350px] aspect-[4/5]'}
                     `}
                      onClick={(e) => openLightbox(e, index)}
                    >
                      {item.mediaType === "VIDEO" ? (
                        <CustomVideoPlayer
                          src={item.mediaUrl}
                          onClick={(e) => openLightbox(e, index)}
                          shouldPause={lightboxOpen}
                        />
                      ) : (
                        <img
                          src={item.mediaUrl}
                          alt="Post media"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-2 -ml-2">
              <PostActions post={post} />
            </div>
          </div>
        </div>
      </article>

      {lightboxOpen && media && (
        <MediaLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          media={media.map(m => ({ mediaUrl: m.mediaUrl, mediaType: m.mediaType }))}
          initialIndex={initialLightboxIndex}
        />
      )}
    </>
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
          href={`/tags/${tag}`}
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
