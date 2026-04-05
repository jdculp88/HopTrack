"use client";

import { motion } from "motion/react";
import { BarChart3, Lock, MapPin } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { PeerBenchmarks, BenchmarkMetric } from "@/lib/brewery-benchmarks";

interface PeerBenchmarkCardProps {
  benchmarks: PeerBenchmarks;
  tier: string;
  breweryId: string;
}

const METRIC_LABELS: Record<string, { label: string; unit: string; format: (v: number) => string }> = {
  avgVisitDuration: {
    label: "Avg Visit Duration",
    unit: "min",
    format: (v) => `${Math.round(v)} min`,
  },
  beersPerVisit: {
    label: "Beers per Visit",
    unit: "",
    format: (v) => v.toFixed(1),
  },
  retentionRate: {
    label: "Retention Rate",
    unit: "%",
    format: (v) => `${Math.round(v)}%`,
  },
  avgRating: {
    label: "Avg Rating",
    unit: "",
    format: (v) => `${v.toFixed(1)} stars`,
  },
  followerCount: {
    label: "Followers",
    unit: "",
    format: (v) => Math.round(v).toLocaleString(),
  },
};

function getDiffColor(pctDiff: number | null): string {
  if (pctDiff === null) return "var(--text-muted)";
  if (pctDiff > 10) return "#4ade80";   // green — above avg
  if (pctDiff >= -10) return "#D4A843"; // gold — average
  return "#ef4444";                      // red — below avg
}

function getDiffLabel(pctDiff: number | null): string {
  if (pctDiff === null) return "N/A";
  if (pctDiff > 0) return `+${pctDiff}%`;
  return `${pctDiff}%`;
}

function ComparisonBar({ metricKey, metric }: { metricKey: string; metric: BenchmarkMetric }) {
  const config = METRIC_LABELS[metricKey];
  if (!config) return null;

  const color = getDiffColor(metric.pctDiff);
  const hasData = metric.yours !== null && metric.peerAvg !== null;

  // Bar width: 50% = peer average, yours proportionally
  let barPct = 50;
  if (hasData && metric.peerAvg! > 0) {
    barPct = Math.min(100, Math.max(10, (metric.yours! / metric.peerAvg!) * 50));
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">{config.label}</span>
        <div className="flex items-center gap-2">
          {hasData ? (
            <>
              <span className="text-xs font-mono text-[var(--text-primary)]">
                {config.format(metric.yours!)}
              </span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={{ color, backgroundColor: `${color}15` }}
              >
                {getDiffLabel(metric.pctDiff)}
              </span>
            </>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">No data</span>
          )}
        </div>
      </div>

      {hasData && (
        <div className="relative h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
          {/* Peer average marker line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-[var(--text-muted)]/40 z-10"
            style={{ left: "50%" }}
          />
          {/* Your bar */}
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      )}

      {hasData && (
        <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
          <span>You: {config.format(metric.yours!)}</span>
          <span>Avg: {config.format(metric.peerAvg!)}</span>
        </div>
      )}
    </div>
  );
}

export function PeerBenchmarkCard({ benchmarks, tier, breweryId }: PeerBenchmarkCardProps) {
  const isCaskPlus = tier === "cask" || tier === "barrel";

  if (!isCaskPlus) {
    return (
      <Card padding="spacious" className="relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[var(--accent-gold)]" />
          </div>
          <h3 className="font-display font-bold text-[var(--text-primary)]">Peer Benchmarking</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-3">
          See how your brewery compares to similar breweries in your area.
        </p>
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
          <span className="text-xs text-[var(--text-secondary)]">
            Upgrade to Cask for peer benchmarking
          </span>
        </div>
      </Card>
    );
  }

  if (benchmarks.insufficient) {
    return (
      <Card padding="spacious">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-[var(--accent-gold)]" />
          </div>
          <h3 className="font-display font-bold text-[var(--text-primary)]">Peer Benchmarking</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Not enough comparable breweries in your area yet. We need 5+ peers for anonymous benchmarking.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="spacious">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-[var(--accent-gold)]" />
        </div>
        <h3 className="font-display font-bold text-[var(--text-primary)]">Peer Benchmarking</h3>
      </div>
      <div className="flex items-center gap-1 mb-4">
        <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-muted)]">
          vs. {benchmarks.peerCount} breweries in {benchmarks.peerLocation}
        </span>
      </div>

      <div className="space-y-4">
        {(Object.entries(benchmarks.metrics) as [string, BenchmarkMetric][]).map(([key, metric]) => (
          <ComparisonBar key={key} metricKey={key} metric={metric} />
        ))}
      </div>

      <p className="mt-4 text-[10px] text-[var(--text-muted)] text-center">
        Anonymous comparison — no brewery names revealed
      </p>
    </Card>
  );
}
