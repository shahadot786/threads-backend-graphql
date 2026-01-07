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
  const isLoading = useAuthStore(state => state.isLoading);

  return (
    <div className="min-h-screen bg-background flex justify-center selection:bg-primary selection:text-primary-foreground">
      {/* Container limiting max width of the entire app */}
      <div className="flex w-full max-w-[1230px] relative">
        <Sidebar />

        {/* Center Column: Main Content */}
        <main className={cn(
          "flex-1 w-full min-w-0 min-h-screen border-r border-border md:border-x",
          "max-w-[640px] mx-auto bg-background shadow-sm pb-20 md:pb-0"
        )}>
          {children}
        </main>

        {/* Right Column: Auth Card / Extras (Sticky) */}
        <div className={cn(
          "hidden lg:block w-[380px] flex-shrink-0 pl-10",
          !showAuthCard && "hidden"
        )}>
          {/* Only render if we want to show it */}
          {!isAuthenticated && !isLoading && showAuthCard && (
            <div className="sticky top-5 pt-10">
              <AuthCard />
            </div>
          )}
        </div>

      </div>

      {/* Global Modals */}
      <LoginModal />
    </div>
  );
}
