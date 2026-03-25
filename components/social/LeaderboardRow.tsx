"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatCount } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { LeaderboardEntry } from "@/types/database";

const RANK_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-[#D4A843]/15", text: "text-[#D4A843]", label: "🥇" },
  2: { bg: "bg-[#C0C0C0]/10", text: "text-[#C0C0C0]", label: "🥈" },
  3: { bg: "bg-[#CD7F32]/10", text: "text-[#CD7F32]", label: "🥉" },
};

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  label: string;
  currentUserId?: string;
  index?: number;
  className?: string;
}

export function LeaderboardRow({ entry, label, currentUserId, index = 0, className }: LeaderboardRowProps) {
  const isCurrentUser = entry.profile.id === currentUserId;
  const rankStyle = RANK_STYLES[entry.rank];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/profile/${entry.profile.username}`}>
        <div
          className={cn(
            "flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors",
            "hover:bg-[var(--surface-2)] group",
            isCurrentUser && "bg-[#D4A843]/5 border border-[#D4A843]/20",
            rankStyle ? rankStyle.bg : "",
            className
          )}
        >
          {/* Rank */}
          <div className="w-8 flex-shrink-0 text-center">
            {rankStyle ? (
              <span className="text-xl">{rankStyle.label}</span>
            ) : (
              <span className={cn("font-mono font-bold text-sm", isCurrentUser ? "text-[#D4A843]" : "text-[var(--text-muted)]")}>
                #{entry.rank}
              </span>
            )}
          </div>

          {/* Avatar */}
          <UserAvatar profile={entry.profile} size="sm" showLevel />

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-sans font-semibold text-sm truncate group-hover:text-[#D4A843] transition-colors",
              isCurrentUser ? "text-[#D4A843]" : "text-[var(--text-primary)]"
            )}>
              {entry.profile.display_name}
              {isCurrentUser && <span className="text-xs font-mono ml-1 opacity-60">(you)</span>}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">@{entry.profile.username}</p>
          </div>

          {/* Value */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {entry.change !== undefined && entry.change !== 0 && (
              <span className={cn("text-xs", entry.change > 0 ? "text-[#3D7A52]" : "text-[#C44B3A]")}>
                {entry.change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              </span>
            )}
            <div className="text-right">
              <p className={cn("font-mono font-bold", isCurrentUser ? "text-[#D4A843]" : "text-[var(--text-primary)]")}>
                {formatCount(entry.value)}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{label}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
