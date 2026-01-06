"use client";

import { useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { PostCard } from "@/components/post/PostCard";
import { Avatar } from "@/components/ui/Avatar";
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

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-3 bg-bg-secondary rounded-xl text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => handleTabChange("users")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "users"
            ? "text-text-primary border-b-2 border-accent"
            : "text-text-secondary"
            }`}
        >
          Users
        </button>
        <button
          onClick={() => handleTabChange("posts")}
          className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === "posts"
            ? "text-text-primary border-b-2 border-accent"
            : "text-text-secondary"
            }`}
        >
          Posts
        </button>
      </div>

      {/* Results */}
      <div className="pb-20 md:pb-4">
        {query.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-text-secondary">Search for users or posts</p>
          </div>
        ) : query.length < 2 ? (
          <div className="py-16 text-center">
            <p className="text-text-secondary">Enter at least 2 characters</p>
          </div>
        ) : loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : activeTab === "users" ? (
          users.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-text-secondary">No users found</p>
            </div>
          ) : (
            users.map((edge) => (
              <Link
                key={edge.node.id}
                href={`/@${edge.node.username}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-hover transition-colors"
              >
                <Avatar
                  src={edge.node.profileImageUrl}
                  firstName={edge.node.firstName}
                  lastName={edge.node.lastName}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-text-primary truncate">{edge.node.username}</span>
                    {edge.node.is_verified && (
                      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm truncate">
                    {edge.node.firstName} {edge.node.lastName}
                  </p>
                  {edge.node.stats && (
                    <p className="text-text-tertiary text-sm">
                      {edge.node.stats.followersCount} followers
                    </p>
                  )}
                </div>
              </Link>
            ))
          )
        ) : posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-text-secondary">No posts found</p>
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
