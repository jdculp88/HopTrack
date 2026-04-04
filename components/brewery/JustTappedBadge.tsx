"use client";

import { motion } from "motion/react";

interface JustTappedBadgeProps {
  tappedAt: string | null;
}

/**
 * Gold pill badge with pulse animation for beers tapped within the last 2 hours.
 * Sprint 156 — The Triple Shot
 */
export function JustTappedBadge({ tappedAt }: JustTappedBadgeProps) {
  if (!tappedAt) return null;

  const tappedTime = new Date(tappedAt).getTime();
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

  if (tappedTime < twoHoursAgo) return null;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider"
      style={{
        background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
        color: "var(--accent-gold)",
      }}
    >
      <motion.span
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--accent-gold)" }}
      />
      Just Tapped
    </motion.span>
  );
}
