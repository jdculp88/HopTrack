"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Calendar } from "lucide-react";
import { HopMark } from "@/components/ui/HopMark";
import { createClient } from "@/lib/supabase/client";
import { getGlass, getGlassSvgContent } from "@/lib/glassware";
import type { PourSize } from "@/lib/glassware";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoardBeer {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  is_featured: boolean;
  is_on_tap: boolean;
  is_86d?: boolean;
  avg_rating: number | null;
  price_per_pint?: number | null;
  promo_text?: string | null;
  glass_type?: string | null;
  item_type?: string;
  category?: string | null;
}

const BOARD_SECTION_LABELS: Record<string, { label: string; emoji: string }> = {
  beer: { label: "Beers", emoji: "🍺" },
  cider: { label: "Ciders", emoji: "🍏" },
  wine: { label: "Wine", emoji: "🍷" },
  cocktail: { label: "Cocktails", emoji: "🍹" },
  na_beverage: { label: "Non-Alcoholic", emoji: "🥤" },
  food: { label: "Food & Snacks", emoji: "🍽️" },
};

interface BoardEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
}

interface BeerStats {
  pourCount: number;
  avgRating: number | null;
  biggestFan: string | null;
}

interface BreweryStats {
  totalPours: number;
  uniqueVisitors: number;
  topRatedBeer: string | null;
  topRatedScore: number | null;
  mostPopularBeer: string | null;
  mostPopularCount: number;
}

interface BoardClientProps {
  breweryId: string;
  breweryName: string;
  initialBeers: BoardBeer[];
  events?: BoardEvent[];
  breweryStats?: BreweryStats;
  beerStats?: Record<string, BeerStats>;
  pourSizesMap?: Record<string, PourSize[]>;
}

type FontSize = "medium" | "large" | "xl";

// ─── Design System — The Cream Menu ──────────────────────────────────────────

const C = {
  cream: "#FBF7F0",
  gold: "#D4A843",
  text: "#1A1714",
  textMuted: "#6B5E4E",
  textSubtle: "#9E8E7A",
  border: "#E5DDD0",
  chipBg: "rgba(251,247,240,0.85)",
  chipBorder: "#DDD5C5",
  danger: "#C44B3A",
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Settings ─────────────────────────────────────────────────────────────────

interface BoardSettings {
  fontSize: FontSize;
  showABV: boolean;
  showDesc: boolean;
  showPrice: boolean;
  showRating: boolean;
  showStyle: boolean;
  showStats: boolean;
  showGlass: boolean;
}

const DEFAULT: BoardSettings = {
  fontSize: "large",
  showABV: true,
  showDesc: false,
  showPrice: true,
  showRating: true,
  showStyle: true,
  showStats: true,
  showGlass: true,
};

function loadSettings(id: string): BoardSettings {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const s = localStorage.getItem(`hoptrack-board-${id}`);
    return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT;
  } catch { return DEFAULT; }
}

function saveSettings(id: string, s: BoardSettings) {
  try { localStorage.setItem(`hoptrack-board-${id}`, JSON.stringify(s)); } catch {}
}

// Font size maps — TV readable sizes + chip/glass dimensions
const FS: Record<FontSize, {
  name: number; style: number; meta: number; price: number; stat: number;
  chipLabel: number; chipOz: number; chipPrice: number; chipPadV: number; chipPadH: number;
  glasslabel: number; glassW: number; glassH: number;
}> = {
  medium: { name: 34, style: 14, meta: 13, price: 28, stat: 12, chipLabel: 10, chipOz: 9, chipPrice: 18, chipPadV: 5, chipPadH: 10, glasslabel: 9, glassW: 44, glassH: 63 },
  large:  { name: 42, style: 16, meta: 15, price: 36, stat: 14, chipLabel: 11, chipOz: 10, chipPrice: 20, chipPadV: 6, chipPadH: 12, glasslabel: 10, glassW: 56, glassH: 80 },
  xl:     { name: 54, style: 19, meta: 17, price: 46, stat: 16, chipLabel: 13, chipOz: 11, chipPrice: 24, chipPadV: 8, chipPadH: 14, glasslabel: 11, glassW: 70, glassH: 100 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const skip = ["the", "of", "and", "&", "co.", "co", "brewing", "brewery", "craft", "beer", "ales", "taproom", "pub"];
  const words = name.split(/\s+/).filter(w => !skip.includes(w.toLowerCase()));
  if (!words.length) return name[0]?.toUpperCase() ?? "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatEventDate(dateStr: string, time: string | null) {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.toLocaleDateString(undefined, { weekday: "short" });
  const md = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!time) return `${day} ${md}`;
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${day} ${md} · ${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? `$${price.toFixed(0)}` : `$${price.toFixed(2)}`;
}

// ─── Glass SVG Component ──────────────────────────────────────────────────────

function GlassIllustration({
  glassKey, instanceId, width, height, label,
}: {
  glassKey: string; instanceId: string; width: number; height: number; label: string;
}) {
  const glass = getGlass(glassKey);
  if (!glass) return null;
  const svgHtml = getGlassSvgContent(glass, instanceId);
  return (
    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <svg
        viewBox="0 0 80 120"
        width={width}
        height={height}
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))", display: "block" }}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
      <span className="font-mono" style={{
        fontSize: label.length > 8 ? 8 : 9,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: C.textSubtle,
        textAlign: "center",
        lineHeight: 1.2,
        maxWidth: width + 8,
      }}>
        {glass.name}
      </span>
    </div>
  );
}

// ─── Size Chips ───────────────────────────────────────────────────────────────

function SizeChips({ sizes, fs }: { sizes: PourSize[]; fs: typeof FS[FontSize] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "nowrap", alignItems: "center" }}>
      {sizes.map((size, idx) => (
        <div
          key={idx}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: C.chipBg,
            border: `1px solid ${C.chipBorder}`,
            borderRadius: 8,
            padding: `${fs.chipPadV}px ${fs.chipPadH}px`,
          }}
        >
          <div>
            <div className="font-mono" style={{
              fontSize: fs.chipLabel, letterSpacing: "0.08em",
              textTransform: "uppercase", color: C.textMuted, lineHeight: 1.2,
            }}>
              {size.label}
            </div>
            {size.oz != null && (
              <div className="font-mono" style={{ fontSize: fs.chipOz, color: C.textSubtle, opacity: 0.7 }}>
                {size.oz} oz
              </div>
            )}
          </div>
          <div style={{ width: 1, height: 26, background: C.chipBorder, flexShrink: 0 }} />
          <div className="font-mono" style={{ fontWeight: 700, fontSize: fs.chipPrice, color: C.gold, lineHeight: 1, flexShrink: 0 }}>
            {formatPrice(size.price)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BoardClient({
  breweryId, breweryName, initialBeers, events = [], breweryStats, beerStats = {},
  pourSizesMap = {},
}: BoardClientProps) {
  const [beers, setBeers] = useState<BoardBeer[]>(initialBeers);
  const [localPourSizes, setLocalPourSizes] = useState<Record<string, PourSize[]>>(pourSizesMap);
  const [settings, setSettings] = useState<BoardSettings>(() => loadSettings(breweryId));
  const [draftSettings, setDraftSettings] = useState<BoardSettings>(() => loadSettings(breweryId));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // While settings panel is open, preview uses draftSettings. Board uses settings.
  const activeSettings = settingsOpen ? draftSettings : settings;
  const { fontSize, showABV, showPrice, showRating, showStyle, showStats, showGlass } = activeSettings;
  const fs = FS[fontSize];

  useEffect(() => { saveSettings(breweryId, settings); }, [breweryId, settings]);
  const setDraft = <K extends keyof BoardSettings>(k: K, v: BoardSettings[K]) =>
    setDraftSettings(p => ({ ...p, [k]: v }));

  function openSettings() {
    setDraftSettings(settings); // start draft from current saved state
    setSettingsOpen(true);
  }
  function applySettings() {
    setSettings(draftSettings);
    setSettingsOpen(false);
  }
  function cancelSettings() {
    setDraftSettings(settings); // discard draft
    setSettingsOpen(false);
  }

  const featuredBeer = beers.find(b => b.is_featured && !b.is_86d);
  const activeTapBeers = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);
  const activeBeerCount = (featuredBeer ? 1 : 0) + activeTapBeers.length;

  // Group active items by item_type for section headers
  const hasMultipleTypes = new Set(activeTapBeers.map(b => b.item_type ?? "beer")).size > 1;
  const groupedByType: { type: string; items: BoardBeer[] }[] = (() => {
    if (!hasMultipleTypes) return [{ type: "beer", items: activeTapBeers }];
    const typeOrder = ["beer", "cider", "wine", "cocktail", "na_beverage", "food"];
    const groups: Record<string, BoardBeer[]> = {};
    for (const b of activeTapBeers) {
      const t = b.item_type ?? "beer";
      if (!groups[t]) groups[t] = [];
      groups[t].push(b);
    }
    return typeOrder
      .filter(t => groups[t] && groups[t].length > 0)
      .map(t => ({ type: t, items: groups[t] }));
  })();
  const initials = getInitials(breweryName);

  // Realtime updates — refetch beers AND pour sizes
  const refetchBeers = useCallback(async () => {
    const s = createClient();
    const { data } = await (s as any)
      .from("beers").select("*")
      .eq("brewery_id", breweryId).eq("is_on_tap", true)
      .order("display_order", { ascending: true }).order("name");
    if (data) {
      setBeers(data);
      // Also refresh pour sizes for new beer set
      const ids = (data as BoardBeer[]).map(b => b.id);
      if (ids.length > 0) {
        const { data: ps } = await (s as any)
          .from("beer_pour_sizes").select("*")
          .in("beer_id", ids).order("display_order", { ascending: true });
        if (ps) {
          const map: Record<string, PourSize[]> = {};
          for (const row of ps as PourSize[]) {
            if (!row.beer_id) continue;
            if (!map[row.beer_id]) map[row.beer_id] = [];
            map[row.beer_id].push(row);
          }
          setLocalPourSizes(map);
        }
      }
    }
  }, [breweryId]);

  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`board-${breweryId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "beers", filter: `brewery_id=eq.${breweryId}` }, refetchBeers)
      .on("postgres_changes", { event: "*", schema: "public", table: "beer_pour_sizes" }, refetchBeers)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breweryId]);

  // Auto-scroll — 5s pause at top
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let id: number, pos = 0, pause = 300;
    const tick = () => {
      if (!el || el.scrollHeight <= el.clientHeight) { id = requestAnimationFrame(tick); return; }
      if (pause > 0) { pause--; id = requestAnimationFrame(tick); return; }
      pos += 0.12;
      if (pos >= el.scrollHeight - el.clientHeight) { pos = 0; pause = 300; }
      el.scrollTop = pos;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [beers, fontSize]);

  // Footer stats
  const statsLine = (() => {
    if (!breweryStats || breweryStats.totalPours === 0) return null;
    const parts: string[] = [];
    parts.push(`${breweryStats.totalPours.toLocaleString()} pours`);
    parts.push(`${breweryStats.uniqueVisitors.toLocaleString()} visitors`);
    if (breweryStats.topRatedBeer) {
      parts.push(`Top Rated: ${breweryStats.topRatedBeer}${breweryStats.topRatedScore ? ` ⭐ ${breweryStats.topRatedScore.toFixed(1)}` : ""}`);
    }
    return parts.join(" · ");
  })();

  // ── Beer row renderer ───────────────────────────────────────────────────────

  function renderBeerRow(
    beer: BoardBeer,
    opts: { featured?: boolean; eightySixed?: boolean; animDelay?: number }
  ) {
    const { featured = false, eightySixed = false, animDelay = 0 } = opts;
    const stats = beerStats[beer.id];
    const rating = stats?.avgRating ?? beer.avg_rating;
    const hasStats = showStats && (
      (showRating && rating != null) ||
      (stats && stats.pourCount > 0) ||
      stats?.biggestFan
    );
    const pourSizes = localPourSizes[beer.id] ?? [];
    const glassKey = beer.glass_type ?? null;
    const glassObj = glassKey ? getGlass(glassKey) : null;
    const showGlassCol = showGlass && !!glassObj;

    // Font sizes — featured is larger (uses clamp on BOTW)
    const nameSize = featured ? "clamp(40px, 4.5vw, 56px)" : fs.name;
    const priceSize = featured ? "clamp(40px, 4.5vw, 56px)" : fs.price;

    if (eightySixed) {
      return (
        <motion.div
          key={beer.id} layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 0.5, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, delay: animDelay, ease: EASE }}
          style={{ marginBottom: `clamp(14px, 2vh, 28px)` }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="font-display" style={{
              fontWeight: 700, fontSize: fs.name, lineHeight: 1.15,
              color: C.danger, textDecoration: "line-through",
              textDecorationColor: C.danger, flexShrink: 0,
            }}>
              {beer.name}
            </span>
            <span className="font-mono" style={{
              fontSize: fs.style, fontWeight: 800, textTransform: "uppercase",
              letterSpacing: "0.1em", color: C.danger,
            }}>
              86&apos;D
            </span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={beer.id} layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: featured ? 0.6 : 0.5, delay: animDelay, ease: EASE }}
        style={{ marginBottom: featured ? 0 : `clamp(14px, 2vh, 28px)` }}
      >
        {/* Glass + info row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: showGlassCol ? (fs.glassW > 50 ? 20 : 14) : 0 }}>

          {/* Glass illustration — left column */}
          {showGlassCol && glassObj && (
            <GlassIllustration
              glassKey={glassKey!}
              instanceId={beer.id}
              width={fs.glassW}
              height={fs.glassH}
              label={glassObj.name}
            />
          )}

          {/* Beer info — right */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Name row: name + dotted leader + size chips (or single price) */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "nowrap" }}>
              <span
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: nameSize,
                  lineHeight: 1.15,
                  color: C.text,
                  flexShrink: 0,
                }}
              >
                {beer.name}
              </span>

              {showPrice && pourSizes.length > 0 ? (
                <>
                  {/* Dotted leader to chips */}
                  <span style={{
                    flex: 1,
                    borderBottom: "1.5px dotted rgba(212,168,67,0.35)",
                    marginBottom: 6,
                    marginLeft: 10,
                    marginRight: 10,
                    minWidth: 16,
                    alignSelf: "flex-end",
                  }} />
                  <SizeChips sizes={pourSizes} fs={fs} />
                </>
              ) : showPrice && beer.price_per_pint != null ? (
                // Fallback: single price with dotted leader
                <>
                  <span style={{
                    flex: 1,
                    borderBottom: "1.5px dotted rgba(212,168,67,0.35)",
                    marginBottom: 8,
                    marginLeft: 10,
                    marginRight: 10,
                    minWidth: 16,
                    alignSelf: "flex-end",
                  }} />
                  <span className="font-mono" style={{
                    fontWeight: 700,
                    fontSize: priceSize,
                    lineHeight: 1.15,
                    color: C.gold,
                    flexShrink: 0,
                  }}>
                    {formatPrice(beer.price_per_pint)}
                  </span>
                </>
              ) : null}
            </div>

            {/* Meta row: style · ABV · IBU · promo */}
            <div className="font-mono" style={{
              display: "flex", alignItems: "center", gap: 0, marginTop: 4,
            }}>
              {showStyle && beer.style && (
                <span style={{
                  fontSize: featured ? 16 : fs.style,
                  textTransform: "uppercase", letterSpacing: "0.15em", color: C.textMuted,
                }}>
                  {beer.style}
                </span>
              )}
              {showStyle && beer.style && showABV && beer.abv != null && (
                <span style={{ margin: "0 8px", fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>·</span>
              )}
              {showABV && beer.abv != null && (
                <span style={{ fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>
                  {beer.abv.toFixed(1)}% ABV
                </span>
              )}
              {showABV && beer.ibu != null && beer.abv != null && (
                <span style={{ margin: "0 8px", fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>·</span>
              )}
              {showABV && beer.ibu != null && (
                <span style={{ fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>
                  {beer.ibu} IBU
                </span>
              )}
              {beer.promo_text && (
                <>
                  <span style={{ margin: "0 8px", fontSize: featured ? 15 : fs.meta, color: C.textSubtle }}>·</span>
                  <span style={{ fontSize: featured ? 14 : 14, color: C.gold }}>
                    ✦ {beer.promo_text}
                  </span>
                </>
              )}
            </div>

            {/* Stats row */}
            {hasStats && (() => {
              const hasRating = showRating && rating != null;
              const hasPours = stats && stats.pourCount > 0;
              return (
                <div className="font-mono" style={{
                  fontSize: featured ? 15 : fs.stat, color: C.textSubtle, marginTop: 6,
                  display: "flex", alignItems: "center", gap: 0,
                }}>
                  {hasRating && (
                    <span style={{ color: C.gold, fontWeight: 700 }}>⭐ {rating!.toFixed(1)}</span>
                  )}
                  {hasRating && hasPours && <span style={{ margin: "0 8px" }}>·</span>}
                  {hasPours && (
                    <span>{stats.pourCount.toLocaleString()} {stats.pourCount === 1 ? "pour" : "pours"}</span>
                  )}
                  {stats?.biggestFan && (
                    <>
                      <span style={{ margin: "0 8px" }}>·</span>
                      <span>Biggest fan: {stats.biggestFan}</span>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="font-sans"
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 55%), ${C.cream}`,
        color: C.text, display: "flex", flexDirection: "column",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ padding: "28px 40px 20px", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#0F0E0C",
            }}>
              <span className="font-mono" style={{ fontWeight: 800, fontSize: 18, color: C.gold, letterSpacing: 1 }}>
                {initials}
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400, fontStyle: "italic",
              fontSize: "clamp(64px, 7vw, 100px)",
              lineHeight: 1, letterSpacing: "-0.01em",
              color: C.text, flex: 1, minWidth: 0,
            }}>
              {breweryName}
            </h1>
          </div>
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span className="font-mono" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.22em", color: C.gold }}>
              {hasMultipleTypes ? "On Menu" : "On Tap"}
            </span>
            <span className="font-mono" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: C.gold }}>
              {activeBeerCount}
            </span>
          </div>
        </div>

        {/* Settings gear */}
        <button
          onClick={settingsOpen ? cancelSettings : openSettings}
          style={{
            position: "absolute", top: 16, right: 40,
            padding: 8, borderRadius: 10, border: "none",
            background: "transparent", cursor: "pointer",
            color: C.textSubtle, zIndex: 10,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.textMuted)}
          onMouseLeave={e => (e.currentTarget.style.color = C.textSubtle)}
        >
          <Settings size={20} />
        </button>

        <div style={{ marginTop: 20, height: 1, background: "rgba(26,23,20,0.12)" }} />
      </header>

      {/* ── Settings panel ───────────────────────────────────────────── */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ overflow: "hidden", margin: "0 40px 8px", borderRadius: 12, border: `1px solid ${C.border}`, flexShrink: 0 }}
          >
            <div style={{
              padding: "12px 20px",
              background: "rgba(251,247,240,0.97)", backdropFilter: "blur(12px)",
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, marginBottom: 10 }}>
                {/* Font size */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="font-mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>Size</span>
                  {(["medium", "large", "xl"] as FontSize[]).map(s => (
                    <button key={s} onClick={() => setDraft("fontSize", s)} style={{
                      padding: "4px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                      fontSize: 11, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                      background: draftSettings.fontSize === s ? "#0F0E0C" : C.border,
                      color: draftSettings.fontSize === s ? "#F5F0E8" : C.textMuted,
                      fontWeight: 600,
                    }}>
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
                {/* Toggles */}
                {([
                  { label: "Glass", key: "showGlass" as const, val: draftSettings.showGlass },
                  { label: "Style", key: "showStyle" as const, val: draftSettings.showStyle },
                  { label: "ABV", key: "showABV" as const, val: draftSettings.showABV },
                  { label: "Desc", key: "showDesc" as const, val: draftSettings.showDesc },
                  { label: "Price", key: "showPrice" as const, val: draftSettings.showPrice },
                  { label: "Rating", key: "showRating" as const, val: draftSettings.showRating },
                  { label: "Stats", key: "showStats" as const, val: draftSettings.showStats },
                ]).map(({ label, key, val }) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={val} onChange={e => setDraft(key, e.target.checked)} style={{ accentColor: C.gold }} />
                    <span className="font-mono" style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
                  </label>
                ))}
              </div>
              {/* Preview indicator + apply/cancel */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                <span className="font-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.textSubtle }}>
                  Previewing below ↓
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={cancelSettings} style={{
                    padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
                    fontSize: 12, cursor: "pointer", background: "transparent", color: C.textMuted,
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  }}>
                    Cancel
                  </button>
                  <button onClick={applySettings} style={{
                    padding: "5px 14px", borderRadius: 8, border: "none",
                    fontSize: 12, cursor: "pointer", background: "#0F0E0C", color: C.gold,
                    fontWeight: 700, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  }}>
                    Apply to Display
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTW Section ─────────────────────────────────────────────── */}
      {featuredBeer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ padding: "20px 40px 0", flexShrink: 0 }}
        >
          <span className="font-mono" style={{
            fontSize: 14, textTransform: "uppercase", letterSpacing: "0.2em",
            color: C.gold, display: "block", marginBottom: 10,
          }}>
            ★ Beer of the Week
          </span>

          {renderBeerRow(featuredBeer, { featured: true })}

          {/* Gold underline */}
          <div style={{ marginTop: 16, height: 2, background: "rgba(212,168,67,0.35)" }} />
        </motion.div>
      )}

      {/* ── Beer List ────────────────────────────────────────────────── */}
      {beers.length === 0 ? (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center", padding: 40,
        }}>
          <p className="font-display" style={{ fontSize: 32, color: "rgba(26,23,20,0.25)", fontStyle: "italic" }}>
            No beers on tap
          </p>
          <p style={{ fontSize: 16, marginTop: 8, color: C.textSubtle }}>
            Add beers to your tap list to see them here
          </p>
        </div>
      ) : (
        <div
          ref={listRef}
          style={{ flex: 1, minHeight: 0, padding: "16px 40px", overflowY: "auto" }}
        >
          <AnimatePresence mode="popLayout">
            {groupedByType.map((group, gi) => {
              const section = BOARD_SECTION_LABELS[group.type] ?? { label: group.type, emoji: "" };
              const baseDelay = (featuredBeer ? 1 : 0) * 0.04;
              let itemOffset = 0;
              for (let k = 0; k < gi; k++) itemOffset += groupedByType[k].items.length;
              return (
                <div key={group.type}>
                  {/* Section header — only when multiple types */}
                  {hasMultipleTypes && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: baseDelay + itemOffset * 0.04 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        marginBottom: "clamp(10px, 1.5vh, 20px)",
                        marginTop: gi > 0 ? "clamp(16px, 2vh, 28px)" : 0,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{section.emoji}</span>
                      <span className="font-mono" style={{
                        fontSize: 14, textTransform: "uppercase", letterSpacing: "0.2em",
                        color: C.gold, fontWeight: 700,
                      }}>
                        {section.label}
                      </span>
                      <span className="font-mono" style={{ fontSize: 13, color: C.textSubtle }}>
                        ({group.items.length})
                      </span>
                      <div style={{ flex: 1, height: 1, background: "rgba(212,168,67,0.2)" }} />
                    </motion.div>
                  )}
                  {group.items.map((beer, i) =>
                    renderBeerRow(beer, {
                      animDelay: baseDelay + (itemOffset + i) * 0.04,
                    })
                  )}
                </div>
              );
            })}
            {eightySixedBeers.map((beer, i) =>
              renderBeerRow(beer, {
                eightySixed: true,
                animDelay: ((featuredBeer ? 1 : 0) + activeTapBeers.length + i) * 0.04,
              })
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        borderTop: "1px solid rgba(26,23,20,0.1)",
        padding: "16px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
      }}>
        {/* Events */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0, overflow: "hidden" }}>
          {events.length > 0 && events.map((ev, i) => (
            <div key={ev.id} style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {i === 0 && <Calendar size={16} style={{ color: C.gold, flexShrink: 0 }} />}
              <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 600, fontSize: 16, color: C.text }}>
                {ev.title}
              </span>
              <span className="font-mono" style={{ fontSize: 14, color: C.gold }}>
                {formatEventDate(ev.event_date, ev.start_time)}
              </span>
              {i < events.length - 1 && (
                <span style={{ margin: "0 4px", color: C.textSubtle, fontSize: 14 }}>·</span>
              )}
            </div>
          ))}
        </div>

        {/* Brewery stats */}
        {showStats && statsLine && (
          <div className="font-mono" style={{ fontSize: 13, color: C.textMuted, whiteSpace: "nowrap", flexShrink: 0 }}>
            {statsLine}
          </div>
        )}

        {/* HopTrack badge + Live */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <HopMark variant="horizontal" theme="cream" height={18} aria-hidden />
            <span className="font-mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: C.textSubtle, opacity: 0.7 }}>
              Powered by HopTrack
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3D7A52", display: "inline-block" }} />
            <span className="font-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
