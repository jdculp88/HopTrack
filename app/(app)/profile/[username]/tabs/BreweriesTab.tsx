"use client";

// BreweriesTab — Sprint 160 (The Flow)
// Shows brewery relationships: Favorite Breweries (top 10), Mug Club Memberships.

import Link from "next/link";
import { MugClubMemberships } from "@/components/profile/MugClubMemberships";
import { EmptyState } from "@/components/ui/EmptyState";
import { generateGradientFromString } from "@/lib/utils";

interface BreweryVisit {
  id: string;
  brewery_id: string;
  total_visits: number;
  brewery: {
    name: string | null;
    city: string | null;
    state: string | null;
  } | null;
}

export interface BreweriesTabProps {
  topBreweries: BreweryVisit[];
  mugClubMemberships: unknown[];
}

export function BreweriesTab({ topBreweries, mugClubMemberships }: BreweriesTabProps) {
  return (
    <div className="space-y-8">
      {/* Favorite Breweries */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Favorite Breweries</h2>
        {topBreweries.length > 0 ? (
          <div className="space-y-3">
            {topBreweries.map((visit) => (
              <Link key={visit.id} href={`/brewery/${visit.brewery_id}`}>
                <div className="card-bg-hoproute flex items-center gap-3 p-3 border border-[var(--border)] hover:border-[var(--accent-amber)]/40 rounded-2xl transition-colors">
                  <div
                    className="w-12 h-12 rounded-xl flex-shrink-0"
                    style={{ background: generateGradientFromString(visit.brewery?.name ?? "") }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-[var(--text-primary)] truncate">
                      {visit.brewery?.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {visit.brewery?.city}, {visit.brewery?.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-[var(--accent-gold)]">{visit.total_visits}</p>
                    <p className="text-xs text-[var(--text-muted)]">visits</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Link href="/explore">
            <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)] hover:border-[var(--accent-gold)]/30 transition-colors">
              <p className="text-3xl mb-2">🏠</p>
              <p className="font-display text-base text-[var(--text-primary)]">No regular haunts yet</p>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Visit a few taprooms and your favorites will show up here.
              </p>
            </div>
          </Link>
        )}
      </div>

      {/* Mug Club Memberships */}
      <div>
        {mugClubMemberships.length > 0 ? (
          <MugClubMemberships memberships={mugClubMemberships as any[]} />
        ) : (
          <EmptyState
            emoji="🍺"
            title="Join a Mug Club"
            description="Members get exclusive perks at their favorite breweries"
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
