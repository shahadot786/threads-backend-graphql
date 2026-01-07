"use client";

import { useQuery } from "@apollo/client/react";
import { GET_BLOCKED_USERS } from "@/graphql/queries/user";
import { BlockedUserItem } from "./BlockedUserItem";
import type { User } from "@/types";
import { Loader2 } from "lucide-react";

export function BlockedUsersList() {
  const { data, loading, error, refetch } = useQuery<{ getBlockedUsers: User[] }>(GET_BLOCKED_USERS, {
    fetchPolicy: "network-only",
  });

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load blocked users.
      </div>
    );
  }

  const blockedUsers = data?.getBlockedUsers || [];

  if (blockedUsers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        You haven't blocked anyone.
      </div>
    );
  }

  return (
    <div className="pb-20">
      {blockedUsers.map((user) => (
        <BlockedUserItem
          key={user.id}
          user={user}
          onUnblock={() => refetch()}
        />
      ))}
    </div>
  );
}
