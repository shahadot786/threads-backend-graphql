"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { cn } from "@/lib/utils";
import { ThreadsLogo } from "@/components/ui/Logo";

// Icons -----------------------------------------------------

const HomeIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0.5 : 2} aria-label="Home" role="img">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z" />
  </svg>
);

const SearchIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={filled ? 3 : 2} aria-label="Search" role="img">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const CreateIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2} aria-label="Create" role="img">
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0.5 : 2} aria-label="Activity" role="img">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const ProfileIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0.5 : 2} aria-label="Profile" role="img">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const PinIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0.5 : 2} aria-label="Pins" role="img">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.44 2.89a.7.7 0 0 0-.58-.29H9.13a.7.7 0 0 0-.57.3.73.73 0 0 0-.1.66l.75 3.48-1.55 1.56a5.05 5.05 0 0 0-1.48 3.55v4.22h-1.2a.75.75 0 1 0 0 1.5h1.2v2.75a2.88 2.88 0 0 0 2.88 2.88h5.9a2.9 2.9 0 0 0 2.88-2.88v-2.75h1.21a.75.75 0 0 0 0-1.5h-1.21V12.1a5.05 5.05 0 0 0-1.48-3.55L14.78 7l.79-3.48a.71.71 0 0 0-.13-.63Z" />
  </svg>
);

const MenuIcon = () => (
  <svg aria-label="More" height="24" role="img" viewBox="0 0 24 24" width="24">
    <rect fill="currentColor" height="2.5" rx="1.25" width="21" x="3" y="7"></rect>
    <rect fill="currentColor" height="2.5" rx="1.25" width="10" x="3" y="15"></rect>
  </svg>
);

// -----------------------------------------------------------

interface NavItemProps {
  href: string;
  icon: (props: { filled: boolean }) => React.ReactNode;
  isActive: boolean;
  requiresAuth?: boolean;
  className?: string;
}

function NavItem({ href, icon: Icon, isActive, requiresAuth, className }: NavItemProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const openLoginModal = useUIStore(state => state.openLoginModal);

  const handleClick = (e: React.MouseEvent) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openLoginModal();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group p-4 rounded-2xl transition-all duration-200",
        isActive
          ? "text-icon-active"
          : "text-[#4d4d4d] hover:bg-hover hover:text-text-primary",
        className
      )}
    >
      <div className="transition-transform duration-200 group-active:scale-90">
        <Icon filled={isActive} />
      </div>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const openCreatePost = useUIStore(state => state.openCreatePost);
  const openLoginModal = useUIStore(state => state.openLoginModal);

  const handleCreateClick = () => {
    if (isAuthenticated) {
      openCreatePost();
    } else {
      openLoginModal();
    }
  };

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="hidden md:flex flex-col items-center h-full py-6 bg-bg-primary">
        {/* Logo */}
        <div className="mb-6 p-2 hover:scale-105 transition-transform text-icon-active">
          <Link href="/" aria-label="Threads Home">
            <ThreadsLogo size={36} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          <NavItem href="/" icon={HomeIcon} isActive={pathname === "/"} />
          <NavItem href="/search" icon={SearchIcon} isActive={pathname === "/search"} />

          <button
            onClick={handleCreateClick}
            className="group p-4 rounded-2xl transition-all duration-200 text-[#4d4d4d] hover:bg-hover hover:text-text-primary"
            aria-label="Create Post"
          >
            <div className="transition-transform duration-200 group-active:scale-90">
              <CreateIcon />
            </div>
          </button>

          <NavItem href="/activity" icon={HeartIcon} isActive={pathname === "/activity"} requiresAuth />
          <NavItem
            href={user ? `/@${user.username}` : "/login"}
            icon={ProfileIcon}
            isActive={pathname.startsWith("/@")}
            requiresAuth
          />
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col items-center gap-4 pb-4 w-full px-2">
          <button className="group p-4 rounded-2xl text-[#4d4d4d] hover:bg-hover hover:text-text-primary transition-all duration-200" aria-label="Pinned Threads">
            <div className="transition-transform duration-200 group-active:scale-90">
              <PinIcon filled={false} />
            </div>
          </button>

          <button className="group p-4 rounded-2xl text-[#4d4d4d] hover:bg-hover hover:text-text-primary transition-all duration-200" aria-label="More">
            <div className="transition-transform duration-200 group-active:scale-90">
              <MenuIcon />
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-bg-primary/80 backdrop-blur-xl flex items-center justify-around px-2 z-50 border-t border-border/10">
        <NavItem href="/" icon={HomeIcon} isActive={pathname === "/"} />
        <NavItem href="/search" icon={SearchIcon} isActive={pathname === "/search"} />
        <button
          onClick={handleCreateClick}
          className="p-4 text-[#4d4d4d] hover:text-text-primary transition-colors active:scale-90"
        >
          <CreateIcon />
        </button>
        <NavItem href="/activity" icon={HeartIcon} isActive={pathname === "/activity"} requiresAuth />
        <NavItem
          href={user ? `/@${user.username}` : "/login"}
          icon={ProfileIcon}
          isActive={pathname.startsWith("/@")}
          requiresAuth
        />
      </nav>
    </>
  );
}
