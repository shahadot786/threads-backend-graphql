"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { cn } from "@/lib/utils";
import { ThreadsLogo } from "@/components/ui/Logo";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  Pin,
  Menu
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  isActive: boolean;
  requiresAuth?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function NavItem({ href, icon: Icon, isActive, requiresAuth, className, onClick }: NavItemProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const openLoginModal = useUIStore(state => state.openLoginModal);

  const handleClick = (e: React.MouseEvent) => {
    if (requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openLoginModal();
    }
    if (onClick) onClick(e);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300",
        isActive
          ? "bg-secondary text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
        className
      )}
    >
      <Icon
        size={26}
        strokeWidth={isActive ? 2.5 : 2}
        className={cn("transition-transform duration-300 group-active:scale-90")}
      />
      {isActive && (
        <span className="absolute left-[-2px] w-1 h-6 bg-primary rounded-r-full hidden md:block" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const openCreatePost = useUIStore(state => state.openCreatePost);
  const openLoginModal = useUIStore(state => state.openLoginModal);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      openCreatePost();
    } else {
      openLoginModal();
    }
  };

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="hidden md:flex flex-col items-center py-8 w-20 flex-shrink-0 sticky top-0 h-screen bg-background border-r border-border z-40">
        {/* Logo */}
        <div className="mb-8 p-1 hover:scale-110 transition-transform cursor-pointer">
          <Link href="/" aria-label="Threads Home">
            <ThreadsLogo size={32} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2">
          <NavItem href="/" icon={Home} isActive={pathname === "/"} />
          <NavItem href="/search" icon={Search} isActive={pathname === "/search"} />

          <button
            onClick={handleCreateClick}
            className="group flex items-center justify-center p-3 rounded-xl transition-all duration-300 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            aria-label="Create Post"
          >
            <PlusSquare size={26} strokeWidth={2} className="transition-transform duration-300 group-active:scale-90" />
          </button>

          <NavItem href="/activity" icon={Heart} isActive={pathname === "/activity"} requiresAuth />
          <NavItem
            href={user ? `/@${user.username}` : "/login"}
            icon={User}
            isActive={pathname.startsWith("/@")}
            requiresAuth
          />
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col items-center gap-2 pb-2 w-full px-2">
          <ThemeToggle />

          <button className="p-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-300" aria-label="Pinned Threads">
            <Pin size={24} />
          </button>

          <button className="p-3 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-300" aria-label="More">
            <Menu size={24} />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-xl flex items-center justify-around px-4 z-50 border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)]">
        <NavItem href="/" icon={Home} isActive={pathname === "/"} />
        <NavItem href="/search" icon={Search} isActive={pathname === "/search"} />

        <button
          onClick={handleCreateClick}
          className="p-3 text-muted-foreground hover:text-foreground transition-colors active:scale-90"
        >
          <PlusSquare size={26} />
        </button>

        <NavItem href="/activity" icon={Heart} isActive={pathname === "/activity"} requiresAuth />

        <NavItem
          href={user ? `/@${user.username}` : "/login"}
          icon={User}
          isActive={pathname.startsWith("/@")}
          requiresAuth
        />
      </nav>
    </>
  );
}
