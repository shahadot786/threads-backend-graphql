"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThreadsLogo } from "@/components/ui/Logo";
import { REGISTER_MUTATION, LOGIN_MUTATION } from "@/graphql/mutations/auth";
import { useAuthStore } from "@/stores/auth";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const setLogin = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const [registerMutation, { loading: registerLoading }] = useMutation<{ createUser: any }>(REGISTER_MUTATION);
  const [loginMutation, { loading: loginLoading }] = useMutation<{ login: { user: any; accessToken: string } }>(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await registerMutation({
        variables: {
          firstName,
          lastName: lastName || undefined,
          username: username || undefined,
          email,
          password,
        },
      });

      // Auto login after registration
      const { data } = await loginMutation({
        variables: { email, password },
      });

      if (data?.login?.user) {
        setLogin(data.login.user);
        onSuccess?.();
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[370px] mx-auto animate-in fade-in zoom-in duration-300">
      <div className="mb-10 mt-4 text-center">
        <ThreadsLogo size={60} className="mx-auto mb-4" />
        <h1 className="text-[20px] font-bold text-white mb-1">Create your account</h1>
        <p className="text-[#777777] text-[15px]">Join the conversation today</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {error && (
          <div className="text-red-500 text-sm mb-4 text-center">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="premium-input"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="premium-input"
          />
        </div>

        <input
          type="text"
          placeholder="Username (optional)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="premium-input"
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="premium-input"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="premium-input"
          required
        />

        <Button
          type="submit"
          isLoading={registerLoading || loginLoading}
          disabled={registerLoading || loginLoading}
          className="premium-button mt-4"
        >
          Sign Up
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-2 text-[14px]">
        <span className="text-[#777777]">Already have an account?</span>
        <button
          onClick={() => window.location.href = "/login"}
          className="text-white font-bold hover:underline"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
