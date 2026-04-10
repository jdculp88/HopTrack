"use client";

/**
 * BoardSlideshow — Sprint A redesign.
 *
 * Full-screen cinematic presentation mode that cycles through every beer on
 * tap with a crossfade. Each slide shows a detailed spec sheet layout inspired
 * by the reference mockup: large glass art on the left, brewery name in a
 * small header, "TAP N OF M" progress indicator top-right, then the beer's
 * name, style chips, description, AROMA/TASTE/FINISH flavor notes (hidden
 * silently when the data isn't populated — Sprint B adds the fields), a
 * RATING/ABV/IBU/SRM/CHECK-INS stat row, and pour size chips with the
 * currently-active size highlighted.
 *
 * Auto-advance cadence reads from `settings.slideDurationMs` (default 6000ms).
 * Pauses on hover/touch, resumes 3s after touch ends.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getGlass, getGlassSvgContent } from "@/lib/glassware";
import { getStyleFamily } from "@/lib/beerStyleColors";
import { HopMark } from "@/components/ui/HopMark";
import {
  C, getScaledFS, formatPrice,
  type BoardBeer, type BeerStats, type BoardSettings, type ResolvedDisplayScale,
  type BreweryStats,
} from "./board-types";
import type { PourSize } from "@/lib/glassware";
import { deriveBeerLists, BOARD_STYLE_GROUP_LABELS } from "./BoardShared";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BoardSlideshowProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
  breweryName: string;
  breweryStats?: BreweryStats;
  resolvedScale?: ResolvedDisplayScale;
}

// ─── Ambient mesh gradient colors by style ────────────────────────────────────

const MESH_COLORS: Record<string, { a: string; b: string }> = {
  ipa:      { a: "rgba(90,138,74,0.14)",   b: "rgba(90,138,74,0.06)" },
  dipa:     { a: "rgba(50,98,44,0.14)",    b: "rgba(50,98,44,0.06)" },
  pale_ale: { a: "rgba(110,158,94,0.12)",  b: "rgba(110,158,94,0.05)" },
  stout:    { a: "rgba(61,43,31,0.16)",    b: "rgba(107,84,69,0.06)" },
  sour:     { a: "rgba(168,69,106,0.14)",  b: "rgba(168,69,106,0.06)" },
  porter:   { a: "rgba(92,61,94,0.14)",    b: "rgba(92,61,94,0.06)" },
  lager:    { a: "rgba(74,122,138,0.14)",  b: "rgba(74,122,138,0.06)" },
  pilsner:  { a: "rgba(191,160,50,0.12)",  b: "rgba(191,160,50,0.05)" },
  amber:    { a: "rgba(204,102,51,0.14)",  b: "rgba(204,102,51,0.05)" },
  saison:   { a: "rgba(212,138,80,0.14)",  b: "rgba(212,138,80,0.06)" },
  cider:    { a: "rgba(184,92,74,0.12)",   b: "rgba(184,92,74,0.05)" },
  wine:     { a: "rgba(114,47,55,0.12)",   b: "rgba(114,47,55,0.05)" },
  cocktail: { a: "rgba(26,142,128,0.12)",  b: "rgba(26,142,128,0.05)" },
  na:       { a: "rgba(191,160,50,0.12)",  b: "rgba(191,160,50,0.05)" },
  default:  { a: "rgba(212,168,67,0.12)",  b: "rgba(212,168,67,0.05)" },
};

function getMeshBackground(style: string | null | undefined, itemType?: string) {
  const family = getStyleFamily(style, itemType);
  const g = MESH_COLORS[family] ?? MESH_COLORS.default;
  return `radial-gradient(ellipse at 25% 50%, ${g.a} 0%, transparent 60%), radial-gradient(ellipse at 85% 80%, ${g.b} 0%, transparent 55%), ${C.cream}`;
}

const DEFAULT_SLIDE_MS = 6000;
const RESUME_DELAY     = 3000;

// ─── BoardSlideshow ───────────────────────────────────────────────────────────

export function BoardSlideshow({
  beers, settings, pourSizesMap, beerStats, listRef: _listRef,
  breweryName, breweryStats: _breweryStats, resolvedScale,
}: BoardSlideshowProps) {
  const { featuredBeer, activeTapBeers } = deriveBeerLists(beers);
  const reducedMotion = useReducedMotion();

  // Slide list: featured first, then every active beer
  const slideBeers = useMemo(
    () => [...(featuredBeer ? [featuredBeer] : []), ...activeTapBeers],
    [featuredBeer, activeTapBeers],
  );

  const slideDuration = Math.max(3000, Math.min(15000, settings.slideDurationMs ?? DEFAULT_SLIDE_MS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (isPaused || slideBeers.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slideBeers.length);
      setProgressKey(prev => prev + 1);
    }, slideDuration);
    return () => clearInterval(timer);
  }, [isPaused, slideBeers.length, slideDuration]);

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
  const fallbackPrice = pourSizes.length === 0 ? currentBeer.price_per_pint : null;
  const glassKey = currentBeer.glass_type ?? null;
  const glassObj = glassKey ? getGlass(glassKey) : null;
  const showGlassArt = settings.showGlass && !!glassObj;
  const stats = beerStats[currentBeer.id];
  const fs = getScaledFS(settings, resolvedScale ?? "monitor");

  // Style family label for the "STYLE · FAMILY" chip row
  const styleFamily = getStyleFamily(currentBeer.style, currentBeer.item_type);
  const familyLabel = BOARD_STYLE_GROUP_LABELS[styleFamily]?.label ?? null;

  // Flavor notes — Sprint A: these fields don't exist on the beer row yet, so
  // they'll always be null and the section stays hidden. Sprint B wires the
  // tap-list form to `beers.aroma_notes` / `taste_notes` / `finish_notes`.
  const beerWithNotes = currentBeer as BoardBeer & {
    aroma_notes?: string | null;
    taste_notes?: string | null;
    finish_notes?: string | null;
    srm?: number | null;
  };
  const aromaNotes  = beerWithNotes.aroma_notes ?? null;
  const tasteNotes  = beerWithNotes.taste_notes ?? null;
  const finishNotes = beerWithNotes.finish_notes ?? null;
  const srmValue    = beerWithNotes.srm ?? null;
  const hasAnyNotes = !!(aromaNotes || tasteNotes || finishNotes);

  const rating = stats?.avgRating ?? currentBeer.avg_rating;
  const checkInCount = stats?.pourCount ?? null;

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
      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 5,
        padding: "24px 48px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${C.border}`,
      }}>
        {/* Brewery name — top left */}
        <h1 className="font-display" style={{
          fontSize: "clamp(22px, 2vw, 32px)",
          fontWeight: 700, lineHeight: 1.1, color: C.text, margin: 0,
        }}>
          {breweryName}
        </h1>

        {/* TAP N OF M · progress dots · HOPTRACK */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span className="font-mono" style={{
            fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
            color: C.textSubtle,
          }}>
            Tap {(currentIndex % slideBeers.length) + 1} of {slideBeers.length}
          </span>

          {useDots && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {slideBeers.map((_, i) => {
                const active = i === currentIndex % slideBeers.length;
                return (
                  <div key={i} style={{
                    width: active ? 18 : 12, height: 3, borderRadius: 2,
                    background: active ? C.gold : C.border,
                    transition: "all 300ms",
                  }} />
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HopMark variant="horizontal" theme="cream" height={14} aria-hidden />
            <span className="font-mono" style={{
              fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
              color: C.textMuted, fontWeight: 700,
            }}>
              HopTrack
            </span>
          </div>
        </div>
      </div>

      {/* ── Main slide content ────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        padding: "120px 80px 80px",
        minHeight: 0,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBeer.id}
            initial={reducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "flex", alignItems: "center", gap: 80,
              width: "100%", maxWidth: 1600, margin: "0 auto",
            }}
          >
            {/* ── Left: glass art ──────────────────────────────────────────── */}
            {showGlassArt && glassObj && (
              <div style={{
                flexShrink: 0,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}>
                <GlassSvg glassKey={glassKey!} instanceId={`slide-${currentBeer.id}`} />
              </div>
            )}

            {/* ── Right: all the details ──────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Prefix line: "★ #1 THIS WEEK · WEIZEN GLASS" */}
              <div className="font-mono" style={{
                display: "flex", alignItems: "center", gap: 16,
                fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase",
                color: C.gold, fontWeight: 700,
              }}>
                {isFeatured && <span>★ #1 This Week</span>}
                {isFeatured && glassObj && <span style={{ color: C.textSubtle }}>·</span>}
                {glassObj && <span>{glassObj.name}</span>}
              </div>

              {/* Huge beer name */}
              <div className="font-display" style={{
                fontWeight: 700,
                fontSize: "clamp(52px, 6vw, 96px)",
                lineHeight: 1.0,
                color: C.text,
                letterSpacing: "-0.02em",
              }}>
                {currentBeer.name}
              </div>

              {/* Style chips: "WHEAT · FARMHOUSE · SAISON & FARMHOUSE" */}
              {settings.showStyle && (currentBeer.style || familyLabel) && (
                <div className="font-mono" style={{
                  display: "flex", alignItems: "center", gap: 14,
                  fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase",
                  color: C.gold, fontWeight: 600,
                }}>
                  {currentBeer.style && <span>{currentBeer.style}</span>}
                  {currentBeer.style && familyLabel && currentBeer.style.toLowerCase() !== familyLabel.toLowerCase() && (
                    <>
                      <span style={{ color: C.textSubtle }}>·</span>
                      <span>{familyLabel}</span>
                    </>
                  )}
                </div>
              )}

              {/* Description */}
              {settings.showDesc && currentBeer.description && (
                <p style={{
                  fontSize: "clamp(16px, 1.15vw, 22px)",
                  lineHeight: 1.55,
                  color: C.textMuted,
                  maxWidth: 720,
                  margin: 0,
                }}>
                  {currentBeer.description}
                </p>
              )}

              {/* AROMA / TASTE / FINISH — hidden if all three are empty */}
              {hasAnyNotes && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 28,
                  maxWidth: 720,
                }}>
                  <FlavorNote label="Aroma"  value={aromaNotes} />
                  <FlavorNote label="Taste"  value={tasteNotes} />
                  <FlavorNote label="Finish" value={finishNotes} />
                </div>
              )}

              {/* Stat row: RATING · ABV · IBU · SRM · CHECK-INS */}
              <div style={{
                display: "flex", alignItems: "flex-end", gap: 40,
                marginTop: 4,
              }}>
                <Stat label="Rating" value={rating != null ? rating.toFixed(1) : "—"} big />
                <Stat label="ABV"    value={currentBeer.abv != null ? `${currentBeer.abv.toFixed(1)}%` : "—"} big />
                <Stat label="IBU"    value={currentBeer.ibu != null ? String(currentBeer.ibu) : "—"} big />
                <Stat label="SRM"    value={srmValue != null ? String(srmValue) : "—"} big />
                <Stat
                  label="Check-ins"
                  value={checkInCount != null ? checkInCount.toLocaleString() : "—"}
                  big
                  accent
                />
              </div>

              {/* Pour chips — all same size, current (first) highlighted */}
              {settings.showPrice && pourSizes.length > 0 ? (
                <div style={{
                  display: "flex", gap: 16, flexWrap: "wrap", alignItems: "stretch",
                  marginTop: 6,
                }}>
                  {pourSizes.map((size, idx) => (
                    <PourChip
                      key={idx}
                      size={size}
                      highlighted={idx === 0}
                      fs={fs}
                    />
                  ))}
                </div>
              ) : settings.showPrice && fallbackPrice != null ? (
                <div className="font-mono" style={{
                  fontWeight: 700, fontSize: 44, color: C.gold, marginTop: 6,
                }}>
                  {formatPrice(fallbackPrice)}
                </div>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar — bottom */}
      <AnimatePresence>
        {!isPaused && slideBeers.length > 1 && (
          <motion.div
            key={progressKey}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: slideDuration / 1000, ease: "linear" }}
            style={{
              position: "absolute", bottom: 0, left: 0, height: 3,
              background: `linear-gradient(90deg, ${C.gold} 0%, rgba(212,168,67,0.5) 100%)`,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Pause indicator */}
      {isPaused && (
        <div style={{
          position: "absolute", top: "50%", right: "48px",
          transform: "translateY(-50%)",
          pointerEvents: "none", zIndex: 3,
        }}>
          <div style={{
            padding: "10px 14px", borderRadius: 8,
            background: "rgba(26,23,20,0.08)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{ display: "flex", gap: 3 }}>
              <div style={{ width: 3, height: 14, borderRadius: 1, background: C.textMuted }} />
              <div style={{ width: 3, height: 14, borderRadius: 1, background: C.textMuted }} />
            </div>
            <span className="font-mono" style={{
              fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
              color: C.textMuted,
            }}>
              Paused
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function GlassSvg({ glassKey, instanceId }: { glassKey: string; instanceId: string }) {
  const glass = getGlass(glassKey);
  if (!glass) return null;
  const svgHtml = getGlassSvgContent(glass, instanceId);
  return (
    <svg
      viewBox="0 0 80 120"
      style={{
        width: "clamp(180px, 18vw, 280px)",
        height: "auto",
        filter: "drop-shadow(0 12px 36px rgba(0,0,0,0.12))",
        display: "block",
      }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

function FlavorNote({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="font-mono" style={{
        fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
        color: C.textSubtle, marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 15, color: C.text, lineHeight: 1.4,
      }}>
        {value}
      </div>
    </div>
  );
}

function Stat({
  label, value, big = false, accent = false,
}: {
  label: string; value: string; big?: boolean; accent?: boolean;
}) {
  return (
    <div>
      <div className="font-display" style={{
        fontWeight: 700,
        fontSize: big ? "clamp(36px, 3.4vw, 52px)" : 28,
        lineHeight: 1, color: accent ? C.gold : C.text,
      }}>
        {value}
      </div>
      <div className="font-mono" style={{
        fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
        color: C.textSubtle, marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

function PourChip({
  size, highlighted, fs,
}: {
  size: PourSize;
  highlighted: boolean;
  fs: { chipLabel: number; chipOz: number; chipPrice: number; chipPadV: number; chipPadH: number };
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 6,
      padding: "16px 22px",
      minWidth: 120,
      borderRadius: 14,
      border: `2px solid ${highlighted ? C.gold : C.chipBorder}`,
      background: highlighted
        ? "color-mix(in srgb, var(--board-accent, #D4A843) 8%, transparent)"
        : C.chipBg,
      boxShadow: highlighted ? "0 4px 16px rgba(212,168,67,0.15)" : "none",
    }}>
      <div className="font-mono" style={{
        fontSize: Math.max(11, fs.chipLabel), letterSpacing: "0.15em",
        textTransform: "uppercase", color: C.textMuted, whiteSpace: "nowrap",
        fontWeight: 700,
      }}>
        {size.label}
      </div>
      {size.oz != null && (
        <div className="font-mono" style={{
          fontSize: Math.max(10, fs.chipOz), color: C.textSubtle, whiteSpace: "nowrap",
        }}>
          {size.oz} oz
        </div>
      )}
      <div className="font-display" style={{
        fontWeight: 700, fontSize: "clamp(28px, 2.4vw, 40px)",
        color: C.text, lineHeight: 1, marginTop: 2,
      }}>
        ${size.price % 1 === 0 ? size.price.toFixed(0) : size.price.toFixed(2)}
      </div>
    </div>
  );
}
