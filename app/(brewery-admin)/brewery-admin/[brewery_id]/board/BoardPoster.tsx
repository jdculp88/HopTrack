"use client";

/**
 * BoardPoster — Hero featured beer + compact list format.
 * Top 40% is a large hero spotlight with glass art and style-colored gradient.
 * Bottom 60% is a compact scrolling list. Hero rotates every 15s.
 * Sprint 167 — The Board.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getGlass } from "@/lib/glassware";
import { getStyleFamily } from "@/lib/beerStyleColors";
import {
  C, EASE, FS, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";
import {
  GlassIllustration, BeerMetaRow, BoardSectionHeader,
  EmptyBoardState, groupBeersByType, deriveBeerLists,
} from "./BoardShared";
import { useAutoScroll } from "./useAutoScroll";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BoardPosterProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
}

// ─── Hero gradient colors by style ────────────────────────────────────────────

const HERO_GRADIENTS: Record<string, { from: string; to: string }> = {
  ipa:      { from: "rgba(90,138,74,0.18)",   to: "rgba(90,138,74,0.04)" },
  stout:    { from: "rgba(61,43,31,0.18)",     to: "rgba(107,84,69,0.04)" },
  sour:     { from: "rgba(168,69,106,0.18)",   to: "rgba(168,69,106,0.04)" },
  porter:   { from: "rgba(92,61,94,0.18)",     to: "rgba(92,61,94,0.04)" },
  lager:    { from: "rgba(74,122,138,0.18)",   to: "rgba(74,122,138,0.04)" },
  saison:   { from: "rgba(212,138,80,0.18)",   to: "rgba(212,138,80,0.04)" },
  cider:    { from: "rgba(184,92,74,0.15)",    to: "rgba(184,92,74,0.04)" },
  wine:     { from: "rgba(114,47,55,0.15)",    to: "rgba(114,47,55,0.04)" },
  cocktail: { from: "rgba(26,142,128,0.15)",   to: "rgba(26,142,128,0.04)" },
  na:       { from: "rgba(191,160,50,0.15)",   to: "rgba(191,160,50,0.04)" },
  default:  { from: "rgba(212,168,67,0.15)",   to: "rgba(212,168,67,0.04)" },
};

function getHeroGradient(style: string | null | undefined, itemType?: string) {
  const family = getStyleFamily(style, itemType);
  const g = HERO_GRADIENTS[family] ?? HERO_GRADIENTS.default;
  return `radial-gradient(ellipse at 50% 60%, ${g.from} 0%, ${g.to} 70%), ${C.cream}`;
}

// ─── Compact row for bottom section ───────────────────────────────────────────

function PosterCompactRow({
  beer, pourSizes, settings, eightySixed = false,
}: {
  beer: BoardBeer;
  pourSizes: PourSize[];
  settings: BoardSettings;
  eightySixed?: boolean;
}) {
  const fs = FS[settings.fontSize];
  const price = pourSizes.length > 0 ? pourSizes[0].price : beer.price_per_pint;

  if (eightySixed) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 0", borderBottom: `1px solid ${C.border}`, opacity: 0.4,
      }}>
        <span className="font-display" style={{
          fontWeight: 700, fontSize: fs.name * 0.55, lineHeight: 1.2,
          color: C.danger, textDecoration: "line-through",
        }}>
          {beer.name}
        </span>
        <span className="font-mono" style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: C.danger }}>
          86&apos;D
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="font-display" style={{
          fontWeight: 700, fontSize: fs.name * 0.55, lineHeight: 1.2, color: C.text,
        }}>
          {beer.name}
        </span>
        {settings.showStyle && beer.style && (
          <span className="font-mono" style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
            color: C.textSubtle, marginLeft: 10,
          }}>
            {beer.style}
          </span>
        )}
      </div>
      {settings.showPrice && price != null && (
        <span className="font-mono" style={{
          fontWeight: 700, fontSize: fs.price * 0.55, color: C.gold, flexShrink: 0,
        }}>
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}

// ─── BoardPoster ──────────────────────────────────────────────────────────────

export function BoardPoster({ beers, settings, pourSizesMap, beerStats, listRef }: BoardPosterProps) {
  const { featuredBeer, activeTapBeers, eightySixedBeers, hasMultipleTypes } = deriveBeerLists(beers);
  const groupedByType = groupBeersByType(activeTapBeers);
  const reducedMotion = useReducedMotion();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Hero candidates: featured first, then top 5 active beers
  const heroCandidates = featuredBeer
    ? [featuredBeer, ...activeTapBeers.slice(0, 4)]
    : activeTapBeers.slice(0, 5);

  const [heroIndex, setHeroIndex] = useState(0);

  // Rotate hero every 15 seconds
  useEffect(() => {
    if (heroCandidates.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroCandidates.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [heroCandidates.length]);

  // Auto-scroll the bottom list
  useAutoScroll(bottomRef, true, [beers, settings.fontSize]);

  if (beers.length === 0) return <EmptyBoardState />;

  const heroBeer = heroCandidates[heroIndex % heroCandidates.length] ?? heroCandidates[0];
  if (!heroBeer) return <EmptyBoardState />;

  const glassKey = heroBeer.glass_type ?? null;
  const glassObj = glassKey ? getGlass(glassKey) : null;
  const showGlassArt = settings.showGlass && !!glassObj;
  const heroPrice = (pourSizesMap[heroBeer.id] ?? [])[0]?.price ?? heroBeer.price_per_pint;
  const isFeatured = heroBeer.id === featuredBeer?.id;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Hero section — 40% */}
      <div style={{
        flex: "0 0 40vh",
        background: getHeroGradient(heroBeer.style, heroBeer.item_type),
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px 40px", position: "relative", overflow: "hidden",
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={heroBeer.id}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.6 }}
            style={{
              display: "flex", alignItems: "center", gap: 40, maxWidth: 900, width: "100%",
            }}
          >
            {/* Glass */}
            {showGlassArt && glassObj && (
              <div style={{ flexShrink: 0 }}>
                <GlassIllustration
                  glassKey={glassKey!}
                  instanceId={`poster-hero-${heroBeer.id}`}
                  width={120}
                  height={170}
                />
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {isFeatured && (
                <span className="font-mono" style={{
                  fontSize: 12, textTransform: "uppercase", letterSpacing: "0.2em",
                  color: C.gold, display: "block", marginBottom: 8,
                }}>
                  ★ Beer of the Week
                </span>
              )}

              <div className="font-display" style={{
                fontWeight: 700, fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1.1, color: C.text, marginBottom: 8,
              }}>
                {heroBeer.name}
              </div>

              <BeerMetaRow beer={heroBeer} settings={settings} featured />

              {settings.showPrice && heroPrice != null && (
                <div className="font-mono" style={{
                  fontWeight: 700, fontSize: "clamp(28px, 3.5vw, 48px)",
                  color: C.gold, marginTop: 12,
                }}>
                  {formatPrice(heroPrice)}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hero rotation dots */}
        {heroCandidates.length > 1 && (
          <div style={{
            position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 6,
          }}>
            {heroCandidates.map((_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i === heroIndex % heroCandidates.length ? C.gold : C.border,
                transition: "background 300ms",
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 2, background: "rgba(212,168,67,0.25)", flexShrink: 0 }} />

      {/* Compact list — 60% */}
      <div
        ref={bottomRef}
        style={{ flex: 1, minHeight: 0, padding: "12px 40px", overflowY: "auto" }}
      >
        {groupedByType.map((group, gi) => (
          <div key={group.type}>
            {hasMultipleTypes && (
              <div style={{ marginTop: gi > 0 ? 16 : 0, marginBottom: 6 }}>
                <BoardSectionHeader type={group.type} count={group.items.length} />
              </div>
            )}
            {group.items.map(beer => (
              <PosterCompactRow
                key={beer.id}
                beer={beer}
                pourSizes={pourSizesMap[beer.id] ?? []}
                settings={settings}
              />
            ))}
          </div>
        ))}

        {eightySixedBeers.map(beer => (
          <PosterCompactRow
            key={beer.id}
            beer={beer}
            pourSizes={[]}
            settings={settings}
            eightySixed
          />
        ))}
      </div>
    </div>
  );
}
