// Main Component
// Main Component
import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CREATE_POST_MUTATION, UPDATE_POST_MUTATION } from "@/graphql/mutations/post";
import { SEARCH_USERS } from "@/graphql/queries/search";
import { apolloClient } from "@/lib/apollo-client";
import { Camera, Smile, X, Image as ImageIcon, FileVideo, Quote } from "lucide-react";
import dynamic from 'next/dynamic';
import { Theme } from 'emoji-picker-react';
import { GifModal } from "./GifModal";
import { QuoteGenerator } from "./QuoteGenerator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { User } from "@/types";
import { API_BASE_URL } from "@/lib/config";

// Dynamic import for emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface CreatePostProps {
  onSuccess?: () => void;
}

interface MediaFile {
  file?: File;
  url?: string;
  preview: string;
  type: "IMAGE" | "VIDEO" | "GIF";
}

export function CreatePost({ onSuccess }: CreatePostProps) {
  const user = useAuthStore(state => state.user);
  const closeCreatePost = useUIStore(state => state.closeCreatePost);
  const { createPostContent, editPostData } = useUIStore();
  const [content, setContent] = useState(createPostContent);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Modes
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifModal, setShowGifModal] = useState(false);
  const [showQuoteMode, setShowQuoteMode] = useState(false);

  // Mention Autocomplete State
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const mentionDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // User search query
  const [searchUsers, { data: mentionData, loading: mentionLoading }] = useLazyQuery<any>(SEARCH_USERS);
  const mentionSuggestions: User[] = mentionData?.searchUsers?.edges?.map((e: any) => e.node) || [];

  // Initialize from Edit Data
  useEffect(() => {
    if (editPostData) {
      setContent(editPostData.content || "");
      if (editPostData.media && editPostData.media.length > 0) {
        setMediaFiles(editPostData.media.map(m => ({
          url: m.mediaUrl,
          preview: m.mediaUrl,
          type: m.mediaType
        })));
      }
    }
  }, [editPostData]);

  const [createPost] = useMutation(CREATE_POST_MUTATION, {
    onCompleted: () => {
      handleSuccess();
    },
    onError: (err) => {
      setError(err.message);
      setIsSubmitting(false);
    },
  });

  const [updatePost] = useMutation(UPDATE_POST_MUTATION, {
    onCompleted: () => {
      handleSuccess("Post updated successfully");
    },
    onError: (err) => {
      setError(err.message);
      setIsSubmitting(false);
    },
  });

  const handleSuccess = (message?: string) => {
    setContent("");
    setMediaFiles([]);
    setIsSubmitting(false);
    // Explicitly clear edit mode in store is handled by closeCreatePost? No, logic moved to store.
    // Ideally we should reset store state
    useUIStore.setState({ editPostData: null, createPostContent: "" });
    closeCreatePost();
    apolloClient.refetchQueries({ include: ["GetHomeFeed", "GetTrendingPosts"] });
    if (message) useUIStore.getState().showToast(message);
    onSuccess?.();
  };

  // Mention autocomplete handlers
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(newContent);

    // Check for @ mention pattern
    const textBeforeCursor = newContent.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      const startIdx = cursorPos - query.length - 1; // Position of @

      setMentionQuery(query);
      setMentionStartIndex(startIdx);
      setSelectedMentionIndex(0);

      // Debounce the search
      if (mentionDebounceRef.current) {
        clearTimeout(mentionDebounceRef.current);
      }

      if (query.length >= 1) {
        mentionDebounceRef.current = setTimeout(() => {
          searchUsers({ variables: { query, first: 5 } });
          setShowMentionSuggestions(true);
        }, 300);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery("");
      setMentionStartIndex(null);
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionSuggestions || mentionSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedMentionIndex((prev) =>
        prev < Math.min(mentionSuggestions.length - 1, 4) ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter" && showMentionSuggestions) {
      e.preventDefault();
      const selectedUser = mentionSuggestions[selectedMentionIndex];
      if (selectedUser) {
        insertMention(selectedUser);
      }
    } else if (e.key === "Escape") {
      setShowMentionSuggestions(false);
    }
  };

  const insertMention = (user: User) => {
    if (mentionStartIndex === null) return;

    const beforeMention = content.slice(0, mentionStartIndex);
    const afterMention = content.slice(mentionStartIndex + mentionQuery.length + 1); // +1 for @
    const newContent = `${beforeMention}@${user.username} ${afterMention}`;

    setContent(newContent);
    setShowMentionSuggestions(false);
    setMentionQuery("");
    setMentionStartIndex(null);

    // Refocus textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement> | File[]) => {
    // Normalize input: it can be an event or array of files
    let files: File[] = [];
    if (Array.isArray(e)) {
      files = e;
    } else if (e.target.files) {
      files = Array.from(e.target.files);
    }

    if (files.length === 0) return;

    const newMedia: MediaFile[] = [];
    let tempError = null;

    if (mediaFiles.length + files.length > 10) {
      setError("Maximum 10 files allowed.");
      return;
    }

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const type = file.type === "image/gif" ? "GIF" : "IMAGE";
        if (file.size > 2 * 1024 * 1024 && type === "GIF") { // GIF specific check
          tempError = `GIF ${file.name} exceeds 2MB limit.`;
          continue;
        } else if (file.size > 2 * 1024 * 1024 && type === "IMAGE") { // Increased image limit for safety
          tempError = `Image ${file.name} exceeds 2MB limit.`;
          continue;
        }

        newMedia.push({ file, preview: URL.createObjectURL(file), type });
      } else if (file.type.startsWith("video/")) {
        if (file.size > 10 * 1024 * 1024) { // Increased video limit
          tempError = `Video ${file.name} exceeds 10MB limit.`;
          continue;
        }
        newMedia.push({ file, preview: URL.createObjectURL(file), type: "VIDEO" });
      }
    }

    if (tempError) setError(tempError);
    setMediaFiles([...mediaFiles, ...newMedia]);
    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      const finalMedia = [];

      // Process Media Files
      // 1. Existing URLs -> pass through
      // 2. New Files -> Upload -> get URL

      const filesToUpload = mediaFiles.filter(m => m.file);
      let uploadedUrls: string[] = [];

      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach(m => formData.append("files", m.file!));

        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const data = await uploadRes.json();
        uploadedUrls = data.urls || (data.url ? [data.url] : []);
      }

      // Reconstruct the ordered list
      let uploadIndex = 0;
      for (let i = 0; i < mediaFiles.length; i++) {
        const item = mediaFiles[i];
        if (item.url) {
          finalMedia.push({
            mediaType: item.type,
            mediaUrl: item.url,
            position: i
          });
        } else {
          // It was uploaded
          finalMedia.push({
            mediaType: item.type,
            mediaUrl: uploadedUrls[uploadIndex],
            position: i
          });
          uploadIndex++;
        }
      }


      if (editPostData) {
        // Update
        await updatePost({
          variables: {
            postId: editPostData.id,
            input: {
              content: content.trim(),
              media: finalMedia.length > 0 ? finalMedia : undefined
              // Visibility update generally handled separately not in this form, or reuse existing?
              // Assuming updatePost input supports visibility too but we might default to existing or PUBLIC
            }
          }
        });
      } else {
        // Create
        await createPost({
          variables: {
            input: {
              content: content.trim(),
              visibility: "PUBLIC",
              media: finalMedia.length > 0 ? finalMedia : undefined
            },
          },
        });
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="px-4 py-4 relative">
      {!showQuoteMode ? (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 border border-border/50">
            <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {user.firstName[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 w-full min-w-0 relative">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-bold text-foreground text-[15px]">{user.username}</span>
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleTextareaKeyDown}
              placeholder={editPostData ? "Update your thread..." : "Start a thread..."}
              className="w-full bg-transparent text-foreground placeholder-muted-foreground resize-none focus:outline-none min-h-[120px] text-[15px] leading-relaxed"
              rows={Math.max(5, content.split('\n').length)}
              autoFocus
            />

            {/* Mention Suggestions Dropdown */}
            {showMentionSuggestions && mentionSuggestions.length > 0 && (
              <div className="absolute z-50 bg-card border border-border rounded-xl shadow-xl max-h-[200px] overflow-y-auto w-[280px] animate-in fade-in slide-in-from-top-2">
                {mentionSuggestions.slice(0, 5).map((user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => insertMention(user)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary transition-colors ${index === selectedMentionIndex ? 'bg-secondary' : ''
                      }`}
                  >
                    <Avatar className="w-8 h-8 border border-border/50">
                      <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
                      <AvatarFallback className="text-xs">{user.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">@{user.username}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.firstName} {user.lastName}</div>
                    </div>
                  </button>
                ))}
                {mentionLoading && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
                )}
              </div>
            )}

            {/* Media Previews */}
            {mediaFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto max-w-full py-2 snap-x">
                {mediaFiles.map((media, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-36 h-48 bg-secondary/30 rounded-xl overflow-hidden border border-border/50 snap-center group">
                    <button
                      onClick={() => removeMedia(idx)}
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white z-10 transition-colors"
                    >
                      <X size={14} />
                    </button>

                    {media.type === "IMAGE" || media.type === "GIF" ? (
                      <img src={media.preview} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <video src={media.preview} className="w-full h-full object-cover" muted />
                    )}
                    {media.type === "GIF" && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-xs font-bold text-white uppercase">GIF</div>
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

                {/* Image Upload */}
                <button onClick={() => fileInputRef.current?.click()} className="hover:text-foreground transition-colors" title="Add Image/Video">
                  <ImageIcon size={20} />
                </button>

                {/* GIF Button */}
                <button onClick={() => setShowGifModal(true)} className="hover:text-foreground transition-colors" title="Add GIF">
                  <FileVideo size={20} />
                  {/* Using FileVideo as GIF icon proxy */}
                </button>

                {/* Quote Button */}
                <button onClick={() => setShowQuoteMode(true)} className="hover:text-foreground transition-colors" title="Create Quote">
                  <Quote size={20} />
                </button>

                {/* Emoji Picker */}
                <div className="relative">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="hover:text-foreground transition-colors" title="Add Emoji">
                    <Smile size={20} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute z-50 top-full mt-2 left-0 shadow-xl rounded-xl">
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
                  {editPostData ? "Update" : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Quote Generator Mode - Full overlay in the creation area */
        <QuoteGenerator
          onGenerate={(file) => {
            handleFileSelect([file]);
            setShowQuoteMode(false);
          }}
          onCancel={() => setShowQuoteMode(false)}
        />
      )}

      {/* GIF Modal */}
      <GifModal
        isOpen={showGifModal}
        onClose={() => setShowGifModal(false)}
        onSelect={(file) => handleFileSelect([file])}
      />
    </div>
  );
}

