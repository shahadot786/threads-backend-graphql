"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CREATE_POST_MUTATION } from "@/graphql/mutations/post";
import { apolloClient } from "@/lib/apollo-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreatePostProps {
  onSuccess?: () => void;
}

export function CreatePost({ onSuccess }: CreatePostProps) {
  const user = useAuthStore(state => state.user);
  const closeCreatePost = useUIStore(state => state.closeCreatePost);
  const createPostContent = useUIStore(state => state.createPostContent);
  const [content, setContent] = useState(createPostContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createPost] = useMutation(CREATE_POST_MUTATION, {
    onCompleted: () => {
      setContent("");
      setIsSubmitting(false);
      closeCreatePost();
      // Refetch posts
      apolloClient.refetchQueries({ include: ["GetHomeFeed", "GetTrendingPosts"] });
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    await createPost({
      variables: {
        input: {
          content: content.trim(),
          visibility: "PUBLIC",
        },
      },
    });
  };

  if (!user) return null;

  return (
    <div className="px-1 py-1">
      <div className="flex gap-4">
        <Avatar className="w-10 h-10 border border-border/50">
          <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {user.firstName[0]}{user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-bold text-foreground text-[15px]">{user.username}</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start a thread..."
            className="w-full bg-transparent text-foreground placeholder-muted-foreground resize-none focus:outline-none min-h-[120px] text-[15px] leading-relaxed"
            rows={3}
            autoFocus
          />

          {error && (
            <p className="text-destructive text-sm mb-2 animate-fade-in">{error}</p>
          )}

          <div className="flex items-center justify-between pt-4">
            <span className="text-muted-foreground text-sm">
              {content.length > 0 ? `${content.length}/500` : "Anyone can reply"}
            </span>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > 500}
              isLoading={isSubmitting}
              className="px-6 h-9 font-bold bg-foreground text-background hover:bg-foreground/90 transition-all rounded-full"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal version
export function CreatePostModal() {
  const isOpen = useUIStore(state => state.isCreatePostOpen);
  const closeCreatePost = useUIStore(state => state.closeCreatePost);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCreatePost()}>
      <DialogContent className="sm:max-w-[620px] p-6 border-border/30 rounded-[24px] bg-background shadow-2xl gap-6">
        <DialogHeader className="border-b border-border/10 pb-4 mb-2">
          <DialogTitle className="text-center text-foreground font-bold">New thread</DialogTitle>
        </DialogHeader>

        <CreatePost onSuccess={closeCreatePost} />
      </DialogContent>
    </Dialog>
  );
}
