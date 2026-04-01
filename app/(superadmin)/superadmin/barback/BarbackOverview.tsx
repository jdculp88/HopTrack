"use client";

import { Database, Zap, Clock, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";
import { formatRelativeTime } from "@/lib/dates";

export type BarbackStats = {
  totalSources: number;
  enabledSources: number;
  pendingCount: number;
  promotedCount: number;
  totalCost: number;
  lastCrawlDate: string | null;
};

export function BarbackOverview({ stats }: { stats: BarbackStats }) {
  const cards = [
    { label: "Total Sources", value: stats.totalSources, icon: Database, highlight: false, isText: false },
    { label: "Active Sources", value: stats.enabledSources, icon: Zap, highlight: false, isText: false },
    { label: "Pending Review", value: stats.pendingCount, icon: AlertTriangle, highlight: stats.pendingCount > 0, isText: false },
    { label: "Total Promoted", value: stats.promotedCount, icon: CheckCircle, highlight: false, isText: false },
    {
      label: "Last Crawl",
      value: stats.lastCrawlDate ? formatRelativeTime(stats.lastCrawlDate) : "Never",
      icon: Clock,
      highlight: false,
      isText: true,
    },
    {
      label: "Estimated Cost",
      value: `$${stats.totalCost.toFixed(4)}`,
      icon: DollarSign,
      highlight: false,
      isText: true,
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
      {cards.map(({ label, value, icon: Icon, highlight, isText }) => (
        <div
          key={label}
          className="rounded-2xl border p-5"
          style={{
            background: "var(--surface)",
            borderColor: highlight ? "var(--accent-gold)" : "var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-xs font-mono uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {label}
            </p>
            <Icon
              size={15}
              style={{ color: highlight ? "var(--accent-gold)" : "var(--text-muted)" }}
            />
          </div>
          <p
            className={`${isText ? "text-xl" : "text-3xl"} font-bold tabular-nums font-mono`}
            style={{ color: highlight ? "var(--accent-gold)" : "var(--text-primary)" }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
