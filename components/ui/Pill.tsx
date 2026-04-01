"use client";

import { cn } from "@/lib/utils";

type PillSize = "xs" | "sm" | "md";
type PillVariant = "gold" | "muted" | "success" | "danger" | "ghost" | "style";

interface PillProps {
  children: React.ReactNode;
  size?: PillSize;
  variant?: PillVariant;
  /** Custom CSS color for style-tinted pills */
  styleColor?: string;
  className?: string;
  icon?: React.ReactNode;
}

const sizeClasses: Record<PillSize, string> = {
  xs: "text-[10px] px-1.5 py-0.5 gap-1",
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-xs px-3 py-1 gap-1.5",
};

function getVariantStyles(variant: PillVariant, styleColor?: string) {
  switch (variant) {
    case "gold":
      return {
        background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
        color: "var(--accent-gold)",
        border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
      };
    case "muted":
      return {
        background: "color-mix(in srgb, var(--text-muted) 10%, transparent)",
        color: "var(--text-muted)",
        border: "1px solid color-mix(in srgb, var(--border) 60%, transparent)",
      };
    case "success":
      return {
        background: "color-mix(in srgb, #22c55e 12%, transparent)",
        color: "#22c55e",
        border: "1px solid color-mix(in srgb, #22c55e 25%, transparent)",
      };
    case "danger":
      return {
        background: "color-mix(in srgb, var(--danger) 12%, transparent)",
        color: "var(--danger)",
        border: "1px solid color-mix(in srgb, var(--danger) 25%, transparent)",
      };
    case "ghost":
      return {
        background: "transparent",
        color: "var(--text-secondary)",
        border: "1px solid var(--border)",
      };
    case "style":
      return {
        background: styleColor
          ? `color-mix(in srgb, ${styleColor} 15%, transparent)`
          : "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
        color: styleColor ?? "var(--accent-gold)",
        border: `1px solid ${styleColor ? `color-mix(in srgb, ${styleColor} 30%, transparent)` : "color-mix(in srgb, var(--accent-gold) 30%, transparent)"}`,
      };
  }
}

export function Pill({
  children,
  size = "sm",
  variant = "muted",
  styleColor,
  className,
  icon,
}: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-mono font-medium whitespace-nowrap",
        sizeClasses[size],
        className
      )}
      style={getVariantStyles(variant, styleColor)}
    >
      {icon}
      {children}
    </span>
  );
}
