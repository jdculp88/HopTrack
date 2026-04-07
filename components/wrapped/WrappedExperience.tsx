"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Share2, Check, X } from "lucide-react";
import type { WrappedStats } from "@/lib/wrapped";
import { getShareText, getWrappedColors } from "@/lib/wrapped";
import { WrappedIntro } from "./slides/WrappedIntro";
import { WrappedNumbers } from "./slides/WrappedNumbers";
import { WrappedTaste } from "./slides/WrappedTaste";
import { WrappedTopBrewery } from "./slides/WrappedTopBrewery";
import { WrappedTopBeer } from "./slides/WrappedTopBeer";
import { WrappedJourney } from "./slides/WrappedJourney";
import { WrappedBadge } from "./slides/WrappedBadge";

interface WrappedExperienceProps {
  stats: WrappedStats;
  username: string;
  onClose?: () => void;
  // Sprint 162 — The Identity: allow Your Round (weekly variant) to reuse this component
  variant?: "week" | "year" | "alltime";
  shareTitle?: string;
  shareUrl?: string;
  customShareText?: string;
  // Sprint 169 — The Details: week-over-week comparison
  previousStats?: WrappedStats;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
};

export function WrappedExperience({
  stats,
  username,
  onClose,
  variant = "year",
  shareTitle,
  shareUrl,
  customShareText,
  previousStats,
}: WrappedExperienceProps) {
  // variant reserved for future per-slide customization; suppress unused warning
  void variant;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [copied, setCopied] = useState(false);

  const colors = getWrappedColors(stats.topStyle?.style ?? null);

  // Build slide list based on available data
  const slides: Array<{ key: string; component: React.ReactNode }> = [];
  slides.push({ key: "intro", component: <WrappedIntro stats={stats} /> });
  slides.push({ key: "numbers", component: <WrappedNumbers stats={stats} previousStats={previousStats} /> });
  if (stats.topStyle) {
    slides.push({ key: "taste", component: <WrappedTaste stats={stats} /> });
  }
  if (stats.topBrewery) {
    slides.push({ key: "brewery", component: <WrappedTopBrewery stats={stats} /> });
  }
  if (stats.topBeer) {
    slides.push({ key: "beer", component: <WrappedTopBeer stats={stats} /> });
  }
  if (stats.citiesVisited.length > 0 || stats.adventurerScore > 0) {
    slides.push({ key: "journey", component: <WrappedJourney stats={stats} /> });
  }
  slides.push({ key: "badge", component: <WrappedBadge stats={stats} /> });

  const goNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(s => s + 1);
    }
  }, [currentSlide, slides.length]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(s => s - 1);
    }
  }, [currentSlide]);

  async function handleShare() {
    const resolvedShareText = customShareText ?? getShareText(stats, username);
    const resolvedTitle = shareTitle ?? "My HopTrack Wrapped";
    const resolvedUrl = shareUrl ?? "https://hoptrack.beer/wrapped";
    if (navigator.share) {
      try {
        await navigator.share({
          title: resolvedTitle,
          text: resolvedShareText,
          url: resolvedUrl,
        });
      } catch (_) {
        // cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(resolvedShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // ignore
    }
  }

  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  }

  return (
    <div
      className="relative w-full max-w-md mx-auto overflow-hidden rounded-2xl"
      style={{
        background: "#0F0E0C",
        border: "1px solid var(--border)",
        aspectRatio: "9/16",
        maxHeight: "85vh",
        "--wrap-c1": colors.c1,
        "--wrap-c2": colors.c2,
        "--wrap-c3": colors.c3,
      } as React.CSSProperties}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient gradient background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${colors.c1}, transparent 60%), radial-gradient(ellipse at 70% 80%, ${colors.c2}, transparent 60%)`,
        }}
      />

      {/* Floating sparkle particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              background: "#D4A843",
              left: `${8 + (i * 7.5) % 84}%`,
              top: `${10 + (i * 13) % 80}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 2.5 + (i % 3) * 0.8,
              delay: i * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full transition-opacity hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Close Wrapped"
        >
          <X size={16} style={{ color: "#E8D5A3" }} />
        </button>
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3">
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            className="h-0.5 flex-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={false}
              animate={{ width: i <= currentSlide ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
              style={{ background: "var(--accent-gold)" }}
            />
          </div>
        ))}
      </div>

      {/* Slide content */}
      <div className="relative w-full h-full flex items-center justify-center p-6 pt-10 pb-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slides[currentSlide].key}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={springTransition}
            className="w-full"
          >
            {slides[currentSlide].component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={goPrev}
          disabled={currentSlide === 0}
          className="p-2.5 rounded-full transition-opacity disabled:opacity-20"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} style={{ color: "#E8D5A3" }} />
        </button>

        {/* Share button (visible on last slide or always) */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
          style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
          aria-label="Share your Wrapped"
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? "Copied!" : "Share"}
        </button>

        <button
          onClick={goNext}
          disabled={currentSlide === slides.length - 1}
          className="p-2.5 rounded-full transition-opacity disabled:opacity-20"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Next slide"
        >
          <ChevronRight size={16} style={{ color: "#E8D5A3" }} />
        </button>
      </div>

      {/* Tap zones for mobile */}
      <div className="absolute inset-0 z-[5] flex" aria-hidden>
        <div className="w-1/3 h-full" onClick={goPrev} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full" onClick={goNext} />
      </div>
    </div>
  );
}
