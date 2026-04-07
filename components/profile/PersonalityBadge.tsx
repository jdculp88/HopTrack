"use client";

// Personality Badge — Sprint 162 (The Identity)
// Displays the user's 4-letter Beer Personality archetype with share button.
// Renders in the profile hero area between bio/location and tabs.

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Share2, Copy, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/animation";
import { Card } from "@/components/ui/Card";
import {
  generateOGImageUrl,
  getPersonalityShareText,
  shareOrCopy,
} from "@/lib/share";
import { AXIS_LABELS } from "@/lib/personality";
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
  const [expanded, setExpanded] = useState(false);

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

  const axisLetters = personality.code.split("");

  // Sprint 171: Personality-themed colors based on archetype axes
  const axisColors = {
    E: "var(--accent-blue)",    // Explorer = blue (adventure)
    L: "var(--accent-amber)",   // Loyalist = amber (warmth)
    B: "var(--ipa-green)",      // Bold = hop green
    S: "var(--saison-peach)",   // Smooth = peach
    H: "var(--accent-purple)",  // Hunter = purple (discovery)
    R: "var(--accent-gold)",    // Regular = gold (reliability)
    J: "var(--sour-berry)",     // Judge = berry (discerning)
    O: "var(--lager-sky)",      // Optimist = sky blue (open)
  };
  const c1 = axisColors[personality.code[0] as keyof typeof axisColors] ?? "var(--accent-gold)";
  const c2 = axisColors[personality.code[1] as keyof typeof axisColors] ?? "var(--accent-amber)";

  return (
    <Card padding="spacious" className="mb-4 relative overflow-hidden">
      {/* Sprint 171: Personality-colored gradient accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${c1} 0%, ${c2} 50%, var(--accent-gold) 100%)`,
        }}
      />
      {/* Subtle background mesh from personality colors */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, color-mix(in srgb, ${c1} 8%, transparent) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, color-mix(in srgb, ${c2} 8%, transparent) 0%, transparent 50%)`,
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <motion.span
              // intentional: multi-property animation (scale + rotate) with low damping for playful bounce
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

      {/* Axis breakdown — human-readable labels */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 w-full flex items-center justify-between gap-2 py-1.5 group"
        aria-expanded={expanded}
        aria-label="Show personality axis details"
      >
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-[var(--text-secondary)]">
          {axisLetters.map((letter, i) => {
            const info = AXIS_LABELS[letter];
            if (!info) return null;
            return (
              <span key={letter} className="flex items-center gap-1">
                {i > 0 && <span className="text-[var(--text-muted)]">·</span>}
                <span className="font-medium">{info.label}</span>
              </span>
            );
          })}
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={spring.default}
          className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
        >
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.default}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2 border-t border-[var(--border)]">
              {axisLetters.map((letter) => {
                const info = AXIS_LABELS[letter];
                if (!info) return null;
                return (
                  <div key={letter} className="flex items-start gap-2">
                    <span className="text-[10px] font-mono font-bold text-[var(--accent-gold)] w-4 flex-shrink-0 mt-0.5">
                      {letter}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">
                        {info.label}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {info.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
