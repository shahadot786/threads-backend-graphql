"use client";

import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface MediaItem {
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO" | "GIF";
}

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex: number;
}

export function MediaLightbox({ isOpen, onClose, media, initialIndex }: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update current index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const currentMedia = media[currentIndex];

  if (!mounted || !isOpen || !currentMedia) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Helper to close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full z-50 hover:bg-white/20 transition-all"
      >
        <X size={24} />
      </button>

      {/* Navigation */}
      {media.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full z-50 hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full z-50 hover:bg-white/20 transition-all"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Content Container - Stops propagation to prevent closing when clicking content */}
      <div
        className="w-full h-full flex items-center justify-center p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {currentMedia.mediaType === "IMAGE" || currentMedia.mediaType === "GIF" ? (
          <img
            src={currentMedia.mediaUrl}
            className="max-w-full max-h-full object-contain shadow-2xl"
            alt="Full screen view"
          />
        ) : (
          <video
            src={currentMedia.mediaUrl}
            controls
            className="max-w-full max-h-full shadow-2xl"
            autoPlay
          />
        )}
      </div>
    </div>,
    document.body
  );
}
