"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] w-full px-4 animate-fade-in bg-background">
      <div className="w-full max-w-[420px] bg-card rounded-3xl shadow-lg p-1">
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
