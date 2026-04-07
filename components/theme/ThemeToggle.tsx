"use client";

import { Sun, Moon, Smartphone } from "lucide-react";
import { motion } from "motion/react";
import { useTheme, type Theme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";
import { spring, transition, microInteraction } from "@/lib/animation";

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "oled", label: "OLED", icon: Smartphone },
];

interface ThemeToggleProps {
  className?: string;
  /** compact = icon-only button; full = 3-segment selector */
  variant?: "compact" | "full";
}

export function ThemeToggle({ className, variant = "compact" }: ThemeToggleProps) {
  const { theme, toggle, setTheme } = useTheme();
  const { haptic } = useHaptic();

  if (variant === "full") {
    return (
      <div
        className={cn(
          "flex items-center justify-between w-full p-3 rounded-xl",
          className
        )}
      >
        <span className="text-sm font-sans text-[var(--text-primary)]">
          Theme
        </span>

        {/* 3-segment selector */}
        <div
          className="relative flex rounded-xl p-0.5 flex-shrink-0"
          style={{ background: "var(--surface)" }}
          role="radiogroup"
          aria-label="Theme selection"
        >
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { haptic("selection"); setTheme(opt.value); }}
                className={cn(
                  "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "text-[var(--bg)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                )}
                role="radio"
                aria-checked={isActive}
                aria-label={opt.label}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            );
          })}
          {/* Sliding active indicator */}
          <motion.div
            layout
            layoutId="theme-indicator"
            transition={spring.snappy}
            className="absolute top-0.5 bottom-0.5 rounded-lg"
            style={{
              background: "var(--accent-gold)",
              width: `calc(${100 / THEME_OPTIONS.length}% - 2px)`,
              left: `calc(${THEME_OPTIONS.findIndex(o => o.value === theme) * (100 / THEME_OPTIONS.length)}% + 1px)`,
            }}
          />
        </div>
      </div>
    );
  }

  // Compact icon button — cycles through themes
  const currentIcon = THEME_OPTIONS.find(o => o.value === theme)!;
  const nextTheme = THEME_OPTIONS[(THEME_OPTIONS.findIndex(o => o.value === theme) + 1) % THEME_OPTIONS.length];
  const Icon = currentIcon.value === "dark" ? Sun : currentIcon.value === "light" ? Smartphone : Moon;

  return (
    <button
      onClick={() => { haptic("selection"); toggle(); }}
      className={cn(
        "p-2 rounded-xl transition-colors",
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
        className
      )}
      aria-label={`Switch to ${nextTheme.label} mode`}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        whileTap={microInteraction.toggle}
        transition={transition.fast}
      >
        <Icon size={20} />
      </motion.div>
    </button>
  );
}
