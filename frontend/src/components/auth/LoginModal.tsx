"use client";

import React from "react";
import { useUIStore } from "@/stores/ui";
import { LoginForm } from "./LoginForm";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export function LoginModal() {
  const isOpen = useUIStore(state => state.isLoginModalOpen);
  const closeLoginModal = useUIStore(state => state.closeLoginModal);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeLoginModal()}>
      <DialogContent className="sm:max-w-[420px] p-0 border-border/30 rounded-[32px] overflow-hidden bg-background shadow-2xl">
        <div className="p-8 pb-12 relative animate-scale-in">
          <LoginForm onSuccess={closeLoginModal} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
