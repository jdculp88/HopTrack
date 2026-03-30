"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Beer, X, ChevronRight } from "lucide-react";

interface WishlistOnTapAlertProps {
  count: number;
}

const DISMISS_KEY = "hoptrack:wishlist-on-tap-dismissed";

export function WishlistOnTapAlert({ count }: WishlistOnTapAlertProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    // Dismiss resets daily
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    const dismissedDate = new Date(stored).toDateString();
    return dismissedDate === new Date().toDateString();
  });

  if (count === 0 || dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 15%, var(--surface)), color-mix(in srgb, var(--accent-gold) 8%, var(--surface)))",
            border: "1px solid color-mix(in srgb, var(--accent-gold) 35%, transparent)",
          }}
        >
          <div className="flex items-center gap-3 p-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 20%, transparent)" }}
            >
              <Beer size={18} style={{ color: "var(--accent-gold)" }} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                {count} wishlisted beer{count !== 1 ? "s" : ""} on tap nearby!
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Beers you want to try are available right now
              </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href="/explore?filter=wishlist"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                Explore
                <ChevronRight size={12} />
              </Link>
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label="Dismiss wishlist alert"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
