"use client";

import React from "react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon,
  LogOut,
  AlertCircle,
  ChevronRight,
  Monitor
} from "lucide-react";

interface SettingsMenuProps {
  variant?: "popover" | "inline";
  onClose?: () => void;
  className?: string;
}

export function SettingsMenu({ variant = "popover", onClose, className }: SettingsMenuProps) {
  const { theme, setTheme } = useTheme();
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
    if (onClose) onClose();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const menuItems = [
    {
      label: "Appearance",
      icon: theme === "dark" ? Moon : Sun,
      onClick: toggleTheme,
      rightElement: (
        <span className="text-xs font-medium text-muted-foreground capitalize">
          {theme}
        </span>
      )
    },
    {
      label: "Report a problem",
      icon: AlertCircle,
      onClick: () => {
        // Implement report logic
        if (onClose) onClose();
      }
    },
    {
      label: "Log out",
      icon: LogOut,
      onClick: handleLogout,
      className: "text-destructive hover:text-destructive hover:bg-destructive/10"
    }
  ];

  if (variant === "inline") {
    return (
      <div className={cn("w-full divide-y divide-border/50", className)}>
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            className={cn(
              "w-full flex items-center justify-between px-4 py-4 transition-all active:bg-secondary/50 hover:bg-secondary/30",
              item.className
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} strokeWidth={2} />
              <span className="font-semibold text-[15px]">{item.label}</span>
            </div>
            {item.rightElement || <ChevronRight size={18} className="text-muted-foreground/50" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-hidden transition-all mx-4", className)}>
      <div className="space-y-0.5">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.onClick}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary/80",
              "border-b border-border/50 last:border-0",
              item.className
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} strokeWidth={2.2} />
              <span>{item.label}</span>
            </div>
            {item.rightElement}
          </button>
        ))}
      </div>
    </div>
  );
}
