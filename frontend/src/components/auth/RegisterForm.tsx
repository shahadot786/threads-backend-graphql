"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
    <div className="flex flex-col items-center w-full max-w-[370px] mx-auto animate-scale-in">
      <div className="mb-10 mt-4 text-center">
        <ThreadsLogo size={60} className="mx-auto mb-4" />
        <h1 className="text-[20px] font-bold text-foreground mb-1">Create your account</h1>
        <p className="text-muted-foreground text-[15px]">Join the conversation today</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        {error && (
          <div className="text-destructive text-sm mb-4 text-center animate-fade-in">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <Input
          type="text"
          placeholder="Username (optional)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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
          isLoading={registerLoading || loginLoading}
          className="mt-4 w-full h-[56px] font-bold"
        >
          Sign Up
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-2 text-[14px]">
        <span className="text-muted-foreground">Already have an account?</span>
        <button
          onClick={() => window.location.href = "/login"}
          className="text-foreground font-bold hover:underline"
        >
          Log in
        </button>
      </div>
    </div>
  );
}
