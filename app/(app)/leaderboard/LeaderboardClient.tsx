"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { RANK_STYLES } from "@/lib/constants/tiers";
import Link from "next/link";

interface LeaderboardEntry {
  user_id: string;
  xp_earned: number;
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    xp?: number;
  };
  rank: number;
}

interface LeaderboardClientProps {
  allTime: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  currentUserId: string;
}

export function LeaderboardClient({ allTime, monthly, currentUserId }: LeaderboardClientProps) {
  const [period, setPeriod] = useState<"monthly" | "alltime">("monthly");

  const entries = period === "monthly" ? monthly : allTime;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}>
          <Trophy size={20} />
        </div>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Leaderboard</h1>
      </div>

      {/* Period toggle */}
      <div className="flex gap-2">
        {(["monthly", "alltime"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className="px-4 py-2 rounded-xl text-sm font-mono transition-all border"
            style={
              period === p
                ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }
                : { background: "var(--card-bg)", color: "var(--text-muted)", borderColor: "var(--border)" }
            }
          >
            {p === "monthly" ? "This Month" : "All Time"}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto">
            <Trophy size={24} className="text-[var(--text-muted)]" />
          </div>
          <p className="font-display text-xl text-[var(--text-primary)]">No sessions yet this month</p>
          <p className="text-[var(--text-secondary)] text-sm">Start a session to get on the board.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const rankStyle = RANK_STYLES[entry.rank];
            const isMe = entry.user_id === currentUserId;
            const displayName = entry.profile.display_name || entry.profile.username;

            return (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 30 }}
              >
                <Link
                  href={`/profile/${entry.profile.username}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                    isMe
                      ? "border-[var(--accent-gold)]/30 bg-[color-mix(in_srgb,var(--accent-gold)_5%,transparent)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-gold)]/20"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className="w-8 text-center font-display font-bold text-sm flex-shrink-0"
                    style={rankStyle ? { color: rankStyle.text } : { color: "var(--text-muted)" }}
                  >
                    {rankStyle?.label ? (
                      <span className="flex items-center justify-center text-xl">
                        {rankStyle.label}
                      </span>
                    ) : (
                      `#${entry.rank}`
                    )}
                  </div>

                  {/* Avatar */}
                  <UserAvatar
                    profile={{ display_name: displayName ?? "", avatar_url: entry.profile.avatar_url }}
                    size="md"
                  />

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-[var(--text-primary)] text-sm truncate">
                      {displayName}
                      {isMe && <span className="ml-2 text-xs text-[var(--text-muted)] font-normal">(you)</span>}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">@{entry.profile.username}</p>
                  </div>

                  {/* XP badge */}
                  <div
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold flex-shrink-0"
                    style={
                      rankStyle
                        ? { background: rankStyle.bg, color: rankStyle.text }
                        : { background: "var(--surface-2)", color: "var(--text-secondary)" }
                    }
                  >
                    {entry.xp_earned.toLocaleString()} XP
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
