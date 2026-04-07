"use client";

// ListsTab — Sprint 160 (The Flow)
// Shows user collections: Wishlist (own-only), Beer Lists, Achievements.

import Link from "next/link";
import { Bookmark, ListOrdered, Trophy } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { AchievementsGrid } from "../AchievementsGrid";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";

interface WishlistItem {
  id: string;
  beer: {
    id: string;
    name: string;
    style: string | null;
    brewery: { name: string } | null;
  } | null;
}

interface BeerListSummary {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  items: { id: string }[] | null;
}

export interface ListsTabProps {
  isOwnProfile: boolean;
  wishlist: WishlistItem[];
  beerLists: BeerListSummary[];
  achievements: unknown[];
}

export function ListsTab({ isOwnProfile, wishlist, beerLists, achievements }: ListsTabProps) {
  return (
    <div className="space-y-8">
      {/* Wishlist — own profile only */}
      {isOwnProfile && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bookmark size={16} className="text-[var(--accent-gold)]" />
            <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Want to Try</h2>
          </div>
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {wishlist.map((item) => (
                <Link key={item.id} href={`/beer/${item.beer?.id ?? ""}`}>
                  <div
                    className="card-bg-reco flex items-center gap-5 p-3.5 rounded-[14px] transition-colors hover:scale-[1.01]"
                    data-style={getStyleFamily(item.beer?.style ?? null)}
                    style={{
                      border: "1px solid var(--card-border)",
                      borderLeft: `3px solid ${getStyleVars(item.beer?.style ?? null).primary}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                      style={{
                        background: `linear-gradient(135deg, ${getStyleVars(item.beer?.style ?? null).light}, ${getStyleVars(item.beer?.style ?? null).soft ?? getStyleVars(item.beer?.style ?? null).light})`,
                      }}
                    >
                      🍺
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-[var(--text-primary)] truncate">
                        {item.beer?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.beer?.style && <BeerStyleBadge style={item.beer.style} size="xs" />}
                        <span className="text-xs text-[var(--text-muted)] truncate">{item.beer?.brewery?.name}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link href="/explore">
              <div className="flex items-center gap-5 p-4 bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 rounded-[14px] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-lg opacity-40">
                  🍺
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">Save beers you want to try</p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">
                    Tap the heart on any beer to add it to your list
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Beer Lists */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ListOrdered size={16} className="text-[var(--accent-gold)]" />
          <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">Beer Lists</h2>
        </div>
        {beerLists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {beerLists.map((list) => {
              const itemCount = list.items?.length ?? 0;
              return (
                <Link key={list.id} href={`/beer-lists/${list.id}`}>
                  <div className="card-bg-reco p-4 border border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 rounded-[14px] transition-colors">
                    <p className="font-display font-semibold text-[var(--text-primary)] truncate">{list.title}</p>
                    {list.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{list.description}</p>
                    )}
                    <p className="text-xs font-mono text-[var(--text-secondary)] mt-2">
                      {itemCount} {itemCount === 1 ? "beer" : "beers"}
                      {!list.is_public && " · Private"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : isOwnProfile ? (
          <Link href="/beer-lists">
            <div className="flex items-center gap-5 p-4 bg-[var(--card-bg)] border border-dashed border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 rounded-[14px] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-lg opacity-40">
                📋
              </div>
              <div>
                <p className="text-[var(--text-secondary)] text-sm font-medium">Create your first beer list</p>
                <p className="text-[var(--text-muted)] text-xs mt-0.5">
                  Group favorites, must-tries, or whatever you&apos;re chasing
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="text-center py-6 bg-[var(--card-bg)] rounded-[14px] border border-[var(--card-border)]">
            <p className="text-sm text-[var(--text-muted)]">No public lists yet</p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="card-bg-achievement rounded-[14px] p-5" style={{ border: "1px solid var(--border)" }}>
        {achievements.length > 0 ? (
          <AchievementsGrid achievements={achievements as any[]} />
        ) : (
          <div>
            <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] mb-4">Achievements</h2>
            <Link href="/achievements">
              <div className="text-center py-10 bg-[var(--card-bg)] rounded-[14px] border border-[var(--card-border)] hover:border-[var(--accent-gold)]/30 transition-colors">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3"
                     style={{ background: "var(--warm-bg, var(--surface-2))" }}>
                  <Trophy size={24} style={{ color: "var(--text-muted)" }} />
                </div>
                <p className="font-display text-base text-[var(--text-primary)]">No badges yet</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Log beers, visit breweries, and unlock achievements along the way.
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
