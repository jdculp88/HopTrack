"use client";

// BreweryHeroShrink — Sprint 160 (The Flow)
// Adds scroll-linked darkening overlay + parallax on top of BreweryHeroSection.
// As user scrolls 0-240px, the hero fades into the page background for focus
// on the sticky tabs. Respects prefers-reduced-motion.

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function BreweryHeroShrink({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const overlayOpacity = useTransform(scrollY, [0, 240], [0, 0.75]);
  const heroY = useTransform(scrollY, [0, 240], [0, -30]);

  if (reducedMotion) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div className="relative">
      <motion.div style={{ y: heroY }}>{children}</motion.div>
      {/* Scroll-linked darkening overlay (non-interactive) */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "var(--bg)",
          opacity: overlayOpacity,
        }}
      />
    </div>
  );
}
