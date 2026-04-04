"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const REACTIONS = [
  { emoji: "🍺", label: "Cheers" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👊", label: "Respect" },
];

interface EmojiPulseProps {
  itemKey: string; // unique key for localStorage (e.g. "achievement-{id}")
}

export function EmojiPulse({ itemKey }: EmojiPulseProps) {
  const storageKey = `hoptrack:pulse:${itemKey}`;

  // Load persisted counts from localStorage
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  });
  const [myReaction, setMyReaction] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`${storageKey}:mine`) || null;
  });

  function handleReact(emoji: string) {
    setCounts((prev) => {
      const next = { ...prev };
      if (myReaction === emoji) {
        // toggle off
        next[emoji] = Math.max(0, (next[emoji] || 1) - 1);
        if (next[emoji] === 0) delete next[emoji];
      } else {
        // remove old
        if (myReaction) {
          next[myReaction] = Math.max(0, (next[myReaction] || 1) - 1);
          if (next[myReaction] === 0) delete next[myReaction];
        }
        next[emoji] = (next[emoji] || 0) + 1;
      }
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    const next = myReaction === emoji ? null : emoji;
    setMyReaction(next);
    if (next) {
      localStorage.setItem(`${storageKey}:mine`, next);
    } else {
      localStorage.removeItem(`${storageKey}:mine`);
    }
  }

  return (
    <div className="flex items-center gap-2 pt-2">
      {REACTIONS.map(({ emoji, label }) => {
        const count = counts[emoji] || 0;
        const active = myReaction === emoji;
        return (
          <button
            key={emoji}
            onClick={handleReact.bind(null, emoji)}
            aria-label={label}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all"
            style={{
              background: active
                ? "color-mix(in srgb, var(--accent-gold) 18%, transparent)"
                : "color-mix(in srgb, var(--border) 60%, transparent)",
              border: active
                ? "1px solid color-mix(in srgb, var(--accent-gold) 35%, transparent)"
                : "1px solid transparent",
              color: active ? "var(--accent-gold)" : "var(--text-muted)",
            }}
          >
            <span>{emoji}</span>
            <AnimatePresence mode="wait">
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-[10px]"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}
