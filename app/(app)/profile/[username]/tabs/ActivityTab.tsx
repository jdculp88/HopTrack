"use client";

// ActivityTab — Sprint 160 (The Flow)
// Shows drinker activity: Favorite Beer, Beer Journal, StreakDisplay.

import Link from "next/link";
import { Star } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { StreakDisplay } from "@/components/profile/StreakDisplay";
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
      {/* Streak Display */}
      {(currentStreak > 0 || longestStreak > 0) && (
        <StreakDisplay
          currentStreak={currentStreak}
          bestStreak={longestStreak}
          freezesAvailable={freezesAvailable}
        />
      )}

      {/* Favorite Beer */}
      <div>
        <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] mb-4">Favorite Beer</h2>
        {favBeer ? (
          <Link href={`/beer/${favBeer.beer.id}`}>
            <div
              className="card-bg-reco flex items-center gap-4 p-4 rounded-[14px] transition-all group hover:scale-[1.01]"
              data-style={getStyleFamily(favBeer.beer.style)}
              style={{
                border: "1px solid var(--card-border)",
                borderLeft: `3px solid ${getStyleVars(favBeer.beer.style).primary}`,
              }}
            >
              <div
                className="w-14 h-14 rounded-[14px] flex-shrink-0 flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${getStyleVars(favBeer.beer.style).light}, ${getStyleVars(favBeer.beer.style).soft ?? getStyleVars(favBeer.beer.style).light})`,
                }}
              >
                🍺
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
                  {favBeer.beer.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {favBeer.beer.style && <BeerStyleBadge style={favBeer.beer.style} size="xs" />}
                  {favBeer.beer.abv && (
                    <span className="text-xs font-mono text-[var(--text-muted)]">{formatABV(favBeer.beer.abv)}</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {favBeer.beer.avg_rating && (
                  <div className="flex items-center gap-1 justify-end mb-0.5">
                    <Star size={11} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
                    <span className="text-sm font-mono font-bold text-[var(--accent-gold)]">
                      {favBeer.beer.avg_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-[var(--text-muted)]">{favBeer.count}× poured</p>
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
                    className="flex items-center gap-2.5 px-3.5 py-2.5 transition-colors hover:bg-[var(--warm-bg,var(--surface-2))]"
                    style={{
                      borderBottom: i < groupJournalEntries(recentLogs).length - 1 ? "1px solid var(--border)" : "none",
                      borderLeft: `3px solid ${styleVars.primary}`,
                    }}
                  >
                    {/* Glass icon thumbnail — 36x36, style tint bg */}
                    <div
                      className="w-9 h-9 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: styleVars.light,
                        border: `1px solid color-mix(in srgb, ${styleVars.primary} 15%, transparent)`,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={styleVars.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                        <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z"/>
                        <path d="M8 3c0 0 .5 2 4 2s4-2 4-2"/>
                      </svg>
                    </div>
                    {/* Beer info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                        {entry.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {entry.style && <BeerStyleBadge style={entry.style} size="xs" />}
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {entry.brewery}
                        </span>
                      </div>
                    </div>
                    {/* Count badge OR rating */}
                    {entry.count > 1 && (
                      <span
                        className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-[5px] flex-shrink-0"
                        style={{ background: "var(--warm-bg, var(--surface-2))", color: "var(--text-muted)" }}
                      >
                        ×{entry.count}
                      </span>
                    )}
                    {entry.rating != null && entry.rating > 0 && (
                      <span className="font-mono text-[13px] font-bold flex-shrink-0" style={{ color: "var(--amber, var(--accent-gold))" }}>
                        ★ {entry.rating.toFixed(1)}
                      </span>
                    )}
                    {/* Date */}
                    <span className="font-mono text-[10px] text-[var(--text-muted)] flex-shrink-0">
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
