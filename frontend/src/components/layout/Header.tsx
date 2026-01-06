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
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-bold text-foreground">
          {title}
        </h1>
        <div className="ml-auto flex items-center md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
