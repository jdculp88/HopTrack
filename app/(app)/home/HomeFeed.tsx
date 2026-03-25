"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Zap, Compass, UserPlus } from "lucide-react";
import { CheckinCard } from "@/components/social/CheckinCard";
import { SkeletonCheckinCard } from "@/components/ui/SkeletonLoader";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getLevelProgress } from "@/lib/xp";
import type { Profile, CheckinWithDetails } from "@/types/database";

interface HomeFeedProps {
  profile: Profile | null;
  checkins: CheckinWithDetails[];
  weekStats: { checkins: number; uniqueBreweries: number };
  currentUserId: string;
}

export function HomeFeed({ profile, checkins, weekStats, currentUserId }: HomeFeedProps) {
  const [localCheckins, setLocalCheckins] = useState(checkins);
  const levelInfo = profile ? getLevelProgress(profile.xp) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome / Stats Header */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5"
        >
          <div className="flex items-center gap-4 mb-4">
            <UserAvatar profile={profile} size="lg" showLevel />
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl font-bold text-[var(--text-primary)] leading-tight">
                Hey, {profile.display_name.split(" ")[0]}!
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {levelInfo?.current.name} · Level {profile.level}
              </p>
            </div>
          </div>

          {/* XP Progress */}
          {levelInfo && levelInfo.next && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>{profile.xp.toLocaleString()} XP</span>
                <span>{levelInfo.xpToNext} XP to Level {levelInfo.next.level}</span>
              </div>
              <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progress}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-[#D4A843] to-[#E8841A] rounded-full"
                />
              </div>
            </div>
          )}

          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-center">
              <p className="font-mono font-bold text-[#D4A843] text-xl">{profile.total_checkins}</p>
              <p className="text-xs text-[var(--text-muted)]">Total</p>
            </div>
            <div className="text-center">
              <p className="font-mono font-bold text-[#D4A843] text-xl">{weekStats.checkins}</p>
              <p className="text-xs text-[var(--text-muted)]">This Week</p>
            </div>
            <div className="text-center">
              <p className="font-mono font-bold text-[#D4A843] text-xl">{profile.unique_breweries}</p>
              <p className="text-xs text-[var(--text-muted)]">Breweries</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feed Header */}
      <div className="flex items-center gap-2 pt-2">
        <Zap size={16} className="text-[#D4A843]" />
        <h2 className="font-display font-semibold text-[var(--text-primary)]">Activity Feed</h2>
      </div>

      {/* Checkins */}
      {localCheckins.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="space-y-4">
          {localCheckins.map((checkin, i) => (
            <motion.div
              key={checkin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <CheckinCard
                checkin={checkin}
                onReact={(id, type) => {
                  // TODO: optimistic update
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyFeed() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 space-y-5"
    >
      <span className="text-6xl block">🍺</span>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-bold text-[var(--text-primary)]">Your feed is thirsty</h3>
        <p className="text-[var(--text-secondary)] max-w-xs mx-auto text-sm leading-relaxed">
          Check in at a brewery or follow some friends to fill your feed with activity.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/explore"
          className="inline-flex items-center justify-center gap-2 bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-semibold text-sm px-5 py-3 rounded-xl transition-all"
        >
          <Compass size={15} />
          Explore Breweries
        </Link>
        <Link
          href="/friends"
          className="inline-flex items-center justify-center gap-2 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] font-medium text-sm px-5 py-3 rounded-xl transition-all"
        >
          <UserPlus size={15} />
          Find Friends
        </Link>
      </div>
    </motion.div>
  );
}
