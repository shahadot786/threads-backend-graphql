"use client";

import { useMutation } from "@apollo/client/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FOLLOW_USER_MUTATION, UNFOLLOW_USER_MUTATION } from "@/graphql/mutations/user";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import type { User } from "@/types";

interface UserTooltipProps {
    user: User;
    children: React.ReactNode;
}

export function UserTooltip({ user, children }: UserTooltipProps) {
    const { user: currentUser } = useAuthStore();
    const [isFollowing, setIsFollowing] = useState(!!user.isFollowing);
    const [loading, setLoading] = useState(false);

    const [followUser] = useMutation(FOLLOW_USER_MUTATION);
    const [unfollowUser] = useMutation(UNFOLLOW_USER_MUTATION);

    const isSelf = currentUser?.id === user.id;

    const handleFollowClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading || isSelf) return;

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
            console.error("Follow action failed", error);
            setIsFollowing(previousState);
        } finally {
            setLoading(false);
        }
    };

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-[320px] p-4 bg-background border-border shadow-xl rounded-xl z-50">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                        <Link href={`/@${user.username}`} className="group/avatar">
                            <Avatar className="w-16 h-16 border border-border/30 transition-transform group-hover/avatar:scale-105">
                                <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
                                <AvatarFallback className="text-lg bg-muted text-muted-foreground">
                                    {user.firstName[0]}
                                </AvatarFallback>
                            </Avatar>
                        </Link>

                        <div className="flex-1 min-w-0 pt-1">
                            <Link href={`/@${user.username}`} className="block">
                                <h4 className="font-bold text-lg leading-tight hover:underline truncate">
                                    {user.username}
                                    {user.is_verified && (
                                        <svg aria-label="Verified" className="inline-block ml-1 w-3.5 h-3.5 text-blue-500 fill-current align-baseline" viewBox="0 0 40 40">
                                            <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.137V5.15h-6.162l-3.232-5.15-5.358 3.094Z" />
                                            <path d="M13.468 20.151l4.48 4.48 9.201-9.2-1.996-2.022-7.229 7.202-2.48-2.48-1.976 2.02z" fill="#fff" />
                                        </svg>
                                    )}
                                </h4>
                                <span className="text-muted-foreground text-sm truncate block">
                                    {user.firstName} {user.lastName}
                                </span>
                            </Link>
                        </div>
                    </div>

                    {user.bio && (
                        <p className="text-[14px] text-foreground leading-relaxed line-clamp-3 whitespace-pre-wrap">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-4 text-[14px] text-muted-foreground">
                            <span className="hover:text-foreground transition-colors cursor-pointer">
                                <span className="font-semibold text-foreground">{user.stats?.followersCount?.toLocaleString() || 0}</span> followers
                            </span>
                        </div>

                        {!isSelf && (
                            <button
                                onClick={handleFollowClick}
                                disabled={loading}
                                className={cn(
                                    "h-8 px-6 rounded-lg text-sm font-bold transition-all active:scale-95 border",
                                    isFollowing
                                        ? "bg-transparent border-border/50 text-muted-foreground hover:text-foreground"
                                        : "bg-foreground border-transparent text-background hover:opacity-90"
                                )}
                            >
                                {loading ? "..." : isFollowing ? "Following" : "Follow"}
                            </button>
                        )}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
