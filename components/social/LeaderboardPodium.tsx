"use client";

// Sprint 169 — The Details
// Leaderboard podium for top 3 with height hierarchy (2nd | 1st | 3rd).
// Classic award ceremony stagger: 3rd → 1st → 2nd.

import { motion } from "motion/react";
import { Crown } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { RANK_STYLES } from "@/lib/constants/tiers";
import { cn, formatCount } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/database";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  label: string;
  currentUserId?: string;
}

const PODIUM_ORDER = [1, 0, 2] as const; // 2nd, 1st, 3rd (display order)
const STAGGER_ORDER = [2, 0, 1] as const; // 3rd, 1st, 2nd (animation order)

const HEIGHTS: Record<number, string> = {
  0: "pt-0",  // 1st — tallest
  1: "pt-6",  // 2nd — medium
  2: "pt-10", // 3rd — shortest
};

const PEDESTAL_HEIGHTS: Record<number, string> = {
  0: "h-16", // 1st
  1: "h-10", // 2nd
  2: "h-6",  // 3rd
};

const MEDAL_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  0: { bg: "rgba(212, 168, 67, 0.15)", border: "rgba(212, 168, 67, 0.40)", text: "#D4A843" },
  1: { bg: "rgba(192, 192, 192, 0.12)", border: "rgba(192, 192, 192, 0.35)", text: "#C0C0C0" },
  2: { bg: "rgba(184, 134, 82, 0.12)", border: "rgba(184, 134, 82, 0.35)", text: "#B88652" },
};

export function LeaderboardPodium({ entries, label, currentUserId }: LeaderboardPodiumProps) {
  if (entries.length < 3) return null;

  const top3 = entries.slice(0, 3);

  return (
    <div className="flex items-end justify-center gap-3 px-2 mb-6">
      {PODIUM_ORDER.map((entryIndex) => {
        const entry = top3[entryIndex];
        const rank = entryIndex; // 0-indexed: 0=1st, 1=2nd, 2=3rd
        const isCurrentUser = entry.profile.id === currentUserId;
        const rankStyle = RANK_STYLES[entry.rank];
        const medal = MEDAL_COLORS[rank];
        const animDelay = STAGGER_ORDER.indexOf(entryIndex) * 0.12;

        return (
          <motion.div
            key={entry.profile.id}
            className={cn("flex flex-col items-center flex-1 max-w-[140px]", HEIGHTS[rank])}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 28, delay: animDelay }}
          >
            {/* Crown on 1st place */}
            {rank === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, rotate: -15 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: animDelay + 0.2 }}
                className="mb-1"
              >
                <Crown size={20} style={{ color: "#D4A843" }} fill="#D4A843" />
              </motion.div>
            )}

            {/* Avatar */}
            <Link href={`/profile/${entry.profile.username}`} className="relative">
              <UserAvatar
                profile={entry.profile}
                size={rank === 0 ? "lg" : "md"}
                showLevel
              />
              {/* Rank change indicator */}
              {entry.change !== undefined && entry.change !== 0 && (
                <div
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold"
                  style={{
                    background: entry.change > 0 ? "rgba(61, 122, 82, 0.9)" : "rgba(196, 75, 58, 0.9)",
                    color: "#fff",
                  }}
                >
                  {entry.change > 0 ? `+${entry.change}` : entry.change}
                </div>
              )}
            </Link>

            {/* Name */}
            <Link
              href={`/profile/${entry.profile.username}`}
              className={cn(
                "mt-2 text-xs font-semibold text-center truncate w-full",
                "hover:text-[var(--accent-gold)] transition-colors",
              )}
              style={{ color: isCurrentUser ? "var(--accent-gold)" : "var(--text-primary)" }}
            >
              {entry.profile.display_name ?? entry.profile.username}
              {isCurrentUser && <span className="opacity-50 ml-0.5">(you)</span>}
            </Link>

            {/* Value */}
            <p className="text-[11px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
              {formatCount(entry.value)} {label}
            </p>

            {/* Pedestal */}
            <div
              className={cn(
                "w-full rounded-t-xl mt-2 flex items-start justify-center pt-2",
                PEDESTAL_HEIGHTS[rank],
              )}
              style={{
                background: medal.bg,
                border: `1px solid ${medal.border}`,
                borderBottom: "none",
              }}
            >
              <span className="text-2xl">{rankStyle?.label ?? `#${entry.rank}`}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
