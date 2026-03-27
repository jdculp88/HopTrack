"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Compass, UserPlus, Users, X, Beer, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionCard } from "@/components/social/SessionCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getLevelProgress } from "@/lib/xp";
import { useSession } from "@/hooks/useSession";
import type { Profile, Session } from "@/types/database";

interface HomeFeedProps {
  profile: Profile | null;
  sessions: Session[];
  weekStats: { sessions: number; beers: number; uniqueBreweries: number };
  currentUserId: string;
}

type FeedFilter = 'all' | 'friends' | 'you';

export function HomeFeed({ profile, sessions, weekStats, currentUserId }: HomeFeedProps) {
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const levelInfo = profile ? getLevelProgress(profile.xp) : null;

  const { getActiveSession } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show onboarding card for brand new users
  useEffect(() => {
    if (profile && profile.total_checkins === 0 && !localStorage.getItem("hoptrack:onboarding-dismissed")) {
      setShowOnboarding(true);
    }
  }, [profile]);

  // On mount: fetch active session and broadcast to AppShell so the
  // ActiveSessionBanner and global tap wall state are in sync.
  useEffect(() => {
    getActiveSession().then((session) => {
      window.dispatchEvent(
        new CustomEvent('hoptrack:session-changed', {
          detail: session
            ? { session, breweryName: (session as any).brewery?.name ?? 'Brewery' }
            : null,
        })
      );
    });
  }, [getActiveSession]);

  const feedItems = useMemo(() => {
    if (feedFilter === 'all') return sessions;
    if (feedFilter === 'you') return sessions.filter((s) => s.user_id === currentUserId);
    return sessions.filter((s) => s.user_id !== currentUserId);
  }, [sessions, feedFilter, currentUserId]);

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
                Hey, {(profile.display_name ?? profile.username).split(" ")[0]}!
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
              <p className="font-mono font-bold text-[#D4A843] text-xl">{weekStats.beers}</p>
              <p className="text-xs text-[var(--text-muted)]">This Week</p>
            </div>
            <div className="text-center">
              <p className="font-mono font-bold text-[#D4A843] text-xl">{profile.unique_breweries}</p>
              <p className="text-xs text-[var(--text-muted)]">Breweries</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Onboarding Card — first-time users */}
      {showOnboarding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#D4A843]/10 to-transparent border border-[#D4A843]/20 rounded-2xl p-5 relative"
        >
          <button
            onClick={() => { setShowOnboarding(false); localStorage.setItem("hoptrack:onboarding-dismissed", "1"); }}
            className="absolute top-3 right-3 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
          <h3 className="font-display text-lg font-bold text-[#D4A843] mb-1">Welcome to HopTrack! 🍺</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Here&rsquo;s how to get started:</p>
          <div className="space-y-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("hoptrack:open-checkin"))}
              className="flex items-center gap-3 w-full text-left p-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[#D4A843]/30 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#D4A843]/15 flex items-center justify-center">
                <Beer size={16} className="text-[#D4A843]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Start a session</p>
                <p className="text-xs text-[var(--text-muted)]">Visit a brewery or drink at home</p>
              </div>
            </button>
            <Link
              href="/explore"
              className="flex items-center gap-3 w-full text-left p-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[#D4A843]/30 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#D4A843]/15 flex items-center justify-center">
                <MapPin size={16} className="text-[#D4A843]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Explore breweries</p>
                <p className="text-xs text-[var(--text-muted)]">Find breweries near you</p>
              </div>
            </Link>
            <Link
              href="/friends"
              className="flex items-center gap-3 w-full text-left p-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[#D4A843]/30 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#D4A843]/15 flex items-center justify-center">
                <UserPlus size={16} className="text-[#D4A843]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Add friends</p>
                <p className="text-xs text-[var(--text-muted)]">See what your friends are drinking</p>
              </div>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Feed Header + Filter */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#D4A843]" />
          <h2 className="font-display font-semibold text-[var(--text-primary)]">Activity Feed</h2>
        </div>
        <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-0.5">
          {([
            { key: 'all' as FeedFilter, label: 'All' },
            { key: 'friends' as FeedFilter, label: 'Friends', icon: Users },
            { key: 'you' as FeedFilter, label: 'You' },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFeedFilter(key)}
              className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all",
                feedFilter === key
                  ? "bg-[#D4A843] text-[#0F0E0C]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {Icon && <Icon size={11} />}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {feedItems.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="space-y-4">
          {feedItems.map((session, i) => (
            <motion.div
              key={`s-${session.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <SessionCard session={session as any} currentUserId={currentUserId} />
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
