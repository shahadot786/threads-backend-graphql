import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThreadsLogo } from "@/components/ui/Logo";
import { RESET_PASSWORD_MUTATION } from "@/graphql/mutations/auth";

export default function ResetPasswordPage() {
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
      <div className="min-h-screen bg-[#101010] flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] text-center animate-in fade-in zoom-in duration-300">
          <div className="mb-6 p-4 bg-white/5 rounded-full inline-block">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[24px] font-bold text-white mb-2">Password changed</h2>
          <p className="text-[#777777] text-[15px] mb-8">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <Button
            onClick={() => window.location.href = "/login"}
            className="premium-button"
          >
            Log in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101010] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in duration-300">
        <div className="mb-10 text-center">
          <ThreadsLogo size={60} className="mx-auto mb-4" />
          <h1 className="text-[24px] font-bold text-white mb-1">Create a strong password</h1>
          <p className="text-[#777777] text-[15px]">
            Your password must be at least 8 characters long.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="premium-input bg-[#1e1e1e] border-none py-4 px-4 text-[15px] focus:ring-1 focus:ring-white/10 placeholder:text-[#4d4d4d] w-full rounded-2xl"
            required
            minLength={8}
          />
          <input
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="premium-input bg-[#1e1e1e] border-none py-4 px-4 text-[15px] focus:ring-1 focus:ring-white/10 placeholder:text-[#4d4d4d] w-full rounded-2xl"
            required
            minLength={8}
          />

          <Button
            type="submit"
            disabled={status === "loading"}
            className="premium-button mt-2"
          >
            {status === "loading" ? "Updating..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
