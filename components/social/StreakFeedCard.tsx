"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Flame } from "lucide-react";

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
      className="rounded-2xl overflow-hidden flex"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-amber) 10%, var(--surface)), var(--surface))",
        border:
          "1px solid color-mix(in srgb, var(--accent-amber) 22%, var(--border))",
      }}
    >
      {/* Amber accent bar */}
      <div
        className="w-1 flex-shrink-0"
        style={{ background: "var(--accent-amber)", opacity: 0.7 }}
      />

      {/* Flame icon column */}
      <div
        className="flex items-center justify-center w-14 flex-shrink-0"
        style={{
          background:
            "color-mix(in srgb, var(--accent-amber) 10%, transparent)",
        }}
      >
        <Flame size={22} strokeWidth={1.75} style={{ color: "var(--accent-amber)" }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-3">
        <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
          <Link
            href={`/profile/${streak.username}`}
            className="font-semibold hover:underline underline-offset-2"
          >
            {(streak.displayName || streak.username).split(" ")[0]}
          </Link>
          <span style={{ color: "var(--text-muted)" }}> is on a </span>
          <span
            className="font-display font-bold"
            style={{ color: "var(--accent-amber)" }}
          >
            {streak.currentStreak}-day streak
          </span>
        </p>
        <p
          className="text-[10px] font-mono mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          {streak.currentStreak} sessions in a row
        </p>
      </div>
    </motion.div>
  );
}
