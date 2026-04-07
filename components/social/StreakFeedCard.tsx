"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { EmojiPulse } from "@/components/social/EmojiPulse";
import { getFirstName } from "@/lib/first-name";

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
  useEffect(() => {
    const t = setTimeout(() => markStreakSeen(streak.profileId, streak.currentStreak), 3000);
    return () => clearTimeout(t);
  }, [streak.profileId, streak.currentStreak]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="card-bg-streak rounded-[14px] relative overflow-hidden flex items-center gap-4"
      style={{
        border: "1px solid var(--border)",
        padding: "18px 20px",
      }}
    >
      {/* 3px top bar — warning → gold gradient (Card Type 8) */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, var(--func-warning, var(--streak-flame)), #F4D35E)" }}
      />
      {/* Radial amber glow at left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 10% 50%, rgba(232,168,56,0.06) 0%, transparent 60%)" }}
      />

      {/* 48x48 fire icon container */}
      <div
        className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 relative z-10"
        style={{
          background: "linear-gradient(135deg, rgba(244,211,94,0.12), rgba(232,168,56,0.08))",
          border: "1px solid rgba(232,168,56,0.12)",
        }}
      >
        <span className="text-2xl">🔥</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
          <Link href={`/profile/${streak.username}`} className="hover:underline underline-offset-2">
            {getFirstName(streak.displayName, streak.username)}
          </Link>
          <span style={{ color: "var(--text-muted)" }}> is on a streak</span>
        </p>
        <EmojiPulse itemKey={`streak-${streak.profileId}-${streak.currentStreak}`} />
      </div>

      {/* Right: BIG NUMBER — JetBrains Mono 32px/700 */}
      <div className="flex flex-col items-center flex-shrink-0 relative z-10">
        <span
          className="font-mono font-bold leading-none"
          style={{ fontSize: "32px", color: "var(--text-primary)" }}
        >
          {streak.currentStreak}
        </span>
        <span
          className="text-[10px] font-mono mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          day streak
        </span>
      </div>
    </motion.div>
  );
}
