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
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Favorite Beer</h2>
        {favBeer ? (
          <Link href={`/beer/${favBeer.beer.id}`}>
            <div
              className="card-bg-reco flex items-center gap-4 p-4 rounded-2xl transition-all group hover:scale-[1.01]"
              data-style={getStyleFamily(favBeer.beer.style)}
              style={{
                border: "1px solid var(--card-border)",
                borderLeft: `3px solid ${getStyleVars(favBeer.beer.style).primary}`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
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
          <div className="text-center py-10 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
            <p className="text-3xl mb-2">🍺</p>
            <p className="font-display text-base text-[var(--text-primary)]">Still exploring the menu</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Your most-poured beer will earn its spot here.
            </p>
          </div>
        )}
      </div>

      {/* Beer Journal */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Beer Journal</h2>
        {recentLogs.length > 0 ? (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <Link key={log.id} href={`/beer/${log.beer?.id ?? ""}`}>
                <div
                  className="card-bg-reco flex items-center gap-3 p-3.5 rounded-2xl transition-all hover:scale-[1.01]"
                  data-style={getStyleFamily(log.beer?.style ?? null)}
                  style={{
                    border: "1px solid var(--card-border)",
                    borderLeft: `3px solid ${getStyleVars(log.beer?.style ?? null).primary}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${getStyleVars(log.beer?.style ?? null).light}, ${getStyleVars(log.beer?.style ?? null).soft ?? getStyleVars(log.beer?.style ?? null).light})`,
                    }}
                  >
                    🍺
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm text-[var(--text-primary)] truncate">
                      {log.beer?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {log.beer?.style && <BeerStyleBadge style={log.beer.style} size="xs" />}
                      <span className="text-xs text-[var(--text-muted)]">
                        {log.session?.brewery?.name ?? "At home"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {log.rating != null && log.rating > 0 && (
                      <div className="flex items-center gap-1 justify-end mb-0.5">
                        <Star size={11} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
                        <span className="text-sm font-mono font-bold text-[var(--accent-gold)]">{log.rating}</span>
                      </div>
                    )}
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(log.logged_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)]">
            <p className="text-3xl mb-2">📓</p>
            <p className="font-display text-base text-[var(--text-primary)]">The journal is empty</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Start a session to begin tracking your pours.</p>
          </div>
        )}
      </div>
    </div>
  );
}
