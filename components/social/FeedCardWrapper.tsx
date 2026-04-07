"use client";

import { motion } from "motion/react";
import { spring } from "@/lib/animation";

/**
 * Feed card wrapper — Sprint 134 (The Tidy)
 *
 * Replaces the identical motion.div + accent bar + icon column pattern
 * duplicated across 9 feed card components.
 *
 * @example
 * <FeedCardWrapper
 *   accentColor="var(--accent-gold)"
 *   icon={<MapPin size={22} strokeWidth={1.75} />}
 *   ariaLabel="John visited Pint & Pixel"
 * >
 *   <div className="px-4 py-3">...card content...</div>
 * </FeedCardWrapper>
 */
interface FeedCardWrapperProps {
  /** Accent bar & icon tint color (CSS value) */
  accentColor?: string;
  /** Icon displayed in the left column */
  icon: React.ReactNode;
  /** Accessible label for the card */
  ariaLabel?: string;
  /** Optional card-bg class (e.g., card-bg-achievement) */
  bgClass?: string;
  /** Custom background gradient (overrides default) */
  backgroundStyle?: React.CSSProperties;
  /** Optional data-* attributes */
  dataTier?: string;
  children: React.ReactNode;
  className?: string;
}

export function FeedCardWrapper({
  accentColor = "var(--accent-gold)",
  icon,
  ariaLabel,
  bgClass,
  backgroundStyle,
  dataTier,
  children,
  className,
}: FeedCardWrapperProps) {
  const defaultBg: React.CSSProperties = {
    background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 7%, var(--surface)), var(--surface))`,
    border: `1px solid color-mix(in srgb, ${accentColor} 18%, var(--border))`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={spring.default}
      role="article"
      aria-label={ariaLabel}
      className={`rounded-[14px] overflow-hidden flex relative ${bgClass ?? ""} ${className ?? ""}`}
      style={backgroundStyle ?? defaultBg}
      data-tier={dataTier}
    >
      {/* Accent bar */}
      <div
        className="w-1 flex-shrink-0"
        style={{ background: accentColor, opacity: 0.7 }}
      />

      {/* Icon column */}
      <div
        className="w-14 flex-shrink-0 flex items-center justify-center"
        style={{
          background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
        }}
      >
        <span style={{ color: accentColor }}>{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </motion.div>
  );
}
