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
    <div className={cn("grid gap-3", colClasses[columns], className)}>
      {stats.map(({ label, value, icon, note, valueColor }) => (
        <div
          key={label}
          className="relative rounded-[14px] overflow-hidden p-4 border"
          style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
        >
          {/* Amber accent top bar — Design System v2.0 card type 10 */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, var(--amber, var(--accent-gold)), color-mix(in srgb, var(--amber, var(--accent-gold)) 60%, transparent))" }}
          />
          {icon && (
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center mb-2.5"
              style={{ background: "var(--surface-2, var(--warm-bg))", color: "var(--amber, var(--accent-gold))" }}
            >
              {icon}
            </div>
          )}
          <p
            className="font-mono text-[28px] font-bold leading-none"
            style={{ color: valueColor ?? "var(--text-primary)" }}
          >
            {value}
          </p>
          <p
            className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </p>
          {note && (
            <p className="text-[10px] mt-1.5 font-mono" style={{ color: "var(--text-secondary)" }}>
              {note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
