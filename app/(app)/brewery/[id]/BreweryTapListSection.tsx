"use client";

import Link from "next/link";
import { Star, Award, UtensilsCrossed, FileText, ExternalLink } from "lucide-react";
import { ITEM_TYPE_LABELS, ITEM_TYPE_EMOJI } from "@/types/database";
import { BeerCard } from "@/components/beer/BeerCard";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";

// Keep any-typed beer to mirror how page.tsx queries it (brewery joined type)
type TapBeer = {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  avg_rating: number | null;
  is_featured: boolean | null;
  item_type: string | null;
  [key: string]: unknown;
};

interface BreweryTapListSectionProps {
  beers: TapBeer[];
  breweryName: string;
  menuImageUrl: string | null;
}

export function BreweryTapListSection({
  beers,
  breweryName,
  menuImageUrl,
}: BreweryTapListSectionProps) {
  const allItems = beers;
  const nonBeerItems = allItems.filter((b) => b.item_type && b.item_type !== "beer");
  const hasNonBeer = nonBeerItems.length > 0;
  const typeOrder = ["beer", "cider", "wine", "cocktail", "na_beverage", "food"];
  const grouped = hasNonBeer
    ? typeOrder
        .map((t) => ({
          type: t,
          items: allItems.filter((b) => (b.item_type ?? "beer") === t),
        }))
        .filter((g) => g.items.length > 0)
    : [{ type: "beer", items: allItems }];

  // Featured beer (Beer of the Week)
  const featuredBeer = allItems.find((b) => b.is_featured) ?? null;

  return (
    <div className="space-y-8">
      {/* Beer of the Week */}
      {featuredBeer && (
        <Link href={`/beer/${featuredBeer.id}`}>
          <div className="card-bg-featured flex items-center gap-4 p-4 border border-[var(--accent-gold)]/30 rounded-2xl transition-all hover:border-[var(--accent-gold)]/60 group">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)",
              }}
            >
              <Award size={22} className="text-[var(--bg)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--accent-gold)] mb-0.5">
                Beer of the Week
              </p>
              <p className="font-display font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors truncate">
                {featuredBeer.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <BeerStyleBadge style={featuredBeer.style} size="xs" />
                {featuredBeer.abv && (
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {featuredBeer.abv}% ABV
                  </span>
                )}
              </div>
            </div>
            {featuredBeer.avg_rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star size={14} className="text-[var(--accent-gold)] fill-[var(--accent-gold)]" />
                <span className="font-mono font-bold text-[var(--accent-gold)]">
                  {(featuredBeer.avg_rating as number).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* On Tap / Full Menu */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            {hasNonBeer ? "Menu" : "On Tap"}
          </h2>
          <span className="text-sm font-mono text-[var(--text-muted)]">
            {allItems.length} items
          </span>
        </div>

        {allItems.length > 0 ? (
          <div className="space-y-6">
            {grouped.map((group) => {
              const section =
                ITEM_TYPE_LABELS[group.type as keyof typeof ITEM_TYPE_LABELS] ?? group.type;
              const emoji =
                ITEM_TYPE_EMOJI[group.type as keyof typeof ITEM_TYPE_EMOJI] ?? "🍺";
              return (
                <div key={group.type}>
                  {hasNonBeer && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{emoji}</span>
                      <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                        {section}
                      </h3>
                      <span className="text-xs font-mono text-[var(--text-muted)]">
                        ({group.items.length})
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {group.items.map((beer) => (
                      <BeerCard key={beer.id} beer={beer as any} variant="grid" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
            <p className="text-4xl mb-3">🍺</p>
            <p className="font-display text-lg text-[var(--text-primary)]">Taps are quiet</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              This brewery hasn&apos;t added anything yet — check back soon.
            </p>
          </div>
        )}
      </div>

      {/* Food Menu */}
      {menuImageUrl && (() => {
        const isPdf = menuImageUrl.toLowerCase().endsWith(".pdf");
        return (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed size={18} className="text-[var(--accent-gold)]" />
              <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                Food Menu
              </h2>
            </div>
            {isPdf ? (
              <a
                href={menuImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--accent-gold)]/40 transition-colors group"
                style={{ background: "var(--surface)" }}
              >
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent-gold) 12%, var(--surface))",
                  }}
                >
                  <FileText size={28} style={{ color: "var(--accent-gold)" }} />
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
                    View Food Menu
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">Opens as PDF in a new tab</p>
                </div>
                <ExternalLink
                  size={18}
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent-gold)] transition-colors"
                />
              </a>
            ) : (
              <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
                <a href={menuImageUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={menuImageUrl}
                    alt={`${breweryName} food menu`}
                    className="w-full h-auto"
                    style={{
                      maxHeight: 600,
                      objectFit: "contain",
                      background: "var(--surface)",
                    }}
                  />
                </a>
                <div className="px-4 py-2 text-center" style={{ background: "var(--surface)" }}>
                  <a
                    href={menuImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    Tap to view full size
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
