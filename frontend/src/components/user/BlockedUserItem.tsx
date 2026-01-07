"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getDisplayName } from "@/lib/utils";
import type { User } from "@/types";
import { useMutation } from "@apollo/client/react";
import { UNBLOCK_USER_MUTATION } from "@/graphql/mutations/user";
import { useUIStore } from "@/stores/ui";

interface BlockedUserItemProps {
  user: User;
  onUnblock?: (userId: string) => void;
}

export function BlockedUserItem({ user, onUnblock }: BlockedUserItemProps) {
  const { showToast } = useUIStore();
  const [unblockUser, { loading }] = useMutation(UNBLOCK_USER_MUTATION, {
    refetchQueries: ["GetHomeFeed", "GetPublicFeed", "GetBlockedUsers"],
    awaitRefetchQueries: true,
  });

  const handleUnblock = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm(`Unblock @${user.username}?`)) {
      try {
        await unblockUser({ variables: { userId: user.id } });
        showToast(`Unblocked @${user.username}`);
        onUnblock?.(user.id);
      } catch (error) {
        showToast("Failed to unblock user");
      }
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-border">
      <Link href={`/@${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage src={user.profileImageUrl || undefined} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{user.username}</span>
          <span className="text-sm text-muted-foreground">{getDisplayName(user.firstName, user.lastName)}</span>
        </div>
      </Link>
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnblock}
        disabled={loading}
        className="rounded-xl px-4 font-semibold border-border hover:bg-hover h-8"
      >
        {loading ? "Unblocking..." : "Unblock"}
      </Button>
    </div>
  );
}
