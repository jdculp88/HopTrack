"use client";

import { forwardRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** aria-label is REQUIRED for icon buttons — no visible text means screen readers need it */
  "aria-label": string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "surface" | "danger" | "gold";
  children: React.ReactNode;
}

const SIZES = {
  sm: "w-8 h-8 min-w-[32px] rounded-lg",
  md: "w-11 h-11 min-w-[44px] rounded-xl",   // 44px = Apple HIG minimum
  lg: "w-12 h-12 min-w-[48px] rounded-xl",
};

const VARIANTS = {
  ghost:   "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] border border-transparent",
  surface: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-2)] hover:bg-[var(--border)] border border-[var(--border)]",
  danger:  "text-[var(--danger)] hover:bg-[var(--danger)]/10 border border-transparent",
  gold:    "text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 border border-transparent",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "md", variant = "ghost", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center flex-shrink-0 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]",
          "disabled:opacity-50 disabled:pointer-events-none",
          SIZES[size],
          VARIANTS[variant],
          className
        )}
        {...props}
      >
        <motion.span
          className="inline-flex items-center justify-center"
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {children}
        </motion.span>
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
