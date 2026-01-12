"use client";

import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ThreadsLogo } from "@/components/ui/Logo";
import { REGISTER_MUTATION } from "@/graphql/mutations/auth";
import { supabase } from "@/lib/supabase";

export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Profile creation mutation
  const [registerProfile] = useMutation<{ createUser: any }>(REGISTER_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      // 1. SignUp with Supabase - include redirect URL and user metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
          data: {
            firstName,
            lastName: lastName || undefined,
            username: username || undefined,
          },
        },
      });

      if (authError) throw authError;

      if (authData?.user) {
        // If email confirmation is enabled, session will be null
        if (!authData.session) {
          setSuccessMessage("Account created! Please check your email to confirm your account before logging in.");
          setLoading(false);
          return;
        }

        // 2. Create Profile in our DB via GraphQL
        // We explicitly pass the context to ensure the new token is used
        await registerProfile({
          variables: {
            firstName,
            lastName: lastName || undefined,
            username: username || undefined,
            email,
          },
          context: {
            headers: {
              authorization: `Bearer ${authData.session.access_token}`
            }
          }
        });

        onSuccess?.();
        router.push("/");
      }
    } catch (err: any) {
      console.error("[REGISTER] Error:", err);
      // Handle the case where user already exists in Supabase but profile creation failed last time
      if (err.message?.includes("User already registered")) {
        setError("This email is already registered. Please log in.");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="flex flex-col items-center w-full max-w-[370px] mx-auto text-center p-6 bg-card rounded-3xl animate-scale-in">
        <ThreadsLogo size={60} className="mb-6" />
        <h2 className="text-xl font-bold mb-4">Check your email</h2>
        <p className="text-muted-foreground mb-8">{successMessage}</p>
        <Button onClick={() => router.push("/login")} className="w-full h-[56px] font-bold">
          Back to Login
        </Button>
      </div>
    );
  }

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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          isLoading={loading}
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
