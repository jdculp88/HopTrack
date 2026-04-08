"use client";

import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";

interface BeerEntryRowProps {
  quantity: number;
  style?: string | null;
  beerName: string;
  beerId?: string;
}

/**
 * Reusable beer line item for feed cards and session displays.
 * Design spec: 8px gap, qty badge (mono 10px/600, warm-bg, 4px radius,
 * 1px 6px padding, 24px min-width), beer name (13px, text-secondary).
 */
export function BeerEntryRow({ quantity, style, beerName }: BeerEntryRowProps) {
  return (
    <div className="flex items-center" style={{ gap: "8px" }}>
      {/* Quantity badge */}
      <span
        className="font-mono font-semibold flex-shrink-0 text-center rounded"
        style={{
          fontSize: "10px",
          color: "var(--text-muted)",
          background: "var(--warm-bg)",
          padding: "1px 6px",
          borderRadius: "4px",
          minWidth: "24px",
        }}
      >
        &times;{quantity}
      </span>

      {/* Style badge */}
      {style && <BeerStyleBadge style={style} size="sm" />}

      {/* Beer name */}
      <span
        className="font-sans flex-1 min-w-0 truncate"
        style={{ fontSize: "13px", color: "var(--text-secondary)" }}
        title={beerName}
      >
        {beerName}
      </span>
    </div>
  );
}
