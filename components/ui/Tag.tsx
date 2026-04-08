"use client";

import { cn } from "@/lib/utils";

/**
 * Tag — Sprint 173
 *
 * Squared badge with rounded corners (4px border-radius).
 * Distinct from Pill (capsule-shaped, rounded-full).
 *
 * Color-driven: pass a base CSS color and the component
 * derives background (~9% opacity) and border (~12% opacity).
 *
 * @example
 * <Tag color="var(--badge-bronze)" className="uppercase">bronze</Tag>
 * <Tag color="var(--success)">Active</Tag>
 * <Tag color="#8BAABF">Custom</Tag>
 */
interface TagProps {
  children: React.ReactNode;
  /** Base CSS color — text color, bg/border derived automatically */
  color: string;
  className?: string;
}

export function Tag({ children, color, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-mono font-semibold text-[9px] px-1.5 py-px tracking-wide whitespace-nowrap",
        className
      )}
      style={{
        background: `color-mix(in srgb, ${color} 9%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}
