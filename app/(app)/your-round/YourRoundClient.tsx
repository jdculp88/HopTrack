"use client";

// Your Round Client — Sprint 162 (The Identity)
// Renders the weekly Wrapped experience with "This Week" branding.

import { motion } from "motion/react";
import { Beer } from "lucide-react";
import Link from "next/link";
import { WrappedExperience } from "@/components/wrapped/WrappedExperience";
import { getYourRoundShareText } from "@/lib/your-round";
import { generateOGImageUrl } from "@/lib/share";
import type { WrappedStats } from "@/lib/wrapped";

interface YourRoundClientProps {
  userId: string;
  username: string;
  initialStats: WrappedStats;
}

export function YourRoundClient({ userId, username, initialStats }: YourRoundClientProps) {
  // Empty state — no beers this week
  if (!initialStats || initialStats.totalBeers === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "var(--bg)" }}
      >
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Beer size={40} className="mx-auto mb-4" style={{ color: "var(--accent-gold)" }} />
          <h2
            className="font-display text-2xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            No pours this week
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Your Round is your weekly recap. Start a session — even a single
            beer at home — and your first highlights land here.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            Pour One
          </Link>
        </motion.div>
      </div>
    );
  }

  const shareText = getYourRoundShareText(initialStats);
  const shareUrl = generateOGImageUrl("weekly", {
    user_id: userId,
    week_start: initialStats.period.start,
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg)" }}
    >
      <WrappedExperience
        stats={initialStats}
        username={username}
        variant="week"
        shareTitle="My HopTrack Round"
        shareUrl={shareUrl}
        customShareText={shareText}
      />
    </div>
  );
}
