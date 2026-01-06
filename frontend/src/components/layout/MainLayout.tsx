"use client";

import { Sidebar } from "./Sidebar";
import { AuthCard } from "./AuthCard";
import { useAuthStore } from "@/stores/auth";
import { LoginModal } from "@/components/auth/LoginModal";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  showAuthCard?: boolean;
}

export function MainLayout({ children, showAuthCard = true }: MainLayoutProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-bg-primary flex justify-center">
      {/* Container limiting max width of the entire app */}
      <div className="flex w-full max-w-[1230px] relative">

        {/* Left Column: Sidebar (Sticky) */}
        <div className="hidden md:flex flex-col w-[76px] flex-shrink-0 z-40">
          <div className="sticky top-0 h-screen flex flex-col">
            <Sidebar />
          </div>
        </div>

        {/* Center Column: Main Content */}
        <main className={cn(
          "flex-1 w-full min-w-0 min-h-screen border-r border-border md:border-x",
          "max-w-[640px] mx-auto"
        )}>
          {children}
        </main>

        {/* Right Column: Auth Card / Extras (Sticky) */}
        <div className={cn(
          "hidden lg:block w-[380px] flex-shrink-0 pl-8",
          !showAuthCard && "hidden"
        )}>
          {/* Only render if we want to show it */}
          {!isAuthenticated && showAuthCard && (
            <div className="sticky top-5 pt-5">
              <AuthCard />
            </div>
          )}
        </div>

      </div>

      {/* Mobile Nav */}
      <div className="md:hidden">
        <Sidebar />
      </div>

      {/* Global Modals */}
      <LoginModal />
    </div>
  );
}
