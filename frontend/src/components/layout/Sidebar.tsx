"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { cn } from "@/lib/utils";

// SVG Icons
const HomeIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    {filled ? (
      <path d="M12 2L3 12h3v9h5v-6h2v6h5v-9h3L12 2z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    )}
  </svg>
);

const SearchIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const CreateIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const ProfileIcon = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ThreadsLogo = () => (
  <svg viewBox="0 0 192 192" width="32" height="32" fill="currentColor" className="text-icon">
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C120.037 17.1123 137.564 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

interface NavItemProps {
  href: string;
  icon: (props: { filled: boolean }) => React.ReactNode;
  isActive: boolean;
  requiresAuth?: boolean;
}

function NavItem({ href, icon: Icon, isActive, requiresAuth }: NavItemProps) {
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
        "p-3 rounded-lg transition-colors",
        isActive ? "text-icon" : "text-text-secondary hover:text-icon hover:bg-hover"
      )}
    >
      <Icon filled={isActive} />
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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[76px] flex-col items-center py-4 border-r border-border bg-bg-primary z-40">
        {/* Logo */}
        <div className="mb-4 p-3">
          <ThreadsLogo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-2 mt-4">
          <NavItem href="/" icon={HomeIcon} isActive={pathname === "/"} />
          <NavItem href="/search" icon={SearchIcon} isActive={pathname === "/search"} />

          <button
            onClick={handleCreateClick}
            className="p-3 rounded-lg text-text-secondary hover:text-icon hover:bg-hover transition-colors"
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

        {/* Bottom menu icon */}
        <div className="mt-auto p-3">
          <button className="p-2 rounded-lg text-text-secondary hover:text-icon hover:bg-hover transition-colors">
            <MenuIcon />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-bg-primary border-t border-border flex items-center justify-around z-50">
        <NavItem href="/" icon={HomeIcon} isActive={pathname === "/"} />
        <NavItem href="/search" icon={SearchIcon} isActive={pathname === "/search"} />
        <button
          onClick={handleCreateClick}
          className="p-3 text-text-secondary hover:text-icon transition-colors"
        >
          <CreateIcon />
        </button>
        <NavItem href="/activity" icon={HeartIcon} isActive={pathname === "/activity"} requiresAuth />
        <NavItem
          href={user ? `/${user.username}` : "/login"}
          icon={ProfileIcon}
          isActive={pathname.startsWith("/") && !pathname.startsWith("/search") && !pathname.startsWith("/activity") && !pathname.startsWith("/login") && !pathname.startsWith("/register") && pathname !== "/"}
          requiresAuth
        />
      </nav>
    </>
  );
}
