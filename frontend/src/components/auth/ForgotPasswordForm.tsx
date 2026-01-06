import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/Button";
import { ThreadsLogo } from "@/components/ui/Logo";
import { FORGOT_PASSWORD_MUTATION } from "@/graphql/mutations/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const [forgotPasswordMutation] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await forgotPasswordMutation({
        variables: { email },
      });
      setStatus("success");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center w-full max-w-[370px] mx-auto text-center animate-in fade-in zoom-in duration-300">
        <div className="mb-6 p-4 bg-white/5 rounded-full">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-white mb-2">Check your email</h2>
        <p className="text-[#777777] text-[15px] mb-8">
          We've sent a link to reset your password to <span className="text-white font-medium">{email}</span>.
        </p>
        <Button
          onClick={() => window.location.href = "/login"}
          className="premium-button"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[370px] mx-auto animate-in fade-in zoom-in duration-300">
      <div className="mb-10 mt-4 text-center">
        <ThreadsLogo size={60} className="mx-auto mb-4" />
        <h1 className="text-[20px] font-bold text-white mb-1">Trouble logging in?</h1>
        <p className="text-[#777777] text-[15px]">
          Enter your email and we'll send you a link to get back into your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="premium-input bg-[#1e1e1e] border-none py-4 px-4 text-[15px] focus:ring-1 focus:ring-white/10 placeholder:text-[#4d4d4d] w-full rounded-2xl"
          required
        />

        <Button
          type="submit"
          disabled={status === "loading"}
          className="premium-button mt-2"
        >
          {status === "loading" ? "Sending..." : "Send Login Link"}
        </Button>
      </form>

      <div className="mt-10 pt-6 border-t border-white/5 w-full text-center">
        <button
          onClick={() => window.location.href = "/login"}
          className="text-white font-bold text-[14px] hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
