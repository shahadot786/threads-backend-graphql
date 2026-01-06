"use client";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
