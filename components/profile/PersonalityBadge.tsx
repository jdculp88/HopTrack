"use client";

// Personality Badge — Sprint 162 (The Identity)
// Displays the user's 4-letter Beer Personality archetype.
// Renders in the profile hero area between bio/location and tabs.

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { spring } from "@/lib/animation";
import { Card } from "@/components/ui/Card";
import { AXIS_LABELS } from "@/lib/personality";
import type { PersonalityResult } from "@/lib/personality";

interface PersonalityBadgeProps {
  personality: PersonalityResult;
  isOwnProfile: boolean;
}

export function PersonalityBadge({
  personality,
  isOwnProfile,
}: PersonalityBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  // Hide for other profiles with insufficient data.
  if (!personality.hasEnoughData && !isOwnProfile) return null;

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
    <Card padding="spacious" className="mb-4 relative overflow-hidden" style={{ border: "1.5px solid color-mix(in srgb, var(--accent-gold) 35%, var(--border))" }}>
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
      {/* Emoji + code label + title + tagline — all inline */}
      <div className="flex items-center gap-3">
        <motion.div
          // intentional: multi-property animation (scale + rotate) with low damping for playful bounce
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="w-12 h-12 flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-2xl">{personality.emoji}</span>
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[var(--accent-gold)]"
              aria-label={`Personality code ${personality.code}`}
            >
              {personality.code}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">·</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
              beer personality
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight">
            {personality.archetype}
          </h2>
          <p className="text-sm italic text-[var(--text-secondary)] leading-snug mt-0.5">
            {personality.tagline}
          </p>
        </div>
      </div>

      {/* Axis breakdown — human-readable labels */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 w-full flex items-center justify-between gap-2 py-1.5 group"
        aria-expanded={expanded}
        aria-label="Show personality axis details"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {axisLetters.map((letter) => {
            const info = AXIS_LABELS[letter];
            if (!info) return null;
            return (
              <span
                key={letter}
                className="text-xs font-medium px-3 py-1 rounded-lg"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  background: "color-mix(in srgb, var(--accent-gold) 4%, transparent)",
                }}
              >
                {info.label}
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
