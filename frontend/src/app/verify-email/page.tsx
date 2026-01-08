"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/Button";
import { ThreadsLogo } from "@/components/ui/Logo";
import { supabase } from "@/lib/supabase";
import { REGISTER_MUTATION } from "@/graphql/mutations/auth";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "creating_profile" | "error">("loading");
  const [error, setError] = useState("");

  const [registerProfile] = useMutation(REGISTER_MUTATION);

  useEffect(() => {
    async function completeVerification() {
      try {
        // Get the current session (should be set by the callback route)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          // No session means verification might have failed
          setError("Email verification failed. Please try again.");
          setStatus("error");
          return;
        }

        // Check if user profile already exists by trying to get user data
        // If this is a new user (email just confirmed), we need to create their profile
        setStatus("creating_profile");

        try {
          // Try to create profile - this may fail if profile already exists
          await registerProfile({
            variables: {
              firstName: session.user.user_metadata?.firstName || session.user.email?.split("@")[0] || "User",
              lastName: session.user.user_metadata?.lastName || undefined,
              username: session.user.user_metadata?.username || undefined,
              email: session.user.email,
            },
            context: {
              headers: {
                authorization: `Bearer ${session.access_token}`,
              },
            },
          });
        } catch (err: any) {
          // Profile might already exist, that's okay
          console.log("[VERIFY] Profile creation:", err.message);
        }

        setStatus("success");
      } catch (err: any) {
        console.error("[VERIFY] Error:", err);
        setError(err.message || "Verification failed");
        setStatus("error");
      }
    }

    completeVerification();
  }, [registerProfile]);

  if (status === "loading" || status === "creating_profile") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] text-center animate-scale-in">
          <ThreadsLogo size={60} className="mx-auto mb-6" />
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-foreground font-medium">
              {status === "creating_profile" ? "Setting up your account..." : "Verifying your email..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] text-center animate-scale-in">
          <ThreadsLogo size={60} className="mx-auto mb-6" />
          <h2 className="text-xl font-bold text-foreground mb-2">Verification Failed</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => router.push("/login")}
            className="w-full h-[56px] font-bold"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] text-center animate-scale-in">
        <div className="mb-6 p-4 bg-green-500/10 rounded-full inline-block">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
        <p className="text-muted-foreground mb-8">
          Your email has been successfully verified. You can now access all features.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/")}
            className="w-full h-[56px] font-bold"
          >
            Continue to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="w-full h-[56px] font-bold"
          >
            Log in
          </Button>
        </div>
      </div>
    </div>
  );
}
