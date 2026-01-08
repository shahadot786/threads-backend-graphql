"use client";

import { useQuery } from "@apollo/client/react";
import { GET_MY_BOOKMARKS } from "@/graphql/queries/post";
import { PostCard } from "@/components/post/PostCard";
import { X, Bookmark } from "lucide-react";
import type { Post } from "@/types";

interface SavedPostsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SavedPostsPanel({ isOpen, onClose }: SavedPostsPanelProps) {
    const { data, loading, error } = useQuery<any>(GET_MY_BOOKMARKS, {
        variables: { first: 20 },
        skip: !isOpen,
    });

    const posts: Post[] = data?.getMyBookmarks?.edges?.map((e: any) => e.node) || [];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed left-20 top-0 h-full w-[380px] bg-background border-r border-border z-50 animate-in slide-in-from-left duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Bookmark size={20} className="text-primary" />
                        <h2 className="text-lg font-bold">Saved</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="px-4 py-8 text-center text-muted-foreground">
                            Failed to load saved posts
                        </div>
                    )}

                    {!loading && !error && posts.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <Bookmark size={48} className="mx-auto mb-4 text-muted-foreground/50" />
                            <p className="text-muted-foreground font-medium">No saved posts yet</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Tap the bookmark icon on any post to save it here
                            </p>
                        </div>
                    )}

                    {!loading && posts.length > 0 && (
                        <div>
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
