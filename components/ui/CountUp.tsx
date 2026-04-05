"use client";

// CountUp — Sprint 162 (The Identity)
// Animates a numeric value from 0 to target on mount. Respects prefers-reduced-motion.
// Used by StatsTab, Your Round slides, and any surface that wants a count-up reveal.

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

type CountUpProps = {
  value: number;
  duration?: number; // seconds (default 1.2)
  delay?: number; // seconds (default 0)
  decimals?: number; // digits after decimal (default 0)
  suffix?: string; // e.g. "%", " beers"
  prefix?: string; // e.g. "+", "$"
  formatter?: (value: number) => string; // overrides default formatting
  className?: string;
  /** If true, only starts counting when element enters viewport */
  triggerOnInView?: boolean;
};

/**
 * Animated count-up from 0 → target value.
 * - Respects prefers-reduced-motion (shows final value immediately).
 * - Uses easeOut curve for natural deceleration.
 * - Formats via Intl.NumberFormat by default (locale-aware, adds thousand separators).
 */
export function CountUp({
  value,
  duration = 1.2,
  delay = 0,
  decimals = 0,
  suffix = "",
  prefix = "",
  formatter,
  className,
  triggerOnInView = false,
}: CountUpProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [display, setDisplay] = useState<number>(
    reducedMotion ? value : 0,
  );

  const shouldAnimate = triggerOnInView ? inView : true;

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    if (!shouldAnimate) return;

    let rafId: number;
    let startTime: number | null = null;
    let delayTimeout: ReturnType<typeof setTimeout> | null = null;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    };

    delayTimeout = setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      if (delayTimeout) clearTimeout(delayTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, duration, delay, reducedMotion, shouldAnimate]);

  const formatted = formatter
    ? formatter(display)
    : display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
