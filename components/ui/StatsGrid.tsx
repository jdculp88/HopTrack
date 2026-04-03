"use client";

import { cn } from "@/lib/utils";

/**
 * Stats grid — Sprint 134 (The Tidy)
 *
 * Replaces 8+ identical stat card grid patterns across admin pages.
 *
 * @example
 * <StatsGrid stats={[
 *   { label: "Active Cards", value: 42, icon: <Users size={16} /> },
 *   { label: "Total Stamps", value: 128, icon: <Stamp size={16} /> },
 * ]} />
 */

export interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  /** Optional note below value (e.g., "+12% WoW") */
  note?: string;
  /** Optional highlight color for the value */
  valueColor?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const colClasses = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export function StatsGrid({ stats, columns = 3, className }: StatsGridProps) {
  return (
    <div className={cn("grid gap-4", colClasses[columns], className)}>
      {stats.map(({ label, value, icon, note, valueColor }) => (
        <div
          key={label}
          className="rounded-2xl p-5 border text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {icon && (
            <div className="mb-2 flex justify-center" style={{ color: "var(--text-muted)" }}>
              {icon}
            </div>
          )}
          <p
            className="font-mono text-2xl font-bold"
            style={{ color: valueColor ?? "var(--accent-gold)" }}
          >
            {value}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
          {note && (
            <p className="text-[10px] mt-1 font-mono" style={{ color: "var(--text-secondary)" }}>
              {note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
