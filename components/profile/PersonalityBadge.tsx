"use client";

// Personality Badge — Sprint 162 (The Identity)
// Displays the user's 4-letter Beer Personality archetype with share button.
// Renders in the profile hero area between bio/location and tabs.

import { useState } from "react";
import { motion } from "motion/react";
import { Share2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import {
  generateOGImageUrl,
  getPersonalityShareText,
  shareOrCopy,
} from "@/lib/share";
import type { PersonalityResult } from "@/lib/personality";

interface PersonalityBadgeProps {
  personality: PersonalityResult;
  userId: string;
  isOwnProfile: boolean;
}

export function PersonalityBadge({
  personality,
  userId,
  isOwnProfile,
}: PersonalityBadgeProps) {
  const [shareState, setShareState] = useState<
    "idle" | "sharing" | "copied" | "shared" | "failed"
  >("idle");

  // Hide for other profiles with insufficient data.
  if (!personality.hasEnoughData && !isOwnProfile) return null;

  const handleShare = async () => {
    setShareState("sharing");
    const url = generateOGImageUrl("personality", {
      user_id: userId,
      code: personality.code,
    });
    const text = getPersonalityShareText({
      archetype: personality.archetype,
      emoji: personality.emoji,
    });
    const result = await shareOrCopy({
      title: personality.archetype,
      text,
      url,
    });
    if (result === "shared") setShareState("shared");
    else if (result === "copied") setShareState("copied");
    else if (result === "cancelled") setShareState("idle");
    else setShareState("failed");

    if (result !== "cancelled") {
      setTimeout(() => setShareState("idle"), 2000);
    }
  };

  // Insufficient data state (own profile only — other profiles hidden above)
  if (!personality.hasEnoughData) {
    return (
      <Card padding="default" className="mb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden="true">
            {personality.emoji}
          </span>
          <p className="font-display text-lg text-[var(--text-primary)]">
            {personality.archetype}
          </p>
        </div>
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
          {personality.tagline}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Log 5+ beers to unlock your archetype
        </p>
      </Card>
    );
  }

  const shareButtonContent =
    shareState === "shared" || shareState === "copied" ? (
      <>
        <Check size={14} />
        {shareState === "copied" ? "Copied" : "Shared"}
      </>
    ) : shareState === "failed" ? (
      <>
        <Copy size={14} />
        Try again
      </>
    ) : (
      <>
        <Share2 size={14} />
        Share
      </>
    );

  return (
    <Card padding="spacious" className="mb-4 relative overflow-hidden">
      {/* Gold shimmer accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent-gold) 50%, transparent 100%)",
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <motion.span
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-3xl"
              aria-hidden="true"
            >
              {personality.emoji}
            </motion.span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight">
                {personality.archetype}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-gold)]"
                  aria-label={`Personality code ${personality.code}`}
                >
                  {personality.code}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  ·
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  beer personality
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-snug">
            {personality.tagline}
          </p>
        </div>
        {isOwnProfile && (
          <button
            type="button"
            onClick={handleShare}
            disabled={shareState === "sharing"}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl",
              "text-xs font-mono uppercase tracking-wider",
              "border border-[var(--border)] hover:border-[var(--accent-gold)]/40",
              "text-[var(--text-secondary)] hover:text-[var(--accent-gold)]",
              "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              shareState === "shared" || shareState === "copied"
                ? "text-[var(--accent-gold)] border-[var(--accent-gold)]/40"
                : "",
            )}
            aria-label="Share personality"
          >
            {shareButtonContent}
          </button>
        )}
      </div>
    </Card>
  );
}
