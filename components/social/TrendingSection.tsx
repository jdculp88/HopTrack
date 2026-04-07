"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { TrendingUp, Beer, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { PILL_ACTIVE, PILL_INACTIVE } from "@/lib/constants/ui";
import { spring, stagger } from "@/lib/animation";
import type { TrendingItem } from "@/lib/trending";

type Tab = "beer" | "brewery" | "friends";

interface FriendsTrendingItem {
  beer_id: string;
  name: string;
  style: string | null;
  brewery_name: string | null;
  count: number;
  friends: string[];
}

const STYLE_FILTERS = ["All", "IPA", "Stout", "Lager", "Sour", "Pale Ale", "Other"] as const;
type StyleFilter = (typeof STYLE_FILTERS)[number];

/** Check if a beer style matches a filter category */
function matchesStyleFilter(style: string | null | undefined, filter: StyleFilter): boolean {
  if (filter === "All") return true;
  if (!style) return filter === "Other";
  const lower = style.toLowerCase();
  if (filter === "IPA") return lower.includes("ipa");
  if (filter === "Stout") return lower.includes("stout");
  if (filter === "Lager") return lower.includes("lager") || lower.includes("pilsner");
  if (filter === "Sour") return lower.includes("sour") || lower.includes("gose") || lower.includes("lambic");
  if (filter === "Pale Ale") return lower.includes("pale ale") && !lower.includes("ipa");
  // "Other" — doesn't match any of the above
  return !["ipa", "stout", "lager", "pilsner", "sour", "gose", "lambic", "pale ale"].some((k) => lower.includes(k));
}

interface TrendingSectionProps {
  defaultCity?: string;
}

export function TrendingSection({ defaultCity }: TrendingSectionProps) {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [friendsItems, setFriendsItems] = useState<FriendsTrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("beer");
  const [cityFilter, setCityFilter] = useState(defaultCity ?? "");
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("All");

  // Fetch global trending data
  useEffect(() => {
    let cancelled = false;
    async function fetchTrending() {
      try {
        const params = new URLSearchParams({ limit: "10" });
        if (cityFilter) params.set("city", cityFilter);
        const res = await fetch(`/api/trending?${params}`);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setItems(json.data?.trending ?? []);
      } catch {
        // Silent — trending is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTrending();
    return () => { cancelled = true; };
  }, [cityFilter]);

  // Fetch friends trending when tab is active
  useEffect(() => {
    if (activeTab !== "friends") return;
    let cancelled = false;
    setFriendsLoading(true);
    async function fetchFriends() {
      try {
        const res = await fetch("/api/trending/friends");
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setFriendsItems(json.data ?? []);
      } catch {
        // Silent
      } finally {
        if (!cancelled) setFriendsLoading(false);
      }
    }
    fetchFriends();
    return () => { cancelled = true; };
  }, [activeTab]);

  // Derive available cities from trending items for the dropdown
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    for (const item of items) {
      if (item.city) cities.add(item.city);
    }
    return [...cities].sort();
  }, [items]);

  // Filter trending items by tab and style
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.content_type === activeTab)
      .filter((item) => {
        if (activeTab !== "beer") return true;
        return matchesStyleFilter(item.style, styleFilter);
      });
  }, [items, activeTab, styleFilter]);

  // Filter friends items by style
  const filteredFriendsItems = useMemo(() => {
    return friendsItems.filter((item) => matchesStyleFilter(item.style, styleFilter));
  }, [friendsItems, styleFilter]);

  // Don't render at all if no trending data after load
  if (!loading && items.length === 0 && friendsItems.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header + City filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} style={{ color: "var(--accent-gold)" }} />
          <h3
            className="font-display text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Trending Near You
          </h3>
        </div>
        {activeTab !== "friends" && availableCities.length > 1 && (
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="text-xs rounded-lg border px-2 py-1 bg-transparent"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <option value="">All Cities</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2">
        {(["beer", "brewery", "friends"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setStyleFilter("All"); }}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors"
            style={activeTab === tab ? PILL_ACTIVE : PILL_INACTIVE}
          >
            {tab === "beer" ? "Beers" : tab === "brewery" ? "Breweries" : "Friends"}
          </button>
        ))}
      </div>

      {/* Style sub-filter pills (beer + friends tabs only) */}
      {(activeTab === "beer" || activeTab === "friends") && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {STYLE_FILTERS.map((sf) => (
            <button
              key={sf}
              onClick={() => setStyleFilter(sf)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider border transition-colors whitespace-nowrap"
              style={styleFilter === sf
                ? { background: "var(--accent-gold)", color: "var(--bg)", borderColor: "var(--accent-gold)" }
                : { background: "transparent", color: "var(--text-muted)", borderColor: "var(--border)" }
              }
            >
              {sf}
            </button>
          ))}
        </div>
      )}

      {/* Loading shimmer */}
      {loading && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[180px] rounded-2xl border p-3 space-y-2"
              style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
            >
              <Skeleton className="h-5 w-8 rounded" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Cards — Beer / Brewery tabs */}
      {activeTab !== "friends" && !loading && filteredItems.length > 0 && (
        <motion.div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-proximity"
          {...stagger.container(0.05)}
          initial="initial"
          animate="animate"
        >
          {filteredItems.slice(0, 10).map((item, i) => (
            <motion.div
              key={`${item.content_type}-${item.content_id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ...spring.default }}
              className="snap-start"
            >
              <Link
                href={
                  item.content_type === "beer"
                    ? `/beer/${item.content_id}`
                    : `/brewery/${item.content_id}`
                }
              >
                <Card
                  padding="compact"
                  hoverable
                  className="w-[180px] flex-shrink-0 space-y-1.5"
                >
                  {/* Rank badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-display font-bold"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      #{i + 1}
                    </span>
                    <span className="text-sm">
                      {item.content_type === "beer" ? <Beer size={14} style={{ color: "var(--text-muted)" }} /> : <MapPin size={14} style={{ color: "var(--text-muted)" }} />}
                    </span>
                  </div>

                  {/* Name */}
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.name}
                  </p>

                  {/* Subtext */}
                  {item.content_type === "beer" && (
                    <>
                      {item.style && (
                        <p
                          className="text-[10px] font-mono uppercase tracking-wider truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.style}
                        </p>
                      )}
                      {item.brewery_name && (
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.brewery_name}
                        </p>
                      )}
                    </>
                  )}
                  {item.content_type === "brewery" && (
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {[item.city, item.state].filter(Boolean).join(", ")}
                    </p>
                  )}

                  {/* Activity indicator */}
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="text-xs">
                      {item.checkin_count_24h > 10 ? "\uD83D\uDD25" : "\uD83D\uDCCA"}
                    </span>
                    <span
                      className="text-[10px] font-mono"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.checkin_count_24h} check-ins
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Cards — Friends tab */}
      {activeTab === "friends" && !friendsLoading && filteredFriendsItems.length > 0 && (
        <motion.div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-proximity"
          {...stagger.container(0.05)}
          initial="initial"
          animate="animate"
        >
          {filteredFriendsItems.map((item, i) => (
            <motion.div
              key={item.beer_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, ...spring.default }}
              className="snap-start"
            >
              <Link href={`/beer/${item.beer_id}`}>
                <Card
                  padding="compact"
                  hoverable
                  className="w-[180px] flex-shrink-0 space-y-1.5"
                >
                  {/* Rank badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg font-display font-bold"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      #{i + 1}
                    </span>
                    <Users size={14} style={{ color: "var(--text-muted)" }} />
                  </div>

                  {/* Name */}
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.name}
                  </p>

                  {/* Style */}
                  {item.style && (
                    <p
                      className="text-[10px] font-mono uppercase tracking-wider truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.style}
                    </p>
                  )}

                  {/* Brewery */}
                  {item.brewery_name && (
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {item.brewery_name}
                    </p>
                  )}

                  {/* Friends who checked in */}
                  <div className="flex items-center gap-1 pt-0.5">
                    <Users size={10} style={{ color: "var(--accent-gold)" }} />
                    <span
                      className="text-[10px] font-mono truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.friends.slice(0, 3).join(", ")}
                      {item.friends.length > 3 ? ` +${item.friends.length - 3}` : ""}
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state — Beer/Brewery tabs */}
      {activeTab !== "friends" && !loading && filteredItems.length === 0 && items.length > 0 && (
        <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
          No trending {activeTab === "beer" ? "beers" : "breweries"}{styleFilter !== "All" ? ` (${styleFilter})` : ""} right now — check back soon!
        </p>
      )}

      {/* Empty state — Friends tab */}
      {activeTab === "friends" && !friendsLoading && filteredFriendsItems.length === 0 && (
        <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
          {friendsItems.length === 0
            ? "Your friends haven\u2019t checked in any beers this week. Time to lead by example!"
            : `No friend check-ins matching ${styleFilter} this week.`}
        </p>
      )}
    </div>
  );
}
