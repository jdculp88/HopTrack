/**
 * FlavorTag — tasting note tag that matches BeerStyleBadge dimensions exactly.
 * Same flex structure, font, padding, radius — neutral styling, no colored dot.
 */

import { cn } from "@/lib/utils";

interface FlavorTagProps {
  tag: string;
  className?: string;
}

export function FlavorTag({ tag, className }: FlavorTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] font-mono font-semibold leading-none whitespace-nowrap",
        "px-2 py-0.5 gap-1 text-[10.5px]",
        className
      )}
      style={{
        color: "var(--text-primary)",
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Invisible spacer matching BeerStyleBadge dot height */}
      <span className="w-0 h-1.5 flex-shrink-0" aria-hidden="true" />
      {tag}
    </span>
  );
}
