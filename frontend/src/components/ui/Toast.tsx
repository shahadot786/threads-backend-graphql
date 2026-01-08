"use client";

import { useUIStore } from "@/stores/ui";
import { X, CheckCircle } from "lucide-react";

export function Toast() {
  const { toastMessage, hideToast } = useUIStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 px-4 py-3 bg-foreground text-background rounded-xl shadow-lg border border-border/10">
        <CheckCircle size={18} className="text-green-400 shrink-0" />
        <span className="text-sm font-medium">{toastMessage}</span>
        <button
          onClick={hideToast}
          className="p-1 hover:opacity-70 transition-opacity shrink-0 -mr-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
