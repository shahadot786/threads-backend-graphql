"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { FOLLOW_USER_MUTATION, UNFOLLOW_USER_MUTATION } from "@/graphql/mutations/auth";
import { useUIStore } from "@/stores/ui";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/post/PostCard";
import { PostSkeleton } from "@/components/ui/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsMenu } from "@/components/layout/SettingsMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { GET_USER_BY_USERNAME } from "@/graphql/queries/user";
import { GET_USER_POSTS } from "@/graphql/queries/post";
import { formatCount, getDisplayName } from "@/lib/utils";
import Link from "next/link";
import type { User, PostConnection } from "@/types";
import { BlockedUsersList } from "@/components/user/BlockedUsersList";

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

  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isOwnProfile = currentUser?.username === username;

  const { openLoginModal, showToast, openEditProfileModal, openCreatePost } = useUIStore();

  const { data: userData, loading: userLoading } = useQuery<UserData>(
    GET_USER_BY_USERNAME,
    { variables: { username } }
  );

  const user = userData?.getUserByUsername;

  const [activeTab, setActiveTab] = useState<'threads' | 'replies' | 'reposts' | 'media' | 'bookmarks' | 'blocked'>('threads');

  const getFilterFromTab = (tab: typeof activeTab) => {
    switch (tab) {
      case 'replies': return 'REPLIES';
      case 'reposts': return 'REPOSTS';
      case 'media': return 'MEDIA';
      case 'bookmarks': return 'BOOKMARKS';
      default: return 'THREADS';
    }
  };

  const { data: postsData, loading: postsLoading } = useQuery<PostsData>(
    GET_USER_POSTS,
    {
      variables: {
        userId: user?.id,
        first: 20,
        filter: getFilterFromTab(activeTab)
      },
      skip: !user?.id || activeTab === 'blocked',
      fetchPolicy: "cache-and-network",
    }
  );

  const posts = postsData?.getUserPosts?.edges || [];

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (user) {
      setIsFollowing(user.isFollowing || false);
      setFollowersCount(user.stats?.followersCount || 0);
    }
  }, [user]);

  const [followUser, { loading: followLoading }] = useMutation(FOLLOW_USER_MUTATION);
  const [unfollowUser, { loading: unfollowLoading }] = useMutation(UNFOLLOW_USER_MUTATION);

  const handleFollowToggle = async () => {
    if (!user) return;

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    const previousIsFollowing = isFollowing;
    const previousFollowersCount = followersCount;

    // Optimistic update
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);

    try {
      if (isFollowing) {
        await unfollowUser({ variables: { userId: user.id } });
      } else {
        await followUser({ variables: { userId: user.id } });
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(previousIsFollowing);
      setFollowersCount(previousFollowersCount);
      showToast("Failed to update follow status");
    }
  };

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
          <h2 className="text-xl font-bold text-foreground mb-2">
            User not found
          </h2>
          <p className="text-muted-foreground">
            @{username} doesn&apos;t exist
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-primary hover:underline"
          >
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
              {user.firstName[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-foreground mt-4 whitespace-pre-wrap leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-muted-foreground mt-4 mb-6">
          <span className="hover:text-foreground cursor-pointer transition-colors">
            {formatCount(followersCount)} followers
          </span>
          <span>·</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">
            {formatCount(user.stats?.followingCount || 0)} following
          </span>
          {user.website && (
            <>
              <span>·</span>
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {user.website.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {isOwnProfile ? (
            <>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-9 font-bold"
                onClick={openEditProfileModal}
              >
                Edit profile
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden rounded-xl h-9 w-9 shrink-0"
                  >
                    <Settings size={18} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-100 p-0 overflow-hidden rounded-2xl border-border bg-card">
                  <DialogHeader className="p-4 border-b border-border">
                    <DialogTitle className="text-center text-base font-bold">
                      Settings
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-2">
                    <SettingsMenu variant="popover" />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Button
                onClick={handleFollowToggle}
                disabled={followLoading || unfollowLoading}
                className={`flex-1 rounded-xl h-9 font-bold transition-colors ${isFollowing
                  ? "bg-transparent border border-border text-foreground hover:bg-secondary/50"
                  : "bg-foreground text-background hover:opacity-90"
                  }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-9 font-bold"
                onClick={() => {
                  if (!isAuthenticated) {
                    openLoginModal();
                    return;
                  }
                  openCreatePost(`@${user.username} `);
                }}
              >
                Mention
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('threads')}
          className={`flex-1 min-w-[80px] py-3 text-center font-bold border-b-2 transition-colors ${activeTab === 'threads'
            ? "text-foreground border-foreground"
            : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
        >
          Threads
        </button>
        <button
          onClick={() => setActiveTab('replies')}
          className={`flex-1 min-w-[80px] py-3 text-center font-bold border-b-2 transition-colors ${activeTab === 'replies'
            ? "text-foreground border-foreground"
            : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
        >
          Replies
        </button>
        <button
          onClick={() => setActiveTab('reposts')}
          className={`flex-1 min-w-[80px] py-3 text-center font-bold border-b-2 transition-colors ${activeTab === 'reposts'
            ? "text-foreground border-foreground"
            : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
        >
          Reposts
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 min-w-[80px] py-3 text-center font-bold border-b-2 transition-colors ${activeTab === 'media'
            ? "text-foreground border-foreground"
            : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
        >
          Media
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 min-w-[80px] py-3 text-center font-bold border-b-2 transition-colors ${activeTab === 'bookmarks'
              ? "text-foreground border-foreground"
              : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
          >
            Saved
          </button>
        )}
        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex-1 min-w-[80px] py-3 text-center font-bold border-b-2 transition-colors ${activeTab === 'blocked'
              ? "text-foreground border-foreground"
              : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
          >
            Blocked
          </button>
        )}
      </div>

      {/* Posts or Blocked List */}
      <div className="pb-20 md:pb-4">
        {activeTab === 'blocked' ? (
          <BlockedUsersList />
        ) : postsLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center animate-fade-in">
            <p className="text-muted-foreground text-[15px]">
              {activeTab === 'threads' && "No threads yet"}
              {activeTab === 'replies' && "No replies yet"}
              {activeTab === 'reposts' && "No reposts yet"}
              {activeTab === 'media' && "No media yet"}
              {activeTab === 'bookmarks' && "No saved posts yet"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Guest Limit Logic */}
            {!isAuthenticated && posts.length > 0 ? (
              <>
                {posts.slice(0, 3).map(({ node: post }) => <PostCard key={post.id} post={post} />)}

                {/* Blur / CTA for Guests */}
                <div className="mt-4 px-6 mx-10 py-8 bg-secondary/30 rounded-xl text-center backdrop-blur-sm border border-border/50">
                  <h3 className="text-lg font-bold mb-2">Log in to see more</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Log in to view more posts from @{username}
                  </p>
                  <Button onClick={openLoginModal} className="font-bold px-8 rounded-xl h-10">
                    Log in
                  </Button>
                </div>
              </>
            ) : (
              posts.map(({ node: post }) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
