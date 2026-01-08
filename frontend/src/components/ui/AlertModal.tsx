"use client";

import { useUIStore } from "@/stores/ui";
import { X, AlertCircle } from "lucide-react";

export function AlertModal() {
  const { isAlertModalOpen, alertModal, closeAlert } = useUIStore();

  if (!isAlertModalOpen || !alertModal) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAlert();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">{alertModal.title}</h2>
          </div>
          <button
            onClick={closeAlert}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-foreground text-sm">{alertModal.message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-border">
          <button
            onClick={closeAlert}
            className="px-6 py-2 bg-foreground text-background font-semibold rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
