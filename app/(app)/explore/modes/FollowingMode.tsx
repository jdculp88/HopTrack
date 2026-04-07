"use client";

// FollowingMode — Sprint 160 (The Flow)
// Shows friend check-ins (last 7d) + new beers at followed breweries.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Users, MapPin, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { spring, stagger } from "@/lib/animation";

interface FriendCheckin {
  beer_id: string;
  name: string;
  style: string | null;
  brewery_id: string | null;
  brewery_name: string | null;
  count: number;
  friendNames: string[];
}

interface NewBeer {
  beer_id: string;
  name: string;
  style: string | null;
  abv: number | null;
  brewery_id: string;
  brewery_name: string | null;
  created_at: string;
}

export function FollowingMode() {
  const [loading, setLoading] = useState(true);
  const [friendCheckins, setFriendCheckins] = useState<FriendCheckin[]>([]);
  const [newAtFollowed, setNewAtFollowed] = useState<NewBeer[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [followedCount, setFollowedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchFollowing() {
      try {
        const res = await fetch("/api/explore/following");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setFriendCheckins(json.data?.friendCheckins ?? []);
        setNewAtFollowed(json.data?.newAtFollowed ?? []);
        setFriendCount(json.meta?.friendCount ?? 0);
        setFollowedCount(json.meta?.followedCount ?? 0);
      } catch {
        // Silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchFollowing();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-5 w-40 mb-3" />
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[180px] rounded-2xl border p-3 space-y-2"
                style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
              >
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (friendCount === 0 && followedCount === 0) {
    return (
      <EmptyState
        emoji="👥"
        title="Follow to fill this tab"
        description="Add friends and follow breweries — their activity will show up here."
        size="md"
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Friend Check-ins */}
      {friendCheckins.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Friends Are Drinking
            </h3>
          </div>
          <motion.div
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-proximity"
            {...stagger.container(0.05)}
            initial="initial"
            animate="animate"
          >
            {friendCheckins.map((item, i) => (
              <motion.div
                key={item.beer_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ...spring.default }}
                className="snap-start"
              >
                <Link href={`/beer/${item.beer_id}`}>
                  <Card padding="compact" hoverable className="w-[190px] flex-shrink-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-display font-bold" style={{ color: "var(--accent-gold)" }}>
                        #{i + 1}
                      </span>
                      <Users size={14} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </p>
                    {item.style && (
                      <p
                        className="text-[10px] font-mono uppercase tracking-wider truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.style}
                      </p>
                    )}
                    {item.brewery_name && (
                      <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {item.brewery_name}
                      </p>
                    )}
                    <div className="flex items-center gap-1 pt-0.5">
                      <Users size={10} style={{ color: "var(--accent-gold)" }} />
                      <span
                        className="text-[10px] font-mono truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.friendNames.slice(0, 3).join(", ")}
                        {item.friendNames.length > 3 ? ` +${item.friendNames.length - 3}` : ""}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* New at Followed Breweries */}
      {newAtFollowed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              New at Your Follows
            </h3>
          </div>
          <div className="space-y-3">
            {newAtFollowed.map((beer, i) => (
              <motion.div
                key={beer.beer_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, ...spring.default }}
              >
                <Link href={`/beer/${beer.beer_id}`}>
                  <div className="card-bg-reco flex items-center gap-3 p-3 border border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 rounded-2xl transition-colors">
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                      style={{ background: "var(--surface-2)" }}
                    >
                      🍺
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {beer.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {beer.style && (
                          <span
                            className="text-[10px] font-mono uppercase tracking-wider"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {beer.style}
                          </span>
                        )}
                        {beer.brewery_name && (
                          <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                            <MapPin size={9} className="inline" /> {beer.brewery_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--accent-gold)] flex-shrink-0">NEW</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Partial empty states */}
      {friendCheckins.length === 0 && followedCount > 0 && (
        <div className="text-center py-6 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
          <p className="text-sm text-[var(--text-muted)]">
            {friendCount === 0
              ? "Add friends to see what they're drinking"
              : "Your friends haven't checked in this week"}
          </p>
        </div>
      )}

      {newAtFollowed.length === 0 && friendCheckins.length > 0 && (
        <div className="text-center py-6 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
          <p className="text-sm text-[var(--text-muted)]">
            {followedCount === 0
              ? "Follow breweries to see new tap arrivals"
              : "No new beers at your follows this week"}
          </p>
        </div>
      )}
    </div>
  );
}
