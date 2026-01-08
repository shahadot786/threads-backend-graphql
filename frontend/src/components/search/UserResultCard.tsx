"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { FOLLOW_USER_MUTATION, UNFOLLOW_USER_MUTATION } from "@/graphql/mutations/user";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { UserTooltip } from "@/components/common/UserTooltip";

interface UserResultCardProps {
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName?: string | null;
        profileImageUrl?: string | null;
        is_verified?: boolean | null; // For suggested users
        // For search users, it might be in UserBasicFields which includes is_verified

        bio?: string | null;
        location?: string | null;
        website?: string | null;
        email?: string;
        createdAt?: string;
        updatedAt?: string;

        // Common fields
        stats?: {
            followersCount: number;
            followingCount?: number;
            postsCount?: number;
        } | null;

        // The key field
        isFollowing?: boolean | null;
    };
}

export function UserResultCard({ user }: UserResultCardProps) {
    const { user: currentUser } = useAuthStore();
    const [isFollowing, setIsFollowing] = useState(!!user.isFollowing);
    const [loading, setLoading] = useState(false);

    const [followUser] = useMutation(FOLLOW_USER_MUTATION);
    const [unfollowUser] = useMutation(UNFOLLOW_USER_MUTATION);

    const isSelf = currentUser?.id === user.id;

    const handleFollowClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if inside a link (though we will separate them)
        e.stopPropagation();

        if (loading || isSelf) return;

        // Optimistic update
        const previousState = isFollowing;
        setIsFollowing(!previousState);
        setLoading(true);

        try {
            if (previousState) {
                await unfollowUser({ variables: { userId: user.id } });
            } else {
                await followUser({ variables: { userId: user.id } });
            }
        } catch (error) {
            // Revert on error
            console.error("Follow action failed", error);
            setIsFollowing(previousState);
        } finally {
            setLoading(false);
        }
    };

    // Cast user to any to satisfy UserTooltip props which expects strict User type
    // In a real app we would align types perfectly
    const toolTipUser = {
        ...user,
        email: user.email || "",
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
        stats: {
            followersCount: user.stats?.followersCount || 0,
            followingCount: user.stats?.followingCount || 0,
            postsCount: user.stats?.postsCount || 0,
        }
    } as any;

    return (
        <div className="flex items-center gap-4 px-4 py-4 hover:bg-secondary/20 transition-all group">
            {/* Clickable Area for Profile Navigation */}
            <UserTooltip user={toolTipUser}>
                <Link href={`/@${user.username}`} className="flex-1 flex items-center gap-4 min-w-0">
                    <Avatar className="w-12 h-12 border border-border/30">
                        <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                            {user.firstName[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground truncate transition-colors group-hover:underline">
                                {user.username}
                            </span>
                            {user.is_verified && ( // Handle both cases just in case
                                <svg aria-label="Verified" className="w-3.5 h-3.5 text-blue-500 fill-current" viewBox="0 0 40 40">
                                    <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.137V5.15h-6.162l-3.232-5.15-5.358 3.094Z" />
                                    <path d="M13.468 20.151l4.48 4.48 9.201-9.2-1.996-2.022-7.229 7.202-2.48-2.48-1.976 2.02z" fill="#fff" />
                                </svg>
                            )}
                        </div>
                        <p className="text-muted-foreground text-[14px] truncate leading-tight">
                            {user.firstName} {user.lastName}
                        </p>
                        {user.stats && (
                            <p className="text-muted-foreground text-[13px] mt-0.5">
                                {user.stats.followersCount.toLocaleString()} followers
                            </p>
                        )}
                    </div>
                </Link>
            </UserTooltip>

            {/* Separate Follow Button */}
            {!isSelf && (
                <div className="flex-shrink-0">
                    <button
                        onClick={handleFollowClick}
                        disabled={loading}
                        className={cn(
                            "h-9 px-6 rounded-xl text-[14px] font-bold transition-all active:scale-95 border",
                            isFollowing
                                ? "bg-transparent border-border/50 text-muted-foreground hover:text-foreground"
                                : "bg-transparent border-border/50 text-foreground hover:bg-foreground hover:text-background"
                        )}
                    >
                        {loading ? "..." : isFollowing ? "Following" : "Follow"}
                    </button>
                </div>
            )}
        </div>
    );
}
