"use client";

import { useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { PostCard } from "@/components/post/PostCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { PostSkeleton } from "@/components/ui/Loading";
import { SEARCH_USERS, SEARCH_POSTS } from "@/graphql/queries/search";
import { debounce } from "@/lib/utils";
import Link from "next/link";
import type { UserConnection, PostConnection, User } from "@/types";

type SearchTab = "users" | "posts";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("users");

  const [searchUsers, { data: usersData, loading: usersLoading }] = useLazyQuery<{ searchUsers: UserConnection }>(SEARCH_USERS);
  const [searchPosts, { data: postsData, loading: postsLoading }] = useLazyQuery<{ searchPosts: PostConnection }>(SEARCH_POSTS);

  const handleSearch = debounce((value: string) => {
    if (value.trim().length < 2) return;

    if (activeTab === "users") {
      searchUsers({ variables: { query: value, first: 20 } });
    } else {
      searchPosts({ variables: { query: value, first: 20 } });
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
    if (query.trim().length >= 2) {
      if (tab === "users") {
        searchUsers({ variables: { query, first: 20 } });
      } else {
        searchPosts({ variables: { query, first: 20 } });
      }
    }
  };

  const users = usersData?.searchUsers?.edges || [];
  const posts = postsData?.searchPosts?.edges || [];
  const loading = usersLoading || postsLoading;

  return (
    <MainLayout>
      <Header title="Search" />

      {/* Search Input Section */}
      <div className="px-4 py-6">
        <div className="relative max-w-[500px] mx-auto">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search"
            className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-transparent rounded-2xl text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-1 focus:ring-border/40 focus:border-border/30 text-[15px]"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/10 px-4">
        <button
          onClick={() => handleTabChange("users")}
          className={`flex-1 flex flex-col items-center py-3 text-[15px] font-bold transition-all relative ${activeTab === "users"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Users
          {activeTab === "users" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-foreground rounded-full transition-all duration-300" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("posts")}
          className={`flex-1 flex flex-col items-center py-3 text-[15px] font-bold transition-all relative ${activeTab === "posts"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Posts
          {activeTab === "posts" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-foreground rounded-full transition-all duration-300" />
          )}
        </button>
      </div>

      {/* Results */}
      <div className="pb-20 md:pb-4 min-h-[400px]">
        {query.length === 0 ? (
          <div className="py-20 text-center animate-fade-in">
            <p className="text-muted-foreground text-sm">Search for users or posts</p>
          </div>
        ) : query.length < 2 ? (
          <div className="py-20 text-center animate-fade-in">
            <p className="text-muted-foreground text-sm">Enter at least 2 characters</p>
          </div>
        ) : loading ? (
          <div className="space-y-0 pt-0">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : activeTab === "users" ? (
          users.length === 0 ? (
            <div className="py-20 text-center animate-fade-in">
              <p className="text-muted-foreground text-sm">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {users.map((edge) => (
                <Link
                  key={edge.node.id}
                  href={`/@${edge.node.username}`}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-secondary/20 transition-all group"
                >
                  <Avatar className="w-12 h-12 border border-border/30">
                    <AvatarImage src={edge.node.profileImageUrl || ""} alt={edge.node.username} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {edge.node.firstName[0]}{edge.node.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground truncate transition-colors group-hover:underline">
                        {edge.node.username}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[14px] truncate leading-tight">
                      {edge.node.firstName} {edge.node.lastName}
                    </p>
                    {edge.node.stats && (
                      <p className="text-muted-foreground text-[13px] mt-0.5">
                        {edge.node.stats.followersCount.toLocaleString()} followers
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <button className="h-9 px-6 rounded-xl border border-border/50 text-[14px] font-bold hover:bg-foreground hover:text-background transition-all active:scale-95">
                      Follow
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : posts.length === 0 ? (
          <div className="py-20 text-center animate-fade-in">
            <p className="text-muted-foreground text-sm">No posts found</p>
          </div>
        ) : (
          <div className="divide-y divide-border/10">
            {posts.map(({ node: post }) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
