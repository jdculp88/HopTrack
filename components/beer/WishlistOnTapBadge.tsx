"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface WishlistOnTapBadgeProps {
  breweryId: string;
  compact?: boolean;
}

export function WishlistOnTapBadge({ breweryId, compact = false }: WishlistOnTapBadgeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`/api/wishlist/on-tap?brewery_id=${breweryId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.count > 0) setCount(data.count);
      })
      .catch(() => {});
  }, [breweryId]);

  if (count === 0) return null;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
          color: "var(--accent-gold)",
        }}
      >
        <Heart size={9} style={{ fill: "var(--accent-gold)" }} />
        {count} on your list
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-xl border"
      style={{
        background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))",
        borderColor: "color-mix(in srgb, var(--accent-gold) 25%, transparent)",
      }}
    >
      <Heart size={16} style={{ color: "var(--accent-gold)", fill: "var(--accent-gold)" }} />
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--accent-gold)" }}>
          {count} beer{count !== 1 ? "s" : ""} on your list here!
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Plan a visit — your wishlist beers are on tap
        </p>
      </div>
    </div>
  );
}
