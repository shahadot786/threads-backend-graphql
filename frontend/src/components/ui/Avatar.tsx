"use client";

import { getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  firstName: string;
  lastName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

export function Avatar({ src, firstName, lastName, size = "md", className = "" }: AvatarProps) {
  const initials = getInitials(firstName, lastName);

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName}'s avatar`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-bg-tertiary flex items-center justify-center font-medium text-text-secondary ${className}`}
    >
      {initials}
    </div>
  );
}
