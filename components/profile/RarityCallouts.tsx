"use client";

// Rarity Callouts — Sprint 162 (The Identity)
// Renders percentile rankings ("Top 3% of IPA drinkers") from user_stats_snapshots.

import { useState } from "react";
import { motion } from "motion/react";
import { Share2, Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/animation";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatTopPercent, getRarityTier } from "@/lib/percentiles";
import { getStyleVars } from "@/lib/beerStyleColors";
import {
  generateOGImageUrl,
  getPercentileShareText,
  shareOrCopy,
} from "@/lib/share";

export interface RaritySnapshot {
  total_beers_percentile: number | null;
  unique_styles_percentile: number | null;
  top_style: string | null;
  top_style_percentile: number | null;
}

interface RarityCalloutsProps {
  snapshot: RaritySnapshot;
  userId: string;
  isOwnProfile: boolean;
}

export function RarityCallouts({ snapshot, userId, isOwnProfile }: RarityCalloutsProps) {
  const { total_beers_percentile, unique_styles_percentile, top_style, top_style_percentile } = snapshot;

  const hasAnyData =
    total_beers_percentile !== null ||
    unique_styles_percentile !== null ||
    (top_style && top_style_percentile !== null);

  if (!hasAnyData) return null;

  return (
    <Card padding="spacious">
      <CardTitle as="h3" className="mb-3">
        Rarity
      </CardTitle>
      <div className="space-y-2.5">
        {top_style && top_style_percentile !== null && top_style_percentile >= 50 && (
          <RarityRow
            label={`${top_style} drinker`}
            percentile={top_style_percentile}
            accentStyle={top_style}
            shareable={isOwnProfile}
            userId={userId}
            shareMetric={`${top_style} drinkers`}
            shareType="top_style"
          />
        )}
        {unique_styles_percentile !== null && unique_styles_percentile >= 50 && (
          <RarityRow
            label="Style explorer"
            percentile={unique_styles_percentile}
            accentStyle={null}
            shareable={isOwnProfile}
            userId={userId}
            shareMetric="beer explorers"
            shareType="unique_styles"
          />
        )}
        {total_beers_percentile !== null && total_beers_percentile >= 50 && (
          <RarityRow
            label="Pour volume"
            percentile={total_beers_percentile}
            accentStyle={null}
            shareable={isOwnProfile}
            userId={userId}
            shareMetric="drinkers by volume"
            shareType="total_beers"
          />
        )}
      </div>
    </Card>
  );
}

// ─── RarityRow ────────────────────────────────────────────────────────────

interface RarityRowProps {
  label: string;
  percentile: number;
  accentStyle: string | null;
  shareable: boolean;
  userId: string;
  shareMetric: string;
  shareType: string;
}

function RarityRow({
  label,
  percentile,
  accentStyle,
  shareable,
  userId,
  shareMetric,
  shareType,
}: RarityRowProps) {
  const [shareState, setShareState] = useState<
    "idle" | "copied" | "shared" | "failed"
  >("idle");
  const tier = getRarityTier(percentile);
  const styleVars = accentStyle ? getStyleVars(accentStyle, "beer") : null;

  const tierLabel: Record<string, string> = {
    legend: "LEGEND",
    elite: "ELITE",
    rare: "RARE",
    notable: "NOTABLE",
    regular: "",
  };

  const handleShare = async () => {
    const url = generateOGImageUrl("percentile", {
      user_id: userId,
      metric: shareType,
      percentile,
    });
    const text = getPercentileShareText({ percentile, metricLabel: shareMetric });
    const result = await shareOrCopy({
      title: formatTopPercent(percentile),
      text,
      url,
    });
    if (result === "shared") setShareState("shared");
    else if (result === "copied") setShareState("copied");
    else if (result === "cancelled") return;
    else setShareState("failed");
    setTimeout(() => setShareState("idle"), 2000);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-3",
        "border border-[var(--border)] bg-[var(--surface-2)]/40",
      )}
      style={
        styleVars
          ? { borderLeftColor: styleVars.primary, borderLeftWidth: "3px" }
          : undefined
      }
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <motion.p
            initial={{ opacity: 0, x: -4 }} // intentional: subtle left-to-right slide for percentile reveal
            animate={{ opacity: 1, x: 0 }}
            transition={spring.default}
            className="font-display text-xl font-bold text-[var(--accent-gold)]"
          >
            {formatTopPercent(percentile)}
          </motion.p>
          {tierLabel[tier] && (
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--accent-amber)]"
              aria-label={`Rarity tier: ${tier}`}
            >
              {tierLabel[tier]}
            </span>
          )}
        </div>
      </div>
      {shareable && (
        <button
          type="button"
          onClick={handleShare}
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            "border border-[var(--border)] text-[var(--text-muted)]",
            "hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/40",
            "transition-colors",
            shareState === "shared" || shareState === "copied"
              ? "text-[var(--accent-gold)] border-[var(--accent-gold)]/40"
              : "",
          )}
          aria-label={`Share ${label} percentile`}
        >
          {shareState === "shared" || shareState === "copied" ? (
            <Check size={14} />
          ) : shareState === "failed" ? (
            <Copy size={14} />
          ) : (
            <Share2 size={14} />
          )}
        </button>
      )}
    </div>
  );
}
