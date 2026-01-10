import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThreadsLogo } from "@/components/ui/Logo";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data?.session) {
        onSuccess?.();
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[370px] mx-auto animate-scale-in">
      <div className="mb-10 mt-4">
        <ThreadsLogo size={60} />
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
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

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          isLoading={loading}
          className="mt-2 w-full h-[56px] font-bold"
        >
          Log in
        </Button>
      </form>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={() => window.location.href = "/forgot-password"}
          className="text-[14px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Forgot password?
        </button>

        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-muted-foreground">Don't have an account?</span>
          <button
            onClick={() => window.location.href = "/register"}
            className="text-foreground font-bold hover:underline"
          >
            Join Now
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-12 text-center text-xs text-muted-foreground">
        <span>Built by </span>
        <a
          href="https://github.com/shahadot786"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground/80 hover:text-foreground hover:underline transition-colors"
        >
          Shahadot Hossain
        </a>
        <span> • </span>
        <a
          href="https://github.com/shahadot786/threads-clone"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground/80 hover:text-foreground hover:underline transition-colors"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
