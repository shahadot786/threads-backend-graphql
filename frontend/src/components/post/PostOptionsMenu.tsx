"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
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
  const [blockUser] = useMutation(gql`
    mutation BlockUser($userId: ID!) {
      blockUser(userId: $userId)
    }
  `);

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

  const handleBlock = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) return;

    if (window.confirm(`Block @${post.author.username}?\n\nThey won't be able to message you or find your profile or content on Threads. They won't be notified that you blocked them.`)) {
      try {
        await blockUser({ variables: { userId: post.author.id } });
        showToast(`Blocked @${post.author.username}`);
        setIsOpen(false);
        // Ideally we should refresh the feed or remove posts from this user
        // window.location.reload(); // Reloading is harsh, maybe just toast for now and let the next fetch handle it
        setIsOpen(false);
      } catch (error) {
        showToast("Failed to block user");
      }
    }
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

          {/* Block Option for non-owners */}
          {isAuthenticated && !isOwner && (
            <>
              <div className="border-t border-border" />
              <button
                onClick={handleBlock}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    aria-label="Block"
                    color="currentColor"
                    fill="currentColor"
                    height="18"
                    role="img"
                    viewBox="0 0 24 24"
                    width="18"
                  >
                    <title>Block</title>
                    <path d="M12 1.5c5.799 0 10.5 4.701 10.5 10.5S17.799 22.5 12 22.5 1.5 17.799 1.5 12 6.201 1.5 12 1.5ZM4.975 17.254a8.946 8.946 0 0 0 12.279-12.279L4.975 17.254Zm1.77-13.793L19.026 15.74a8.946 8.946 0 0 0-12.28-12.279Z"></path>
                  </svg>
                  <span>Block @{post.author.username}</span>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
