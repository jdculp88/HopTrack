"use client";

import { motion } from "motion/react";
import { AlertTriangle, Clock } from "lucide-react";

interface ClosedBreweryBannerProps {
  breweryName: string;
}

export function ClosedBreweryBanner({ breweryName }: ClosedBreweryBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="rounded-2xl px-4 py-3 mb-4"
      style={{
        background: "color-mix(in srgb, var(--text-muted) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--text-muted) 25%, transparent)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "color-mix(in srgb, var(--text-muted) 15%, transparent)" }}
        >
          <Clock size={16} style={{ color: "var(--text-muted)" }} />
        </div>
        <div>
          <p className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            Permanently Closed
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {breweryName} has permanently closed. Their history, beers, and reviews are preserved here as a memorial to what they offered.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
