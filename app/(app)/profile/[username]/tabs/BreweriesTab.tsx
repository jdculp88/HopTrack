"use client";

// BreweriesTab — Sprint 171 (The Overhaul)
// Brewery passport with meaningful metadata: last visit, unique beers, visit count.
// Proper spacing (space-y-4, p-4). Style-colored accent per brewery.

import Link from "next/link";
import { MapPin, Beer, Clock } from "lucide-react";
import { MugClubMemberships } from "@/components/profile/MugClubMemberships";
import { EmptyState } from "@/components/ui/EmptyState";
import { generateGradientFromString } from "@/lib/utils";

interface BreweryVisit {
  id: string;
  brewery_id: string;
  total_visits: number;
  unique_beers?: number;
  last_visited?: string | null;
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

function formatRelativeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

export function BreweriesTab({ topBreweries, mugClubMemberships }: BreweriesTabProps) {
  return (
    <div className="space-y-8">
      {/* Brewery Passport */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">Brewery Passport</h2>
        {topBreweries.length > 0 ? (
          <div className="space-y-4">
            {topBreweries.map((visit) => {
              const lastVisit = formatRelativeDate(visit.last_visited);
              return (
                <Link key={visit.id} href={`/brewery/${visit.brewery_id}`}>
                  <div className="flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 rounded-2xl transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]">
                    {/* Brewery icon */}
                    <div
                      className="w-14 h-14 rounded-xl flex-shrink-0"
                      style={{ background: generateGradientFromString(visit.brewery?.name ?? "") }}
                    />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-[var(--text-primary)] truncate">
                        {visit.brewery?.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={10} style={{ color: "var(--text-muted)" }} />
                        <p className="text-xs text-[var(--text-muted)]">
                          {visit.brewery?.city}, {visit.brewery?.state}
                        </p>
                      </div>
                      {/* Metadata row */}
                      <div className="flex items-center gap-3 mt-2">
                        {lastVisit && (
                          <div className="flex items-center gap-1">
                            <Clock size={10} style={{ color: "var(--accent-blue)" }} />
                            <span className="text-[10px] font-mono" style={{ color: "var(--accent-blue)" }}>
                              {lastVisit}
                            </span>
                          </div>
                        )}
                        {visit.unique_beers != null && visit.unique_beers > 0 && (
                          <div className="flex items-center gap-1">
                            <Beer size={10} style={{ color: "var(--accent-amber)" }} />
                            <span className="text-[10px] font-mono" style={{ color: "var(--accent-amber)" }}>
                              {visit.unique_beers} beer{visit.unique_beers !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Visit count */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-lg" style={{ color: "var(--accent-gold)" }}>{visit.total_visits}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">visits</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <Link href="/explore">
            <div className="text-center py-10 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 transition-colors">
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
