"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { REPLY_TO_POST_MUTATION } from "@/graphql/mutations/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils";
import { X } from "lucide-react";

export function ReplyModal() {
  const { isReplyModalOpen, replyToPost, closeReplyModal, showToast } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [replyToPostMutation] = useMutation(REPLY_TO_POST_MUTATION, {
    onCompleted: () => {
      setContent("");
      closeReplyModal();
      showToast("Reply posted!");
    },
    onError: (error) => {
      showToast(`Error: ${error.message}`);
    },
    refetchQueries: ["GetPostReplies"],
  });

  if (!isReplyModalOpen || !replyToPost) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await replyToPostMutation({
        variables: {
          parentPostId: replyToPost.id,
          content: content.trim(),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeReplyModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Reply</h2>
          <button
            onClick={closeReplyModal}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Original Post Preview */}
        <div className="p-4 border-b border-border/50">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <Avatar className="w-10 h-10 border border-border/50">
                <AvatarImage
                  src={replyToPost.author.profileImageUrl || ""}
                  alt={replyToPost.author.username}
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {replyToPost.author.firstName[0]}
                  {replyToPost.author.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {/* Thread connector line */}
              <div className="w-0.5 flex-1 bg-border/50 mt-2 min-h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">
                  {replyToPost.author.username}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatRelativeTime(replyToPost.createdAt)}
                </span>
              </div>
              <p className="text-foreground text-sm mt-1 line-clamp-3">
                {replyToPost.content}
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                Replying to <span className="text-primary">@{replyToPost.author.username}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Reply Input */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 border border-border/50 shrink-0">
              <AvatarImage
                src={user?.profileImageUrl || ""}
                alt={user?.username || "You"}
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {user?.firstName?.[0] || "?"}
                {user?.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post your reply..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-sm min-h-[80px]"
              autoFocus
              maxLength={500}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {content.length}/500
            </span>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="px-6 py-2 bg-foreground text-background font-semibold rounded-full text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? "Posting..." : "Reply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
