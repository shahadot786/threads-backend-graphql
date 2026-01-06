"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AuthCard() {
  return (
    <div className="hidden lg:block fixed right-8 top-20 w-80">
      <div className="bg-bg-secondary rounded-2xl border border-border p-6">
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Log in or sign up for Threads
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          See what people are talking about and join the conversation.
        </p>

        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button variant="primary" className="w-full">
              Log in with username
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
