"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactionBar } from "@/components/social/ReactionBar";

export interface StreakData {
  profileId: string;
  username: string;
  displayName: string;
  currentStreak: number;
}

const STREAK_MILESTONES = [3, 5, 7, 14, 21, 30, 50, 100];

export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak);
}

export function isStreakSeen(userId: string, streak: number): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`hoptrack:streak-seen:${userId}-${streak}`) === "1";
}

export function markStreakSeen(userId: string, streak: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`hoptrack:streak-seen:${userId}-${streak}`, "1");
}

export function StreakFeedCard({
  streak,
  index = 0,
}: {
  streak: StreakData;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.28 }}
      className="rounded-2xl p-6 text-center"
      style={{
        background:
          "color-mix(in srgb, var(--accent-amber) 6%, var(--surface))",
        border: "1px solid var(--border)",
      }}
    >
      {/* User info */}
      <div
        className="flex items-center justify-center gap-2 mb-3"
      >
        <Link
          href={`/profile/${streak.username}`}
          className="font-sans font-semibold text-sm hover:underline"
          style={{ color: "var(--text-primary)" }}
        >
          {streak.displayName || streak.username}
        </Link>
      </div>

      {/* Fire emoji */}
      <div
        className="text-5xl mb-2"
        style={{
          filter: "drop-shadow(0 2px 8px color-mix(in srgb, var(--accent-amber) 30%, transparent))",
        }}
      >
        🔥
      </div>

      {/* Streak count */}
      <p
        className="font-display text-3xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {streak.currentStreak}-Day Streak
      </p>

      <p
        className="text-xs mt-1 font-mono"
        style={{ color: "var(--text-muted)" }}
      >
        {streak.currentStreak}-day session streak
      </p>

      {/* Reaction footer */}
      <ReactionBar
        showShare={false}
        centered
      />
    </motion.div>
  );
}
