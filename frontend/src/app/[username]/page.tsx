"use client";

import { use } from "react";
import { useQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Loading";
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
        <div className="animate-pulse p-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="h-6 w-32 bg-bg-tertiary rounded mb-2" />
              <div className="h-4 w-24 bg-bg-tertiary rounded" />
            </div>
            <div className="w-20 h-20 rounded-full bg-bg-tertiary" />
          </div>
          <div className="h-4 w-full bg-bg-tertiary rounded mb-4" />
          <div className="flex gap-4">
            <div className="h-4 w-20 bg-bg-tertiary rounded" />
            <div className="h-4 w-20 bg-bg-tertiary rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout showAuthCard={false}>
        <div className="py-16 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">User not found</h2>
          <p className="text-text-secondary">@{username} doesn&apos;t exist</p>
          <Link href="/" className="mt-4 inline-block text-accent hover:underline">
            Go home
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showAuthCard={false}>
      {/* Profile Header */}
      <div className="px-4 py-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-text-primary">
              {getDisplayName(user.firstName, user.lastName)}
            </h1>
            <p className="text-text-primary">@{user.username}</p>
          </div>
          <Avatar
            src={user.profileImageUrl}
            firstName={user.firstName}
            lastName={user.lastName}
            size="xl"
          />
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-text-primary mb-4 whitespace-pre-wrap">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-text-secondary mb-4">
          <span>{formatCount(user.stats?.followersCount || 0)} followers</span>
          {user.website && (
            <>
              <span>·</span>
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <Button variant="outline" className="flex-1">
              Edit profile
            </Button>
          ) : (
            <>
              <Button variant="primary" className="flex-1">
                Follow
              </Button>
              <Button variant="outline" className="flex-1">
                Mention
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button className="flex-1 py-3 text-center font-medium text-text-primary border-b-2 border-accent">
          Threads
        </button>
        <button className="flex-1 py-3 text-center font-medium text-text-secondary">
          Replies
        </button>
        <button className="flex-1 py-3 text-center font-medium text-text-secondary">
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
          <div className="py-16 text-center">
            <p className="text-text-secondary">No threads yet</p>
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
