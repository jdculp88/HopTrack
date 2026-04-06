"use client";

import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";

interface ThemeToggleProps {
  className?: string;
  /** compact = icon-only button; full = pill with label */
  variant?: "compact" | "full";
}

export function ThemeToggle({ className, variant = "compact" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const { haptic } = useHaptic();
  const handleToggle = () => { haptic("selection"); toggle(); };

  if (variant === "full") {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between w-full p-3 rounded-xl transition-colors",
          "hover:bg-[var(--surface-2)]",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {isDark ? (
            <Moon size={16} className="text-[var(--accent-gold)]" />
          ) : (
            <Sun size={16} className="text-[var(--accent-gold)]" />
          )}
          <span className="text-sm font-sans text-[var(--text-primary)]">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
        </div>

        {/* Toggle pill */}
        <div
          className={cn(
            "w-12 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0",
            isDark ? "bg-[var(--accent-gold)]" : "bg-[var(--border)]"
          )}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className={cn(
              "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm",
              isDark ? "left-6" : "left-0.5"
            )}
          />
        </div>
      </button>
    );
  }

  // Compact icon button
  return (
    <button
      onClick={toggle}
      className={cn(
        "p-2 rounded-xl transition-colors",
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0,   opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </motion.div>
    </button>
  );
}
