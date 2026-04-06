"use client";

/**
 * BoardSlideshow — Full-screen cinematic presentation mode.
 * Auto-cycles through beers with crossfade, ambient mesh gradients,
 * and a progress indicator. Pause on hover/tap. Digital signage vibes.
 * Sprint 167 — The Board.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getGlass } from "@/lib/glassware";
import { getStyleFamily } from "@/lib/beerStyleColors";
import { HopMark } from "@/components/ui/HopMark";
import {
  C, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";
import { GlassIllustration, deriveBeerLists } from "./BoardShared";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BoardSlideshowProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
  breweryName: string;
}

// ─── Ambient mesh gradient colors by style ────────────────────────────────────

const MESH_COLORS: Record<string, { a: string; b: string }> = {
  ipa:      { a: "rgba(90,138,74,0.14)",   b: "rgba(90,138,74,0.06)" },
  stout:    { a: "rgba(61,43,31,0.16)",     b: "rgba(107,84,69,0.06)" },
  sour:     { a: "rgba(168,69,106,0.14)",   b: "rgba(168,69,106,0.06)" },
  porter:   { a: "rgba(92,61,94,0.14)",     b: "rgba(92,61,94,0.06)" },
  lager:    { a: "rgba(74,122,138,0.14)",   b: "rgba(74,122,138,0.06)" },
  saison:   { a: "rgba(212,138,80,0.14)",   b: "rgba(212,138,80,0.06)" },
  cider:    { a: "rgba(184,92,74,0.12)",    b: "rgba(184,92,74,0.05)" },
  wine:     { a: "rgba(114,47,55,0.12)",    b: "rgba(114,47,55,0.05)" },
  cocktail: { a: "rgba(26,142,128,0.12)",   b: "rgba(26,142,128,0.05)" },
  na:       { a: "rgba(191,160,50,0.12)",   b: "rgba(191,160,50,0.05)" },
  default:  { a: "rgba(212,168,67,0.12)",   b: "rgba(212,168,67,0.05)" },
};

function getMeshBackground(style: string | null | undefined, itemType?: string) {
  const family = getStyleFamily(style, itemType);
  const m = MESH_COLORS[family] ?? MESH_COLORS.default;
  return `radial-gradient(ellipse at 30% 25%, ${m.a} 0%, transparent 55%), radial-gradient(ellipse at 70% 75%, ${m.b} 0%, transparent 55%), ${C.cream}`;
}

const SLIDE_DURATION = 4500; // ms per slide
const RESUME_DELAY   = 3000; // ms after touch to resume

// ─── BoardSlideshow ───────────────────────────────────────────────────────────

export function BoardSlideshow({
  beers, settings, pourSizesMap, beerStats, listRef, breweryName,
}: BoardSlideshowProps) {
  const { featuredBeer, activeTapBeers } = deriveBeerLists(beers);
  const reducedMotion = useReducedMotion();

  // Build slide list: featured first, then all active
  const slideBeers = [
    ...(featuredBeer ? [featuredBeer] : []),
    ...activeTapBeers,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (isPaused || slideBeers.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slideBeers.length);
      setProgressKey(prev => prev + 1);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, slideBeers.length]);

  // Pause handlers
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);
  const handleTouchStart = useCallback(() => setIsPaused(true), []);
  const handleTouchEnd = useCallback(() => {
    const timer = setTimeout(() => setIsPaused(false), RESUME_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (slideBeers.length === 0) {
    return (
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: C.cream,
      }}>
        <p className="font-display" style={{ fontSize: 32, color: "rgba(26,23,20,0.25)", fontStyle: "italic" }}>
          No beers on tap
        </p>
      </div>
    );
  }

  const currentBeer = slideBeers[currentIndex % slideBeers.length];
  const isFeatured = currentBeer.id === featuredBeer?.id;
  const pourSizes = pourSizesMap[currentBeer.id] ?? [];
  const price = pourSizes.length > 0 ? pourSizes[0].price : currentBeer.price_per_pint;
  const glassKey = currentBeer.glass_type ?? null;
  const glassObj = glassKey ? getGlass(glassKey) : null;
  const showGlassArt = settings.showGlass && !!glassObj;
  const stats = beerStats[currentBeer.id];

  const useDots = slideBeers.length <= 15;

  return (
    <div
      style={{
        flex: 1, position: "relative", overflow: "hidden",
        background: getMeshBackground(currentBeer.style, currentBeer.item_type),
        transition: reducedMotion ? "none" : "background 1.5s ease-in-out",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Brewery name — top left */}
      <div style={{
        position: "absolute", top: 24, left: 32, zIndex: 5,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span className="font-mono" style={{
          fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em",
          color: C.textSubtle,
        }}>
          {breweryName}
        </span>
      </div>

      {/* HopTrack badge — bottom right */}
      <div style={{
        position: "absolute", bottom: 20, right: 32, zIndex: 5,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <HopMark variant="horizontal" theme="cream" height={14} aria-hidden />
        <span className="font-mono" style={{
          fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em",
          color: C.textSubtle, opacity: 0.6,
        }}>
          Powered by HopTrack
        </span>
      </div>

      {/* Slide count — top right */}
      <div style={{
        position: "absolute", top: 24, right: 56, zIndex: 5,
      }}>
        <span className="font-mono" style={{
          fontSize: 12, color: C.textSubtle,
        }}>
          {(currentIndex % slideBeers.length) + 1} / {slideBeers.length}
        </span>
      </div>

      {/* Main slide content */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "60px 60px 40px",
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBeer.id}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.8 }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 20, textAlign: "center", maxWidth: 800,
            }}
          >
            {/* Featured label */}
            {isFeatured && (
              <span className="font-mono" style={{
                fontSize: 13, textTransform: "uppercase", letterSpacing: "0.25em",
                color: C.gold, fontWeight: 700,
              }}>
                ★ Beer of the Week
              </span>
            )}

            {/* Glass art */}
            {showGlassArt && glassObj && (
              <GlassIllustration
                glassKey={glassKey!}
                instanceId={`slide-${currentBeer.id}`}
                width={140}
                height={200}
              />
            )}

            {/* Beer name */}
            <div className="font-display" style={{
              fontWeight: 700,
              fontSize: "clamp(48px, 6vw, 80px)",
              lineHeight: 1.05,
              color: C.text,
            }}>
              {currentBeer.name}
            </div>

            {/* Style + ABV */}
            <div className="font-mono" style={{
              display: "flex", alignItems: "center", gap: 16,
              fontSize: 16, textTransform: "uppercase", letterSpacing: "0.15em",
            }}>
              {settings.showStyle && currentBeer.style && (
                <span style={{ color: C.textMuted }}>{currentBeer.style}</span>
              )}
              {settings.showStyle && currentBeer.style && settings.showABV && currentBeer.abv != null && (
                <span style={{ color: C.textSubtle }}>·</span>
              )}
              {settings.showABV && currentBeer.abv != null && (
                <span style={{ color: C.textSubtle }}>{currentBeer.abv.toFixed(1)}% ABV</span>
              )}
            </div>

            {/* Description */}
            {settings.showDesc && currentBeer.description && (
              <p style={{
                fontSize: 18, color: C.textMuted, maxWidth: 600,
                lineHeight: 1.5, fontStyle: "italic",
              }}>
                {currentBeer.description}
              </p>
            )}

            {/* Price */}
            {settings.showPrice && price != null && (
              <div className="font-mono" style={{
                fontWeight: 700,
                fontSize: "clamp(32px, 4vw, 56px)",
                color: C.gold,
              }}>
                {formatPrice(price)}
              </div>
            )}

            {/* Rating */}
            {settings.showRating && (stats?.avgRating ?? currentBeer.avg_rating) != null && (
              <div className="font-mono" style={{ fontSize: 16, color: C.gold, fontWeight: 700 }}>
                ⭐ {((stats?.avgRating ?? currentBeer.avg_rating)!).toFixed(1)}
                {stats && stats.pourCount > 0 && (
                  <span style={{ color: C.textSubtle, fontWeight: 400, marginLeft: 12 }}>
                    {stats.pourCount.toLocaleString()} pours
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pause indicator */}
      {isPaused && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none", zIndex: 3,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(26,23,20,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ display: "flex", gap: 4 }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: C.textMuted }} />
              <div style={{ width: 4, height: 16, borderRadius: 2, background: C.textMuted }} />
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div style={{ flexShrink: 0, height: useDots ? 24 : 3, position: "relative" }}>
        {useDots ? (
          <div style={{
            display: "flex", gap: 6, justifyContent: "center",
            alignItems: "center", height: "100%",
          }}>
            {slideBeers.map((_, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: i === currentIndex % slideBeers.length ? C.gold : C.border,
                transition: "background 300ms",
              }} />
            ))}
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: C.border }}>
            {!isPaused && (
              <motion.div
                key={progressKey}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                style={{ height: "100%", background: C.gold }}
              />
            )}
            {isPaused && (
              <div style={{
                height: "100%", background: C.gold,
                width: `${((currentIndex % slideBeers.length) / slideBeers.length) * 100}%`,
              }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
