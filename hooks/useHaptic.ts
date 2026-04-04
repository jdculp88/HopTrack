// Centralized Haptic Feedback Hook — Sprint 154 (The Native Feel)
// Owner: Alex (UI/UX Designer + Mobile Lead)
//
// Named presets for consistent tactile feedback across the app.
// Respects prefers-reduced-motion and non-supporting browsers.

"use client";

import { useCallback, useRef, useEffect } from "react";

/** Vibration patterns (milliseconds) */
const PATTERNS = {
  /** Light tap — nav switches, toggle, selection (10ms) */
  tap: [10],
  /** Medium press — button confirm, check-in action (15ms) */
  press: [15],
  /** Short selection feedback (5ms) */
  selection: [5],
  /** Success — achievement, session end, reward (double pulse) */
  success: [10, 50, 20],
  /** Error — validation fail, denied action (sharp triple) */
  error: [30, 30, 30],
  /** Celebration — level up, achievement unlock (rising pattern) */
  celebration: [10, 30, 15, 30, 25],
} as const;

export type HapticPreset = keyof typeof PATTERNS;

export function useHaptic() {
  const reducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const haptic = useCallback((preset: HapticPreset = "tap") => {
    if (reducedMotion.current) return;
    if (typeof navigator === "undefined" || !navigator.vibrate) return;
    navigator.vibrate(PATTERNS[preset]);
  }, []);

  return { haptic };
}
