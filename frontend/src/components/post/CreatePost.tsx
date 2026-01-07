
// Main Component
import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CREATE_POST_MUTATION } from "@/graphql/mutations/post";
import { apolloClient } from "@/lib/apollo-client";
import { Camera, Smile, X, Paperclip } from "lucide-react";
import dynamic from 'next/dynamic';
import { Theme } from 'emoji-picker-react';

// Dynamic import for emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface CreatePostProps {
  onSuccess?: () => void;
}

interface MediaFile {
  file: File;
  preview: string;
  type: "IMAGE" | "VIDEO" | "GIF";
}

export function CreatePost({ onSuccess }: CreatePostProps) {
  const user = useAuthStore(state => state.user);
  const closeCreatePost = useUIStore(state => state.closeCreatePost);
  const createPostContent = useUIStore(state => state.createPostContent);
  const [content, setContent] = useState(createPostContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Media State
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Emoji State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [createPost] = useMutation(CREATE_POST_MUTATION, {
    onCompleted: () => {
      setContent("");
      setMediaFiles([]);
      setIsSubmitting(false);
      closeCreatePost();
      apolloClient.refetchQueries({ include: ["GetHomeFeed", "GetTrendingPosts"] });
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message);
      setIsSubmitting(false);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newMedia: MediaFile[] = [];
      let tempError = null;

      if (mediaFiles.length + files.length > 10) {
        setError("Maximum 10 files allowed.");
        return;
      }

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          if (file.size > 2 * 1024 * 1024) {
            tempError = `Image ${file.name} exceeds 2MB limit.`;
            continue; // Skip this file
          }
          newMedia.push({ file, preview: URL.createObjectURL(file), type: "IMAGE" });
        } else if (file.type.startsWith("video/")) {
          if (file.size > 10 * 1024 * 1024) {
            tempError = `Video ${file.name} exceeds 10MB limit.`;
            continue;
          }
          newMedia.push({ file, preview: URL.createObjectURL(file), type: "VIDEO" });
        }
      }

      if (tempError) setError(tempError);
      setMediaFiles([...mediaFiles, ...newMedia]);
      // Clear input so same file can be selected again if removed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const onEmojiClick = (emojiObject: any) => {
    setContent(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const uploadedMedia = [];

      // 1. Upload files first if any
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach(m => formData.append("files", m.file));

        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/upload`, {
          method: "POST",
          body: formData
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const data = await uploadRes.json();
        // Backend returns { urls: [...] } or { url: ..., urls: [...] } if single
        // We need to map them back to types. Assuming order is preserved (multer usually preserves order).
        const urls = data.urls || (data.url ? [data.url] : []);

        uploadedMedia.push(...urls.map((url: string, index: number) => ({
          mediaType: mediaFiles[index].type,
          mediaUrl: url,
          position: index
        })));
      }

      // 2. Create Post
      await createPost({
        variables: {
          input: {
            content: content.trim(),
            visibility: "PUBLIC",
            media: uploadedMedia.length > 0 ? uploadedMedia : undefined
          },
        },
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setIsSubmitting(false);
    }
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

        <div className="flex-1 w-full relative">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-bold text-foreground text-[15px]">{user.username}</span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start a thread..."
            className="w-full bg-transparent text-foreground placeholder-muted-foreground resize-none focus:outline-none min-h-[50px] text-[15px] leading-relaxed"
            rows={content.split('\n').length > 1 ? Math.min(content.split('\n').length, 10) : 1}
            autoFocus
          />

          {/* Media Previews - Horizontal Scrollable */}
          {mediaFiles.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2 snap-x hide-scrollbar">
              {mediaFiles.map((media, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-48 h-64 bg-secondary/30 rounded-xl overflow-hidden border border-border/50 snap-center group">
                  <button
                    onClick={() => removeMedia(idx)}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white z-10 transition-colors"
                  >
                    <X size={14} />
                  </button>

                  {media.type === "IMAGE" ? (
                    <img src={media.preview} className="w-full h-full object-cover" alt="preview" />
                  ) : (
                    <video src={media.preview} className="w-full h-full object-cover" muted />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-destructive text-sm mb-2 animate-fade-in">{error}</p>
          )}

          <div className="flex items-center justify-between pt-4 mt-2">
            <div className="flex items-center gap-4 text-muted-foreground">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <button onClick={() => fileInputRef.current?.click()} className="hover:text-foreground transition-colors">
                <Paperclip size={20} />
              </button>

              <div className="relative">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="hover:text-foreground transition-colors">
                  <Smile size={20} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-50 top-full mt-2 left-0 shadow-xl rounded-xl">
                    {/* Overlay to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                    <div className="relative z-50">
                      <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} width={300} height={400} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-muted-foreground text-xs hidden sm:block">
                {content.length > 0 || mediaFiles.length > 0 ? "Anyone can reply" : ""}
              </span>
              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && mediaFiles.length === 0)}
                isLoading={isSubmitting}
                className="px-6 h-9 font-bold bg-foreground text-background hover:bg-foreground/90 transition-all rounded-full"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

