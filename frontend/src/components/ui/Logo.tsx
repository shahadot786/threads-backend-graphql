import React from "react";

export const ThreadsLogo = ({ className = "", size = 32 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 100 100"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label="Threads Clone"
  >
    {/* Outer circle */}
    <circle cx="50" cy="50" r="40" strokeWidth="5" />

    {/* Inner @ symbol */}
    <circle cx="50" cy="50" r="18" strokeWidth="4" />
    <path d="M 50 32 C 68 32 68 50 68 50 C 68 58 62 68 50 68" strokeWidth="4" />

    {/* Needle line */}
    <line x1="20" y1="80" x2="80" y2="20" strokeWidth="4" />

    {/* Needle eye */}
    <circle cx="80" cy="20" r="5" strokeWidth="2" />
  </svg>
);
