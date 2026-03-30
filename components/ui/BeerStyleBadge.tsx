import { cn } from "@/lib/utils";
import type { BeerStyle } from "@/types/database";
import { getStyleVars } from "@/lib/beerStyleColors";

interface BeerStyleBadgeProps {
  style: BeerStyle | string | null;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function BeerStyleBadge({ style, size = "sm", className }: BeerStyleBadgeProps) {
  if (!style) return null;
  const vars = getStyleVars(style);

  const sizeClasses = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium font-sans leading-none",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${vars.primary} 15%, transparent)`,
        color: vars.primary,
        border: `1px solid color-mix(in srgb, ${vars.primary} 28%, transparent)`,
      }}
    >
      {style}
    </span>
  );
}
