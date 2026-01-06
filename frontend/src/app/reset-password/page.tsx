"use client";

import React, { useState, Suspense } from "react";
import { useMutation } from "@apollo/client/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThreadsLogo } from "@/components/ui/Logo";
import { RESET_PASSWORD_MUTATION } from "@/graphql/mutations/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const [resetPasswordMutation] = useMutation(RESET_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Reset token is missing");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      await resetPasswordMutation({
        variables: { token, newPassword: password },
      });
      setStatus("success");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-[400px] text-center animate-scale-in">
        <div className="mb-6 p-4 bg-muted rounded-full inline-block">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-[24px] font-bold text-foreground mb-2">Password changed</h2>
        <p className="text-muted-foreground text-[15px] mb-8">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <Button
          onClick={() => window.location.href = "/login"}
          className="w-full h-[56px] font-bold"
        >
          Log in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] animate-scale-in">
      <div className="mb-10 text-center">
        <ThreadsLogo size={60} className="mx-auto mb-4" />
        <h1 className="text-[24px] font-bold text-foreground mb-1">Create a strong password</h1>
        <p className="text-muted-foreground text-[15px]">
          Your password must be at least 8 characters long.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div className="text-destructive text-sm mb-4 text-center animate-fade-in">
            {error}
          </div>
        )}

        <Input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Input
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />

        <Button
          type="submit"
          isLoading={status === "loading"}
          className="mt-2 w-full h-[56px] font-bold"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
