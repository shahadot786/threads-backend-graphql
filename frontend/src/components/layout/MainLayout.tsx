"use client";

import { Sidebar } from "./Sidebar";
import { AuthCard } from "./AuthCard";
import { useAuthStore } from "@/stores/auth";

interface MainLayoutProps {
  children: React.ReactNode;
  showAuthCard?: boolean;
}

export function MainLayout({ children, showAuthCard = true }: MainLayoutProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="md:ml-[76px] min-h-screen">
        <div className="max-w-[640px] mx-auto border-x border-border min-h-screen">
          {children}
        </div>
      </main>

      {/* Right Sidebar - Auth Card (only for guests) */}
      {showAuthCard && !isAuthenticated && <AuthCard />}
    </div>
  );
}
