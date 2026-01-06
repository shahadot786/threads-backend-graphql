"use client";

import { use } from "react";
import { useQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth";
import { GET_USER_BY_USERNAME } from "@/graphql/queries/user";
import { GET_USER_POSTS } from "@/graphql/queries/post";
import { formatCount, getDisplayName } from "@/lib/utils";
import Link from "next/link";
import type { User, PostConnection } from "@/types";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

interface UserData {
  getUserByUsername: User | null;
}

interface PostsData {
  getUserPosts: PostConnection;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const rawUsername = resolvedParams.username;
  // Robustly decode and strip leading @ characters
  const decodedUsername = decodeURIComponent(rawUsername);
  const username = decodedUsername.replace(/^@+/, "");

  const currentUser = useAuthStore(state => state.user);
  const isOwnProfile = currentUser?.username === username;

  const { data: userData, loading: userLoading } = useQuery<UserData>(
    GET_USER_BY_USERNAME,
    { variables: { username } }
  );

  const user = userData?.getUserByUsername;

  const { data: postsData, loading: postsLoading } = useQuery<PostsData>(
    GET_USER_POSTS,
    {
      variables: { userId: user?.id, first: 20 },
      skip: !user?.id,
    }
  );

  const posts = postsData?.getUserPosts?.edges || [];

  if (userLoading) {
    return (
      <MainLayout showAuthCard={false}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="w-20 h-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout showAuthCard={false}>
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground">@{username} doesn&apos;t exist</p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            Go home
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showAuthCard={false}>
      {/* Profile Header */}
      <div className="px-4 py-8 border-b border-border/50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {getDisplayName(user.firstName, user.lastName)}
            </h1>
            <p className="text-foreground text-[15px]">@{user.username}</p>
          </div>
          <Avatar className="w-20 h-20 border border-border/50">
            <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xl">
              {user.firstName[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-foreground mt-4 whitespace-pre-wrap leading-relaxed">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-muted-foreground mt-4 mb-6">
          <span className="hover:text-foreground cursor-pointer transition-colors">{formatCount(user.stats?.followersCount || 0)} followers</span>
          {user.website && (
            <>
              <span>·</span>
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <Button variant="outline" className="flex-1 rounded-xl h-9 font-bold">
              Edit profile
            </Button>
          ) : (
            <>
              <Button className="flex-1 rounded-xl h-9 font-bold bg-foreground text-background">
                Follow
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl h-9 font-bold">
                Mention
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button className="flex-1 py-3 text-center font-bold text-foreground border-b-2 border-foreground">
          Threads
        </button>
        <button className="flex-1 py-3 text-center font-medium text-muted-foreground hover:text-foreground transition-colors">
          Replies
        </button>
        <button className="flex-1 py-3 text-center font-medium text-muted-foreground hover:text-foreground transition-colors">
          Reposts
        </button>
      </div>

      {/* Posts */}
      <div className="pb-20 md:pb-4">
        {postsLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center animate-fade-in">
            <p className="text-muted-foreground text-[15px]">No threads yet</p>
          </div>
        ) : (
          posts.map(({ node: post }) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </MainLayout>
  );
}
