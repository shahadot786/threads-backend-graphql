"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <svg
        className={`animate-spin ${sizeClasses[size]} text-text-secondary`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="px-4 py-4 border-b border-border animate-pulse">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-bg-tertiary" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-4 w-24 bg-bg-tertiary rounded" />
            <div className="h-4 w-12 bg-bg-tertiary rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-bg-tertiary rounded" />
            <div className="h-4 w-3/4 bg-bg-tertiary rounded" />
          </div>
          <div className="flex gap-4 pt-2">
            <div className="h-4 w-8 bg-bg-tertiary rounded" />
            <div className="h-4 w-8 bg-bg-tertiary rounded" />
            <div className="h-4 w-8 bg-bg-tertiary rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
