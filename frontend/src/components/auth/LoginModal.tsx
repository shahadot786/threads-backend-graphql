"use client";

import React from "react";
import { useUIStore } from "@/stores/ui";
import { LoginForm } from "./LoginForm";

export function LoginModal() {
  const isOpen = useUIStore(state => state.isLoginModalOpen);
  const closeLoginModal = useUIStore(state => state.closeLoginModal);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeLoginModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in px-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-[420px] bg-bg-primary border border-border/30 rounded-[32px] p-0 overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-8 pb-12 relative">
          <button
            onClick={closeLoginModal}
            className="absolute right-6 top-6 p-2 text-text-tertiary rounded-full hover:bg-hover hover:text-text-primary transition-all active:scale-90"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <LoginForm onSuccess={closeLoginModal} />
        </div>
      </div>
    </div>
  );
}
