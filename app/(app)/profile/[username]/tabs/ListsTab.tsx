"use client";

// ListsTab — Sprint 160 (The Flow)
// Shows user collections: Wishlist (own-only), Beer Lists, Achievements.

import Link from "next/link";
import { Bookmark, ListOrdered, Trophy, List, ChevronRight } from "lucide-react";
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {wishlist.map((item) => {
                const sv = getStyleVars(item.beer?.style ?? null);
                return (
                  <Link key={item.id} href={`/beer/${item.beer?.id ?? ""}`}>
                    <div
                      className="rounded-[14px] p-3 flex items-center gap-2.5 transition-all hover:scale-[1.01] overflow-hidden relative"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${sv.primary} 18%, var(--card-bg)) 0%, var(--card-bg) 80%)`,
                        border: `1px solid color-mix(in srgb, ${sv.primary} 20%, var(--border))`,
                        borderLeft: `3px solid ${sv.primary}`,
                      }}
                    >
                      {/* Glass thumbnail */}
                      <div
                        className="w-10 h-10 rounded-[10px] flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: `color-mix(in srgb, ${sv.primary} 12%, var(--surface-2))`,
                          border: `1px solid color-mix(in srgb, ${sv.primary} 15%, transparent)`,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sv.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                          <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z"/>
                          <path d="M8 3c0 0 .5 2 4 2s4-2 4-2"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-bold text-sm text-[var(--text-primary)] truncate">
                          {item.beer?.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.beer?.style && <BeerStyleBadge style={item.beer.style} size="xs" />}
                          <span className="text-[10px] text-[var(--text-muted)] truncate">· {item.beer?.brewery?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
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
          <div className="space-y-2.5">
            {beerLists.map((list) => {
              const itemCount = list.items?.length ?? 0;
              return (
                <Link key={list.id} href={`/beer-lists/${list.id}`}>
                  <div
                    className="flex items-center gap-3.5 p-3.5 rounded-[14px] transition-all hover:scale-[1.005]"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {/* Cover collage — 2×2 mosaic */}
                    <div
                      className="w-12 h-12 rounded-[10px] flex-shrink-0 grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden"
                      style={{ background: "var(--surface-2)" }}
                    >
                      {[0, 1, 2, 3].map((j) => (
                        <div
                          key={j}
                          className="rounded-sm"
                          style={{
                            background: `color-mix(in srgb, var(--accent-${["gold", "blue", "purple", "amber"][j % 4]}) ${20 + j * 8}%, var(--surface-2))`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-bold text-[15px] text-[var(--text-primary)] truncate">{list.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {itemCount} {itemCount === 1 ? "beer" : "beers"}
                        {!list.is_public ? " · Private" : ""}
                      </p>
                    </div>
                    {/* Count + chevron */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="font-mono text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
                        {itemCount}
                      </span>
                      <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : isOwnProfile ? (
          <Link href="/beer-lists">
            <div
              className="text-center py-10 px-6 rounded-[14px]"
              style={{
                background: "var(--card-bg)",
                border: "1.5px dashed var(--border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3"
                style={{ background: "var(--surface-2)" }}
              >
                <List size={24} style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="font-display text-base font-bold text-[var(--text-primary)] mb-1">Create your first beer list</p>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Group favorites, must-tries, or whatever you&apos;re chasing.
              </p>
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                Create a List
              </span>
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
