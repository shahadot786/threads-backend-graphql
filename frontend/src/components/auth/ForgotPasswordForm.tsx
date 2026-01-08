import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThreadsLogo } from "@/components/ui/Logo";
import { supabase } from "@/lib/supabase";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });

      if (authError) throw authError;

      setStatus("success");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center w-full max-w-[370px] mx-auto text-center animate-scale-in">
        <div className="mb-6 p-4 bg-muted rounded-full">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-foreground mb-2">Check your email</h2>
        <p className="text-muted-foreground text-[15px] mb-8">
          We've sent a link to reset your password to <span className="text-foreground font-medium">{email}</span>.
        </p>
        <Button
          onClick={() => window.location.href = "/login"}
          className="w-full h-[56px] font-bold"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[370px] mx-auto animate-scale-in">
      <div className="mb-10 mt-4 text-center">
        <ThreadsLogo size={60} className="mx-auto mb-4" />
        <h1 className="text-[20px] font-bold text-foreground mb-1">Trouble logging in?</h1>
        <p className="text-muted-foreground text-[15px]">
          Enter your email and we'll send you a link to get back into your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {error && (
          <div className="text-destructive text-sm mb-4 text-center animate-fade-in">
            {error}
          </div>
        )}

        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          type="submit"
          isLoading={status === "loading"}
          className="mt-2 w-full h-[56px] font-bold"
        >
          Send Login Link
        </Button>
      </form>

      <div className="mt-10 pt-6 border-t border-border w-full text-center">
        <button
          onClick={() => window.location.href = "/login"}
          className="text-foreground font-bold text-[14px] hover:underline transition-all"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
