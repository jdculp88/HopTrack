"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_PX = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = hovered ?? value;
  const isInteractive = !readonly && !!onChange;

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>, starIndex: number) {
    if (!isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHovered(starIndex + (isHalf ? 0.5 : 1));
  }

  function handleClick(e: React.MouseEvent<HTMLButtonElement>, starIndex: number) {
    if (!isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    const newValue = starIndex + (isHalf ? 0.5 : 1);
    onChange?.(newValue);
    if (navigator.vibrate) navigator.vibrate(30);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Star rating"
      className={cn("inline-flex items-center gap-0.5", className)}
      onMouseLeave={() => setHovered(null)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const fill =
          displayValue >= starValue
            ? "full"
            : displayValue >= starValue - 0.5
            ? "half"
            : "empty";

        return (
          <button
            key={i}
            type="button"
            disabled={!isInteractive}
            aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
            aria-checked={value >= starValue - 0.5 && value <= starValue}
            className={cn(
              "relative appearance-none border-0 bg-transparent p-0",
              isInteractive ? "cursor-pointer" : "cursor-default"
            )}
            style={{
              width:     SIZE_PX[size],
              height:    SIZE_PX[size],
              minWidth:  SIZE_PX[size],
              minHeight: SIZE_PX[size],
              flexShrink: 0,
              flexGrow:   0,
              flexBasis:  SIZE_PX[size],
              display:   "block",
            }}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={(e) => handleClick(e, i)}
          >
            {/* Background (empty) star */}
            <StarSVG fill="empty" className="absolute inset-0" style={{ color: 'var(--border)' }} />
            {/* Filled overlay — animates width for half/full fill */}
            <motion.div
              className="absolute inset-0 overflow-hidden"
              animate={{ width: fill === "half" ? "50%" : fill === "full" ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <StarSVG fill="full" style={{ color: 'var(--accent-gold)' }} />
            </motion.div>
            {/* Tap burst — decorative only, doesn't affect hitbox */}
            {isInteractive && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                whileTap={{ scale: 1.4, opacity: 0.6 }}
                transition={{ type: "spring", stiffness: 600, damping: 20 }}
              >
                <StarSVG fill="full" className="opacity-0" style={{ color: 'var(--accent-gold)' }} />
              </motion.div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function StarSVG({ fill: _fill, className, style }: { fill: "full" | "half" | "empty"; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-full h-full", className)}
      style={style}
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// Display-only compact rating
export function RatingDisplay({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number | null;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  if (rating === null) return null;
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <StarRating value={rating} readonly size={size} />
      <span className="font-mono text-sm font-medium" style={{ color: 'var(--accent-gold)' }}>{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-[var(--text-muted)] text-xs">({count})</span>
      )}
    </div>
  );
}
