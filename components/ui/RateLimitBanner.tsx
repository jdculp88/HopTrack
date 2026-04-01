"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";

interface RateLimitBannerProps {
  /** Seconds until retry is allowed (from Retry-After header) */
  retryAfterSeconds: number;
  /** Called when the countdown reaches zero */
  onReady?: () => void;
  /** Message to display above the countdown */
  message?: string;
}

/**
 * Banner shown when a 429 Too Many Requests response is received.
 * Shows a live countdown and calls onReady when the wait is over.
 */
export function RateLimitBanner({
  retryAfterSeconds,
  onReady,
  message = "You're moving a bit too fast.",
}: RateLimitBannerProps) {
  const [remaining, setRemaining] = useState(retryAfterSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(retryAfterSeconds);
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onReady?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [retryAfterSeconds, onReady]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 10%, var(--surface))",
          border: "1px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)",
        }}
        role="status"
        aria-live="polite"
        aria-label={`Rate limited. ${remaining} seconds remaining.`}
      >
        <Clock size={16} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
        <div className="flex-1">
          <span style={{ color: "var(--text-primary)" }}>{message}</span>
          {remaining > 0 && (
            <span style={{ color: "var(--text-muted)" }}>
              {" "}Try again in{" "}
              <span
                className="font-mono font-medium tabular-nums"
                style={{ color: "var(--accent-gold)" }}
              >
                {remaining}s
              </span>
            </span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Parse Retry-After header value to seconds.
 * Returns null if header is absent or invalid.
 */
export function parseRetryAfter(headers: Headers): number | null {
  const value = headers.get("Retry-After");
  if (!value) return null;
  const seconds = parseInt(value, 10);
  return isNaN(seconds) ? null : seconds;
}
