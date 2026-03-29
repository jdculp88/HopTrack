"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SessionPhotosProps {
  photos: Array<{ id: string; photo_url: string }>;
}

export function SessionPhotos({ photos }: SessionPhotosProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) return null;

  const showNav = photos.length > 1;

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={photos[activeIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Image
            src={photos[activeIndex].photo_url}
            alt=""
            fill
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {showNav && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity"
            style={{
              background: "color-mix(in srgb, var(--bg) 60%, transparent)",
              color: "var(--text-primary)",
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveIndex((i) => (i + 1) % photos.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-opacity"
            style={{
              background: "color-mix(in srgb, var(--bg) 60%, transparent)",
              color: "var(--text-primary)",
            }}
            aria-label="Next photo"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {showNav && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background:
                  i === activeIndex
                    ? "var(--accent-gold)"
                    : "color-mix(in srgb, var(--text-primary) 30%, transparent)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
