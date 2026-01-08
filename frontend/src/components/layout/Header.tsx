"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  className?: string;
  showBackButton?: boolean;
}

export function Header({ title = "Home", className, showBackButton }: HeaderProps) {
  const router = useRouter();

  return (
    <header className={cn(
      "sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4 relative">
        {/* Left side - Back button */}
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
          )}
        </div>

        {/* Center - Title */}
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-bold text-foreground">
          {title}
        </h1>

        {/* Right side - Theme toggle (mobile) */}
        <div className="flex items-center md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
