"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ServingStyle } from "@/types/database";

const STYLES: { value: ServingStyle; label: string; emoji: string }[] = [
  { value: "draft",  label: "Draft",  emoji: "🍺" },
  { value: "bottle", label: "Bottle", emoji: "🍾" },
  { value: "can",    label: "Can",    emoji: "🥫" },
  { value: "cask",   label: "Cask",   emoji: "🪣" },
];

interface ServingStylePickerProps {
  value: ServingStyle | null;
  onChange: (style: ServingStyle) => void;
  className?: string;
}

export function ServingStylePicker({ value, onChange, className }: ServingStylePickerProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      {STYLES.map((s) => {
        const isSelected = value === s.value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl",
              "border font-sans text-sm transition-all duration-150",
              isSelected
                ? "bg-[var(--accent-gold)]/15 border-[var(--accent-gold)] text-[var(--accent-gold)]"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[#6B6456] hover:text-[var(--text-primary)]"
            )}
          >
            <motion.span
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-xs font-medium">{s.label}</span>
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
