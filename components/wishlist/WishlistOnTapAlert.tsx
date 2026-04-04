"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Beer, X, ChevronRight } from "lucide-react";

interface WishlistOnTapAlertProps {
  count: number;
}

const DISMISS_KEY = "hoptrack:wishlist-on-tap-dismissed";

export function WishlistOnTapAlert({ count }: WishlistOnTapAlertProps) {
  // Start as hidden on both server and client — avoids hydration mismatch.
  // After mount, check localStorage and reveal if not dismissed today.
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (count === 0) return;
    const stored = localStorage.getItem(DISMISS_KEY);
    const dismissedToday = stored
      ? new Date(stored).toDateString() === new Date().toDateString()
      : false;
    if (!dismissedToday) {
      setVisible(true); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [count]);

  function handleDismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setVisible(false);
  }

  function handleExplore(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    router.push("/explore?filter=wishlist");
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="card-bg-notification rounded-2xl border relative"
          style={{ zIndex: 5 }}
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
              <button
                type="button"
                onClick={handleExplore}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                Explore
                <ChevronRight size={12} />
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 rounded-lg transition-colors cursor-pointer"
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
