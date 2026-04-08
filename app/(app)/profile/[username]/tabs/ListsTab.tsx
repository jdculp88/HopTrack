"use client";

// ListsTab — Sprint 160 (The Flow)
// Shows user collections: Wishlist (own-only), Beer Lists, Achievements.

import Link from "next/link";
import { ListOrdered, Trophy, List, ChevronRight } from "lucide-react";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { AchievementsGrid } from "../AchievementsGrid";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import { formatRelativeTime } from "@/lib/dates";

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
  updated_at: string;
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
      {/* Wishlist — own profile only, matches You tab rendering */}
      {isOwnProfile && (
        <div className="space-y-3">
          {wishlist.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Want to Try
                </p>
                <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {wishlist.length} saved
                </span>
              </div>
              <div className="grid grid-cols-2" style={{ gap: "10px" }}>
                {wishlist.map((item) => {
                  if (!item.beer) return null;
                  const sv = getStyleVars(item.beer.style);
                  return (
                    <Link key={item.id} href={`/beer/${item.beer.id}`}>
                      <div
                        className="rounded-[14px] flex items-center relative group"
                        style={{
                          padding: "14px",
                          gap: "10px",
                          background: `linear-gradient(135deg, color-mix(in srgb, ${sv.primary} 14%, var(--card-bg)), var(--card-bg))`,
                          border: `1px solid color-mix(in srgb, ${sv.primary} 12%, var(--border))`,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.transform = "";
                          (e.currentTarget as HTMLElement).style.boxShadow = "";
                        }}
                      >
                        {/* Thumbnail — style-tinted, glass SVG */}
                        <div
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: `color-mix(in srgb, ${sv.primary} 10%, var(--warm-bg))`,
                          }}
                        >
                          <svg
                            width={20}
                            height={20}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={sv.primary}
                            strokeWidth={1}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: 0.45 }}
                          >
                            <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z" />
                          </svg>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-sans font-semibold truncate"
                            style={{ fontSize: "13px", color: "var(--text-primary)" }}
                          >
                            {item.beer.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {item.beer.style && <BeerStyleBadge style={item.beer.style} size="xs" />}
                            {item.beer.brewery?.name && (
                              <span className="truncate" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                · {item.beer.brewery.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove button — hover reveal */}
                        <div
                          className="absolute flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          style={{
                            top: "8px",
                            right: "8px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: "var(--warm-bg)",
                            border: "1px solid var(--border)",
                            fontSize: "10px",
                            color: "var(--text-muted)",
                          }}
                        >
                          ×
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Want to Try
              </p>
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
            </>
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
                        {list.updated_at ? ` · Updated ${formatRelativeTime(list.updated_at)}` : ""}
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
            {isOwnProfile && (
              <Link href="/beer-lists" className="block mt-3">
                <div
                  className="text-center py-8 px-6 rounded-[14px]"
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
                  <p className="font-display text-base font-bold text-[var(--text-primary)] mb-1">Create another beer list</p>
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
            )}
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
