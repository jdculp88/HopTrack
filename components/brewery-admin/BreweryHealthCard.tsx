"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ChevronDown, ChevronUp, Lightbulb, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { spring, variants } from "@/lib/animation";
import type { MyBreweryHealth, BreweryHealthBreakdown } from "@/lib/brewery-health";

interface BreweryHealthCardProps {
  health: MyBreweryHealth;
  tier: string;
  breweryId: string;
}

const CATEGORY_LABELS: Record<keyof BreweryHealthBreakdown, string> = {
  contentFreshness: "Content Freshness",
  engagementRate: "Engagement Rate",
  loyaltyAdoption: "Loyalty Adoption",
  ratingTrend: "Rating Trend",
};

function getScoreColor(score: number): string {
  if (score >= 75) return "#4ade80";  // green
  if (score >= 50) return "#D4A843";  // gold
  if (score >= 25) return "#f59e0b";  // orange
  return "#ef4444";                    // red
}

function getScoreLabel(score: number): string {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 25) return "Needs Work";
  return "Critical";
}

function CircularGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg width="128" height="128" viewBox="0 0 128 128" className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        {/* Score arc */}
        <motion.circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-display font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, ...spring.default }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, value, max = 25 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color = getScoreColor((value / max) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--text-secondary)] w-32 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <span className="text-xs font-mono text-[var(--text-muted)] w-10 text-right">{value}/{max}</span>
    </div>
  );
}

export function BreweryHealthCard({ health, tier, breweryId }: BreweryHealthCardProps) {
  const [showTips, setShowTips] = useState(false);
  const isPaid = tier === "tap" || tier === "cask" || tier === "barrel";

  if (!isPaid) {
    return (
      <Card padding="spacious" className="relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[var(--accent-gold)]" />
          </div>
          <h3 className="font-display font-bold text-[var(--text-primary)]">Brewery Health Score</h3>
        </div>
        <div className="flex flex-col items-center gap-3 py-4 opacity-50 blur-sm select-none pointer-events-none">
          <CircularGauge score={72} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)]/60 backdrop-blur-[2px]">
          <div className="text-center px-4">
            <Lock className="w-6 h-6 text-[var(--accent-gold)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-primary)] font-medium mb-1">Upgrade to see your Health Score</p>
            <Link
              href={`/brewery-admin/${breweryId}/billing`}
              className="text-xs text-[var(--accent-gold)] hover:underline"
            >
              View Plans
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="spacious">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center">
          <Activity className="w-4 h-4 text-[var(--accent-gold)]" />
        </div>
        <h3 className="font-display font-bold text-[var(--text-primary)]">Brewery Health Score</h3>
      </div>

      <CircularGauge score={health.score} />

      <div className="mt-4 space-y-2">
        {(Object.entries(health.breakdown) as [keyof BreweryHealthBreakdown, number][]).map(([key, value]) => (
          <BreakdownBar key={key} label={CATEGORY_LABELS[key]} value={value} />
        ))}
      </div>

      {health.tips.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-1.5 text-xs text-[var(--accent-gold)] hover:opacity-80 transition-opacity"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{health.tips.length} tip{health.tips.length !== 1 ? "s" : ""} to improve</span>
            <motion.div
              animate={{ rotate: showTips ? 180 : 0 }}
              transition={spring.snappy}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showTips && (
              <motion.div
                {...variants.slideUp}
                transition={spring.default}
                className="mt-3 space-y-2"
              >
                {health.tips.map((tip) => (
                  <div
                    key={tip.category}
                    className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]"
                  >
                    <p className="text-xs text-[var(--text-secondary)] mb-2">{tip.message}</p>
                    <Link
                      href={`/brewery-admin/${breweryId}/${tip.ctaPath}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-gold)] hover:opacity-80"
                    >
                      {tip.ctaText}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
