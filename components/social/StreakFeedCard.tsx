"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Flame } from "lucide-react";
import { EmojiPulse } from "@/components/social/EmojiPulse";

export interface StreakData {
  profileId: string;
  username: string;
  displayName: string;
  currentStreak: number;
}

const STREAK_MILESTONES = [3, 5, 7, 14, 21, 30, 50, 100];

const LARGE_BUBBLE_POS = [
  "absolute -top-3 -right-3",
  "absolute top-0 -right-4",
  "absolute -top-2 right-8",
  "absolute top-3 -right-2",
] as const;

const SMALL_BUBBLE_POS = [
  "absolute bottom-1 right-10",
  "absolute bottom-2 right-4",
  "absolute bottom-3 right-16",
  "absolute bottom-1 right-7",
] as const;

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
  const bubbleIdx = index % 4;

  useEffect(() => {
    const t = setTimeout(() => markStreakSeen(streak.profileId, streak.currentStreak), 3000);
    return () => clearTimeout(t);
  }, [streak.profileId, streak.currentStreak]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="rounded-2xl p-4 relative overflow-hidden flex items-center gap-4"
      style={{
        background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-amber) 14%, var(--surface)), var(--surface))",
        border: "1px solid color-mix(in srgb, var(--accent-amber) 26%, var(--border))",
      }}
    >
      {/* Bubble decorations */}
      <div className={`${LARGE_BUBBLE_POS[bubbleIdx]} w-14 h-14 rounded-full pointer-events-none`} style={{ background: "var(--accent-amber)", opacity: 0.07 }} />
      <div className={`${SMALL_BUBBLE_POS[bubbleIdx]} w-4 h-4 rounded-full pointer-events-none`} style={{ background: "var(--accent-amber)", opacity: 0.09 }} />

      {/* Left: label + friend + subtext + EmojiPulse */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-1.5 mb-1">
          <Flame size={12} strokeWidth={1.75} style={{ color: "var(--accent-amber)" }} />
          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--accent-amber)" }}>
            On Fire
          </span>
        </div>
        <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
          <Link href={`/profile/${streak.username}`} className="hover:underline underline-offset-2">
            {(streak.displayName || streak.username).split(" ")[0]}
          </Link>
          <span style={{ color: "var(--text-muted)" }}> is on a streak</span>
        </p>
        <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
          {streak.currentStreak} sessions in a row
        </p>
        <EmojiPulse itemKey={`streak-${streak.profileId}-${streak.currentStreak}`} />
      </div>

      {/* Right: BIG NUMBER */}
      <div className="flex flex-col items-center flex-shrink-0 relative z-10">
        <span
          className="font-mono font-black leading-none"
          style={{ fontSize: "3.25rem", color: "var(--accent-amber)", lineHeight: 1 }}
        >
          {streak.currentStreak}
        </span>
        <span
          className="text-[10px] font-mono uppercase tracking-widest mt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          days
        </span>
      </div>
    </motion.div>
  );
}
