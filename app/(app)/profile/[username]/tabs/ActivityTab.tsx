"use client";

// ActivityTab — Sprint 160 (The Flow)
// Shows drinker activity: Favorite Beer, Beer Journal, StreakDisplay.

import Link from "next/link";
import { Flame, Star } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { StreakCard } from "@/components/ui/StreakCard";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import { formatABV } from "@/lib/utils";

interface BeerLog {
  id: string;
  beer_id: string | null;
  rating: number | null;
  quantity: number | null;
  logged_at: string;
  beer: {
    id: string;
    name: string;
    style: string | null;
    abv: number | null;
  } | null;
  session: {
    brewery: { name: string; city: string | null; state: string | null } | null;
  } | null;
}

interface FavBeer {
  beer: {
    id: string;
    name: string;
    style: string | null;
    abv: number | null;
    avg_rating: number | null;
  };
  count: number;
}

export interface ActivityTabProps {
  recentLogs: BeerLog[];
  favBeer: FavBeer | null;
  currentStreak: number;
  longestStreak: number;
  freezesAvailable: number;
}

export function ActivityTab({
  recentLogs,
  favBeer,
  currentStreak,
  longestStreak,
  freezesAvailable,
}: ActivityTabProps) {
  return (
    <div className="space-y-8">
      {/* Streak card — same StreakCard used on You tab */}
      {(currentStreak > 0 || longestStreak > 0) && (
        <StreakCard
          icon={<Flame size={20} style={{ color: "var(--accent-gold)" }} />}
          streak={currentStreak}
          personalBest={longestStreak || currentStreak}
        />
      )}

      {/* Favorite Beer — amber accent top bar, glass thumbnail, big rating */}
      <div>
        {favBeer ? (
          <Link href={`/beer/${favBeer.beer.id}`}>
            <div
              className="rounded-[14px] overflow-hidden transition-all group hover:scale-[1.01]"
              style={{
                background: "var(--card-bg)",
                border: "1px solid color-mix(in srgb, var(--accent-gold) 25%, var(--border))",
              }}
            >
              {/* Amber top accent bar */}
              <div className="h-[3px]" style={{ background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber))" }} />
              <div className="flex items-center gap-3.5 p-4">
                {/* Glass thumbnail — style tinted */}
                <div
                  className="w-14 h-14 rounded-[14px] flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: `color-mix(in srgb, ${getStyleVars(favBeer.beer.style).primary} 12%, var(--surface-2))`,
                    border: `1px solid color-mix(in srgb, ${getStyleVars(favBeer.beer.style).primary} 18%, transparent)`,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={getStyleVars(favBeer.beer.style).primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                    <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z"/>
                    <path d="M8 3c0 0 .5 2 4 2s4-2 4-2"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Star size={10} style={{ color: "var(--accent-gold)", fill: "var(--accent-gold)" }} />
                    <span className="text-[9px] font-mono uppercase tracking-[0.12em] font-bold" style={{ color: "var(--accent-gold)" }}>
                      Favorite Beer
                    </span>
                  </div>
                  <p className="font-display font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
                    {favBeer.beer.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {favBeer.beer.style && <BeerStyleBadge style={favBeer.beer.style} size="xs" />}
                    {favBeer.beer.abv && (
                      <span className="text-xs font-mono text-[var(--text-muted)]">· {formatABV(favBeer.beer.abv)}</span>
                    )}
                  </div>
                </div>
                {/* Big rating + pour count */}
                <div className="flex flex-col items-end flex-shrink-0">
                  {favBeer.beer.avg_rating && (
                    <span className="font-mono text-2xl font-bold leading-none" style={{ color: "var(--accent-gold)" }}>
                      {favBeer.beer.avg_rating.toFixed(1)}
                    </span>
                  )}
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={8}
                        style={{
                          color: "var(--accent-gold)",
                          fill: favBeer.beer.avg_rating && j < Math.round(favBeer.beer.avg_rating) ? "var(--accent-gold)" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {favBeer.count}x poured
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="text-center py-10 bg-[var(--card-bg)] rounded-[14px] border border-[var(--card-border)]">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3"
                 style={{ background: "var(--warm-bg, var(--surface-2))" }}>
              <Star size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-display text-base text-[var(--text-primary)]">Still exploring the menu</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Your most-poured beer will earn its spot here.
            </p>
          </div>
        )}
      </div>

      {/* Beer Journal — Card Type 16: Grouped entries (audit #8) */}
      <div>
        <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] mb-4">Beer Journal</h2>
        {recentLogs.length > 0 ? (
          <div
            className="rounded-[14px] border overflow-hidden"
            style={{ background: "var(--card-bg, #FFFFFF)", borderColor: "var(--border)" }}
          >
            {groupJournalEntries(recentLogs).map((entry, i) => {
              const styleVars = getStyleVars(entry.style);
              return (
                <Link key={entry.key} href={`/beer/${entry.beerId}`}>
                  <div
                    className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-[var(--warm-bg,var(--surface-2))]"
                    style={{
                      borderBottom: i < groupJournalEntries(recentLogs).length - 1 ? "1px solid var(--border)" : "none",
                      borderLeft: `4px solid ${styleVars.primary}`,
                    }}
                  >
                    {/* Glass icon thumbnail — style tint bg */}
                    <div
                      className="w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: `color-mix(in srgb, ${styleVars.primary} 12%, var(--surface-2))`,
                        border: `1px solid color-mix(in srgb, ${styleVars.primary} 18%, transparent)`,
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={styleVars.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                        <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z"/>
                        <path d="M8 3c0 0 .5 2 4 2s4-2 4-2"/>
                      </svg>
                    </div>
                    {/* Beer info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-[var(--text-primary)] truncate">
                        {entry.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {entry.style && <BeerStyleBadge style={entry.style} size="xs" />}
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {entry.brewery}
                        </span>
                      </div>
                    </div>
                    {/* Count badge OR rating — not both per the mockup */}
                    {entry.rating != null && entry.rating > 0 ? (
                      <span
                        className="flex items-center gap-1 flex-shrink-0"
                      >
                        <Star size={13} style={{ color: "var(--accent-gold)", fill: "var(--accent-gold)" }} />
                        <span className="font-mono text-[15px] font-bold" style={{ color: "var(--accent-gold)" }}>
                          {entry.rating.toFixed(1)}
                        </span>
                      </span>
                    ) : entry.count > 1 ? (
                      <span
                        className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-[6px] flex-shrink-0"
                        style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                      >
                        &times;{entry.count}
                      </span>
                    ) : null}
                    {/* Date */}
                    <span className="font-mono text-[11px] text-[var(--text-muted)] flex-shrink-0">
                      {entry.date}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div
            className="text-center py-10 px-6 rounded-[14px]"
            style={{ background: "var(--surface, var(--bg))", border: "1.5px dashed var(--border)" }}
          >
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3"
              style={{ background: "var(--warm-bg, var(--surface-2))" }}
            >
              <Star size={24} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">The journal is empty</p>
            <p className="text-[13px] text-[var(--text-muted)]">Start a session to begin tracking your pours.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Group consecutive same-beer journal entries — Card Type 16 spec */
interface GroupedEntry {
  key: string;
  beerId: string;
  name: string;
  style: string | null;
  brewery: string;
  count: number;
  rating: number | null;
  date: string;
}

function groupJournalEntries(logs: BeerLog[]): GroupedEntry[] {
  const groups: GroupedEntry[] = [];
  for (const log of logs) {
    const last = groups[groups.length - 1];
    const beerId = log.beer?.id ?? "";
    const name = log.beer?.name ?? "Unknown Beer";
    const date = new Date(log.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" });

    // Group consecutive same beer (same beer_id + same date)
    if (last && last.beerId === beerId && last.date === date) {
      last.count++;
      // Keep the highest rating if any
      if (log.rating != null && log.rating > 0) {
        if (last.rating == null || log.rating > last.rating) {
          last.rating = log.rating;
        }
      }
    } else {
      groups.push({
        key: log.id,
        beerId,
        name,
        style: log.beer?.style ?? null,
        brewery: log.session?.brewery?.name ?? "At home",
        count: 1,
        rating: log.rating != null && log.rating > 0 ? log.rating : null,
        date,
      });
    }
  }
  return groups;
}
