"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FlavorTag } from "@/types/database";

const ALL_TAGS: FlavorTag[] = [
  "Hoppy", "Citrusy", "Malty", "Smooth", "Bitter",
  "Roasty", "Fruity", "Sour", "Sweet", "Dry",
  "Spicy", "Earthy", "Piney", "Tropical", "Coffee",
  "Chocolate", "Caramel", "Floral", "Grassy", "Crisp",
];

interface FlavorTagPickerProps {
  selected: FlavorTag[];
  onChange: (tags: FlavorTag[]) => void;
  max?: number;
  className?: string;
}

export function FlavorTagPicker({ selected, onChange, max = 6, className }: FlavorTagPickerProps) {
  function toggle(tag: FlavorTag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < max) {
      onChange([...selected, tag]);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {ALL_TAGS.map((tag) => {
        const isSelected = selected.includes(tag);
        const isDisabled = !isSelected && selected.length >= max;

        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            disabled={isDisabled}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-sans font-medium",
              "border transition-all duration-150 select-none",
              isSelected
                ? "bg-[var(--accent-gold)]/20 border-[var(--accent-gold)] text-[var(--accent-gold)]"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[#6B6456] hover:text-[var(--text-primary)]",
              isDisabled && "opacity-40 pointer-events-none"
            )}
          >
            <motion.span
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="inline-flex items-center"
            >
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block mr-1"
                >
                  ✓
                </motion.span>
              )}
              {tag}
            </motion.span>
          </button>
        );
      })}
      {max && (
        <span className="text-xs text-[var(--text-muted)] self-end ml-auto">
          {selected.length}/{max} selected
        </span>
      )}
    </div>
  );
}
