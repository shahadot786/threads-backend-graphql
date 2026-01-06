import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThreadsLogo } from "@/components/ui/Logo";
import { LOGIN_MUTATION } from "@/graphql/mutations/auth";
import { useAuthStore } from "@/stores/auth";

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const setLogin = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loginMutation, { loading }] = useMutation<{ login: { user: any; accessToken: string } }>(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await loginMutation({
        variables: { email, password },
      });

      if (data?.login?.user) {
        setLogin(data.login.user);
        onSuccess?.();
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[370px] mx-auto">
      {/* Centered Logo */}
      <div className="mb-10 mt-4">
        <ThreadsLogo size={60} />
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {error && (
          <div className="text-red-500 text-sm mb-4 text-center animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}
        <div>
          <input
            type="text"
            placeholder="Username, phone or email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="premium-input bg-[#1e1e1e] border-none py-4 px-4 text-[15px] focus:ring-1 focus:ring-white/10 placeholder:text-[#4d4d4d] w-full rounded-2xl"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="premium-input bg-[#1e1e1e] border-none py-4 px-4 text-[15px] focus:ring-1 focus:ring-white/10 placeholder:text-[#4d4d4d] w-full rounded-2xl"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="premium-button mt-2"
        >
          Log in
        </Button>
      </form>

      {/* Footer links */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={() => window.location.href = "/forgot-password"}
          className="text-[14px] text-[#777777] hover:underline font-normal"
        >
          Forgot password?
        </button>

        <div className="flex items-center gap-2 text-[14px]">
          <span className="text-[#777777]">Don't have an account?</span>
          <button
            onClick={() => window.location.href = "/register"}
            className="text-white font-bold hover:underline"
          >
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
}
