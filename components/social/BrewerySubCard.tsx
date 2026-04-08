"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

interface BrewerySubCardProps {
  breweryId: string;
  breweryName: string;
  city?: string | null;
  state?: string | null;
  linkable?: boolean;
  className?: string;
}

/**
 * Reusable brewery location sub-card for feed cards.
 * Design spec: warm-bg, 10px radius, 8px 12px padding, 6px gap.
 * Brewery name: 13px/600. Location: mono 10px.
 */
export function BrewerySubCard({
  breweryId,
  breweryName,
  city,
  state,
  linkable = true,
  className,
}: BrewerySubCardProps) {
  const inner = (
    <div
      className={`flex items-center rounded-[10px] transition-colors hover:opacity-80 ${className ?? ""}`}
      style={{
        gap: "6px",
        padding: "8px 12px",
        background: "var(--warm-bg)",
      }}
    >
      <MapPin size={14} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
      <div className="min-w-0">
        <span
          className="font-sans font-semibold block"
          style={{ fontSize: "13px", color: "var(--text-primary)" }}
        >
          {breweryName}
        </span>
        {(city || state) && (
          <span
            className="font-mono block"
            style={{ fontSize: "10px", color: "var(--text-muted)" }}
          >
            {city}
            {state ? `, ${state}` : ""}
          </span>
        )}
      </div>
    </div>
  );

  if (linkable) {
    return <Link href={`/brewery/${breweryId}`}>{inner}</Link>;
  }

  return inner;
}
