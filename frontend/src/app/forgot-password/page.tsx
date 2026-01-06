"use client";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-card shadow-lg rounded-[32px] p-2 border border-border/50">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
