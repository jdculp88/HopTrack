"use client";

import { motion } from "framer-motion";
import Link from "next/link";

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="rounded-xl px-4 py-3 flex items-center gap-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Fire icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{
          background: "color-mix(in srgb, var(--accent-amber) 10%, var(--surface-2))",
        }}
      >
        🔥
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
          <Link
            href={`/profile/${streak.username}`}
            className="font-semibold hover:underline underline-offset-2"
          >
            {(streak.displayName || streak.username).split(" ")[0]}
          </Link>
          <span style={{ color: "var(--text-muted)" }}> hit a </span>
          <span
            className="font-mono font-semibold"
            style={{ color: "var(--accent-amber)" }}
          >
            {streak.currentStreak}-day
          </span>
          <span style={{ color: "var(--text-muted)" }}> streak!</span>
        </p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
          {streak.currentStreak} sessions in a row
        </p>
      </div>
    </motion.div>
  );
}
