"use client";

import { motion } from "framer-motion";

export function FeedLoadingSpinner() {
  return (
    <div className="flex justify-center py-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: "var(--accent-gold)",
          borderRightColor: "var(--accent-gold)",
        }}
      />
    </div>
  );
}

export function FeedEndMessage() {
  return (
    <div className="text-center py-6">
      <p
        className="text-xs font-mono uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        You&rsquo;re all caught up
      </p>
    </div>
  );
}
