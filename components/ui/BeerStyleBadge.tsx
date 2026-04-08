/**
 * BeerStyleBadge — Design System v2.0 Section 08
 *
 * THE primary way beer style color enters the UI.
 * Spec: tint bg (15%) + subtle border (15%) + 6px color dot + style name
 * Font: JetBrains Mono 10.5px/600
 */

import { cn } from "@/lib/utils";
import type { BeerStyle, ItemType } from "@/types/database";
import { ITEM_TYPE_LABELS } from "@/types/database";
import { getStyleVars } from "@/lib/beerStyleColors";

interface BeerStyleBadgeProps {
  style: BeerStyle | string | null;
  itemType?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  /** Stretch badge to fill container width */
  fullWidth?: boolean;
  className?: string;
}

const sizeConfig = {
  xs: { badge: "px-1.5 py-0.5 gap-1 text-[9px]", dot: "w-1 h-1" },
  sm: { badge: "px-2 py-0.5 gap-1 text-[10.5px]", dot: "w-1.5 h-1.5" },
  md: { badge: "px-2.5 py-1 gap-1.5 text-xs", dot: "w-1.5 h-1.5" },
  lg: { badge: "px-3.5 py-1 gap-1.5 text-xs", dot: "w-1.5 h-1.5" },
};

export function BeerStyleBadge({ style, itemType, size = "sm", fullWidth = false, className }: BeerStyleBadgeProps) {
  if (!style && !itemType) return null;
  const vars = getStyleVars(style, itemType);
  const s = sizeConfig[size];

  return (
    <span
      className={cn(
        fullWidth ? "flex w-full" : "inline-flex",
        "items-center rounded-[6px] font-mono font-semibold leading-none whitespace-nowrap",
        s.badge,
        className
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${vars.primary} 12%, var(--card-bg))`,
        color: vars.primary,
        border: `1px solid color-mix(in srgb, ${vars.primary} 12%, transparent)`,
      }}
    >
      {/* 6px color dot indicator — Design System v2.0 */}
      <span
        className={cn("rounded-full flex-shrink-0", s.dot)}
        style={{ background: vars.primary }}
      />
      {style || (itemType ? ITEM_TYPE_LABELS[itemType as ItemType] ?? itemType : "")}
    </span>
  );
}
