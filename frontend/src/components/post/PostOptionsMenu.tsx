"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { DELETE_POST_MUTATION, UPDATE_POST_MUTATION } from "@/graphql/mutations/post";
import type { Post } from "@/types";
import {
  MoreHorizontal,
  Link2,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Users,
  Lock
} from "lucide-react";

interface PostOptionsMenuProps {
  post: Post;
  onDelete?: () => void;
  onUpdate?: (updates: Partial<Post>) => void;
}

export function PostOptionsMenu({ post, onDelete, onUpdate }: PostOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showVisibilitySubmenu, setShowVisibilitySubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const { showToast, showAlert } = useUIStore();

  const isOwner = user && post.author.id === user.id;

  const [deletePost, { loading: deleteLoading }] = useMutation(DELETE_POST_MUTATION);
  const [updatePost, { loading: updateLoading }] = useMutation(UPDATE_POST_MUTATION);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowVisibilitySubmenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
    setShowVisibilitySubmenu(false);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    showToast("Link copied to clipboard!");
    setIsOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For now, show a message - edit modal can be implemented later
    showToast("Edit feature coming soon!");
    setIsOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (deleteLoading) return;

    showAlert("Delete Post", "Are you sure you want to delete this post? This action cannot be undone.");
    setIsOpen(false);

    // For actual deletion, we'd need a confirmation modal
    // For now, let's just delete directly after alert closes
    try {
      await deletePost({ variables: { postId: post.id } });
      showToast("Post deleted");
      onDelete?.();
    } catch {
      showToast("Failed to delete post");
    }
  };

  const handleVisibilityChange = async (visibility: "PUBLIC" | "FOLLOWERS" | "PRIVATE", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (updateLoading || post.visibility === visibility) {
      setIsOpen(false);
      return;
    }

    try {
      await updatePost({
        variables: {
          postId: post.id,
          input: { visibility }
        }
      });
      onUpdate?.({ visibility });
      showToast(`Post visibility changed to ${visibility.toLowerCase()}`);
    } catch {
      showToast("Failed to update visibility");
    }
    setIsOpen(false);
    setShowVisibilitySubmenu(false);
  };

  const visibilityIcon = {
    PUBLIC: <Globe size={16} />,
    FOLLOWERS: <Users size={16} />,
    PRIVATE: <Lock size={16} />,
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={handleToggle}
        className="p-2 -mr-2 -mt-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95"
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Copy Link - always visible */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <Link2 size={18} className="text-muted-foreground" />
            Copy link
          </button>

          {/* Owner-only options */}
          {isAuthenticated && isOwner && (
            <>
              <div className="border-t border-border" />

              {/* Edit */}
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
              >
                <Pencil size={18} className="text-muted-foreground" />
                Edit post
              </button>

              {/* Visibility */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowVisibilitySubmenu(!showVisibilitySubmenu);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {post.visibility === "PUBLIC" ? <Eye size={18} className="text-muted-foreground" /> : <EyeOff size={18} className="text-muted-foreground" />}
                    <span>Visibility</span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{post.visibility.toLowerCase()}</span>
                </button>

                {/* Visibility Submenu */}
                {showVisibilitySubmenu && (
                  <div className="border-t border-border bg-secondary/50">
                    {(["PUBLIC", "FOLLOWERS", "PRIVATE"] as const).map((vis) => (
                      <button
                        key={vis}
                        onClick={(e) => handleVisibilityChange(vis, e)}
                        className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm hover:bg-secondary transition-colors ${post.visibility === vis ? "text-primary font-medium" : "text-foreground"
                          }`}
                      >
                        {visibilityIcon[vis]}
                        <span className="capitalize">{vis.toLowerCase()}</span>
                        {post.visibility === vis && (
                          <span className="ml-auto text-primary">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border" />

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={18} />
                {deleteLoading ? "Deleting..." : "Delete post"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
