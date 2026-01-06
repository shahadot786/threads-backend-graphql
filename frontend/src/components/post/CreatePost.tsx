"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CREATE_POST_MUTATION } from "@/graphql/mutations/post";
import { apolloClient } from "@/lib/apollo-client";

interface CreatePostProps {
  onSuccess?: () => void;
}

export function CreatePost({ onSuccess }: CreatePostProps) {
  const user = useAuthStore(state => state.user);
  const closeCreatePost = useUIStore(state => state.closeCreatePost);
  const [content, setContent] = useState("");
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
    <div className="px-4 py-4 border-b border-border">
      <div className="flex gap-3">
        <Avatar
          src={user.profileImageUrl}
          firstName={user.firstName}
          lastName={user.lastName}
          size="md"
        />

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start a thread..."
            className="w-full bg-transparent text-text-primary placeholder-text-tertiary resize-none focus:outline-none min-h-[80px]"
            rows={3}
          />

          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-text-tertiary text-sm">
              {content.length > 0 && `${content.length}/500`}
            </span>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || content.length > 500}
              isLoading={isSubmitting}
              size="sm"
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeCreatePost}
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-full max-w-[600px] bg-bg-secondary rounded-2xl border border-border overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={closeCreatePost}
            className="text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
          <h2 className="font-semibold text-text-primary">New thread</h2>
          <div className="w-12" /> {/* Spacer */}
        </div>

        <CreatePost onSuccess={closeCreatePost} />
      </div>
    </div>
  );
}
