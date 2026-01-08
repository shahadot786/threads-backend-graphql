"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] w-full px-4 animate-fade-in bg-background">
      <div className="w-full max-w-[420px] bg-card rounded-3xl shadow-lg p-1 relative">
        <Link
          href="/"
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
        >
          <X size={24} />
        </Link>
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
