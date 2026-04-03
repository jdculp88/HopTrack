"use client";

import { useState } from "react";
import { Sparkles, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { FeedCardWrapper } from "./FeedCardWrapper";
import { Pill } from "@/components/ui/Pill";
import type { AIRecommendedBeer } from "@/lib/recommendations";

interface AIRecommendationFeedCardProps {
  recommendations: AIRecommendedBeer[];
}

export function AIRecommendationFeedCard({ recommendations }: AIRecommendationFeedCardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState(recommendations);

  if (items.length === 0) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/recommendations/ai", { method: "POST" });
      const json = await res.json();
      if (json.data?.recommendations?.length) {
        setItems(json.data.recommendations);
      }
    } catch {
      // Silent fail — keep existing items
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* Section label */}
      <div className="flex items-center justify-between px-1">
        <p
          className="text-[10px] font-mono uppercase tracking-widest font-medium"
          style={{ color: "var(--accent-gold)" }}
        >
          Brewed for You
        </p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-[10px] font-mono transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ color: "var(--text-muted)" }}
        >
          {refreshing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
          Refresh
        </button>
      </div>

      <FeedCardWrapper
        accentColor="var(--accent-gold)"
        icon={<Sparkles size={22} strokeWidth={1.75} />}
        ariaLabel="AI-powered beer recommendations"
        bgClass="card-bg-reco"
      >
        <div className="px-4 py-3 space-y-3">
          {items.slice(0, 3).map((beer, i) => (
            <Link
              key={beer.id}
              href={`/beer/${beer.id}`}
              className="block group"
            >
              <div
                className="flex items-start gap-3 p-2.5 rounded-xl transition-colors hover:bg-[var(--surface-2)]"
                style={{
                  background: i === 0
                    ? "color-mix(in srgb, var(--accent-gold) 5%, transparent)"
                    : "transparent",
                }}
              >
                {/* Rank badge */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-mono font-bold"
                  style={{
                    background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                    color: "var(--accent-gold)",
                  }}
                >
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Beer name + brewery */}
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {beer.name}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                    {beer.brewery?.name}{beer.brewery?.city ? ` · ${beer.brewery.city}` : ""}
                  </p>

                  {/* Style + rating */}
                  <div className="flex items-center gap-2 mt-1.5">
                    {beer.style && (
                      <Pill size="xs" variant="muted">{beer.style}</Pill>
                    )}
                    {beer.avg_rating && (
                      <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--accent-gold)" }}>
                        <Star size={9} fill="currentColor" /> {beer.avg_rating.toFixed(1)}
                      </span>
                    )}
                    {beer.abv && (
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                        {beer.abv}%
                      </span>
                    )}
                  </div>

                  {/* AI reason */}
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {beer.aiReason}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </FeedCardWrapper>
    </div>
  );
}
