"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { X } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-card shadow-lg rounded-[32px] p-2 border border-border/50 relative">
        <Link
          href="/"
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors z-10"
        >
          <X size={24} />
        </Link>
        <RegisterForm />
      </div>
    </div>
  );
}
