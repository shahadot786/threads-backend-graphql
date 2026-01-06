"use client";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ title = "Home", className }: { title?: string, className?: string }) {
  return (
    <header className={cn(
      "sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50",
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4 relative">
        <div className="w-12 h-12" /> {/* Spacer to center title */}
        <h1 className="text-base font-bold text-foreground">
          {title}
        </h1>
        <div className="flex items-center md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
