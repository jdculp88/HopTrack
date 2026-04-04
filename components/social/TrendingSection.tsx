"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, Beer, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { PILL_ACTIVE, PILL_INACTIVE } from "@/lib/constants/ui";
import { spring, stagger } from "@/lib/animation";
import type { TrendingItem } from "@/lib/trending";

type Tab = "beer" | "brewery";

export function TrendingSection() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("beer");

  useEffect(() => {
    let cancelled = false;
    async function fetchTrending() {
      try {
        const res = await fetch("/api/trending?limit=10");
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
  }, []);

  const filteredItems = items.filter((item) => item.content_type === activeTab);

  // Don't render at all if no trending data after load
  if (!loading && items.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} style={{ color: "var(--accent-gold)" }} />
          <h3
            className="font-display text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Trending Near You
          </h3>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2">
        {(["beer", "brewery"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors"
            style={activeTab === tab ? PILL_ACTIVE : PILL_INACTIVE}
          >
            {tab === "beer" ? "Beers" : "Breweries"}
          </button>
        ))}
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[180px] rounded-2xl border p-3 space-y-2"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <Skeleton className="h-5 w-8 rounded" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Cards */}
      {!loading && filteredItems.length > 0 && (
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

      {/* Empty state */}
      {!loading && filteredItems.length === 0 && items.length > 0 && (
        <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
          No trending {activeTab === "beer" ? "beers" : "breweries"} right now — check back soon!
        </p>
      )}
    </div>
  );
}
