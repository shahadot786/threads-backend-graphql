"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const currentMedia = media[currentIndex];

  if (!currentMedia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 border-none bg-black/95 flex items-center justify-center overflow-hidden focus:outline-none">

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

        <div className="w-full h-full flex items-center justify-center p-4">
          {currentMedia.mediaType === "IMAGE" ? (
            <img
              src={currentMedia.mediaUrl}
              className="max-w-full max-h-full object-contain"
              alt="Full screen view"
            />
          ) : (
            <video
              src={currentMedia.mediaUrl}
              controls
              className="max-w-full max-h-full"
              autoPlay
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
