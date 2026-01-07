"use client";

import { Sidebar } from "./Sidebar";
import { AuthCard } from "./AuthCard";
import { useAuthStore } from "@/stores/auth";
import { LoginModal } from "@/components/auth/LoginModal";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { EditPostModal } from "@/components/post/EditPostModal";
import { ReplyModal } from "@/components/post/ReplyModal";
import { ReportProblemModal } from "@/components/common/ReportProblemModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { useUIStore } from "@/stores/ui";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  showAuthCard?: boolean;
}

export function MainLayout({ children, showAuthCard = true }: MainLayoutProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar - Pinned to Left */}
      <Sidebar />

      {/* Main Content Area - Centered in remaining space */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="flex w-full max-w-[1050px] relative">

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
      </div>

      {/* Global Modals */}
      <LoginModal />
      <EditProfileModal />
      <EditPostModal />
      <ReplyModal />
      <ReportProblemModal
        isOpen={useUIStore(state => state.isReportProblemOpen)}
        onClose={useUIStore(state => state.closeReportProblemModal)}
      />
      <AlertModal />
    </div>
  );
}
