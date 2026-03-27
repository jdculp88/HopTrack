"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Droplets, Calendar, Star, TrendingUp, Users, Award, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
}

interface BoardEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
}

interface BeerStats {
  pourCount: number;
  avgRating: number | null;
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
}

type FontSize = "medium" | "large" | "xl";

// ─── Design System (matches LandingContent.tsx) ──────────────────────────────

const C = {
  dark: "#0F0E0C",
  darkSurface: "#1C1A16",
  darkBorder: "#3A3628",
  gold: "#D4A843",
  creamText: "#F5F0E8",
  creamMuted: "#A89F8C",
  creamSubtle: "#8B7E6A",
  surface2: "#252219",
  danger: "#C44B3A",
} as const;

// SVG grain texture — same as globals.css .grain-overlay
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

const FONT_SIZES: Record<FontSize, { name: string; style: string; meta: string; price: string; desc: string }> = {
  medium: { name: "text-lg",  style: "text-[10px]", meta: "text-[10px]", price: "text-base", desc: "text-[10px]" },
  large:  { name: "text-xl",  style: "text-[11px]", meta: "text-[11px]", price: "text-lg",   desc: "text-[11px]" },
  xl:     { name: "text-2xl", style: "text-xs",      meta: "text-xs",     price: "text-xl",   desc: "text-xs" },
};

// ─── Settings persistence ────────────────────────────────────────────────────

interface BoardSettings {
  fontSize: FontSize;
  showABV: boolean;
  showDesc: boolean;
  showPrice: boolean;
  showRating: boolean;
  showStyle: boolean;
  showStats: boolean;
}

const DEFAULT_SETTINGS: BoardSettings = {
  fontSize: "large",
  showABV: true,
  showDesc: false,
  showPrice: true,
  showRating: true,
  showStyle: true,
  showStats: true,
};

function loadSettings(breweryId: string): BoardSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(`hoptrack-board-${breweryId}`);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(breweryId: string, settings: BoardSettings) {
  try {
    localStorage.setItem(`hoptrack-board-${breweryId}`, JSON.stringify(settings));
  } catch {}
}

// ─── Brewery Crest (outlined, distinguished) ────────────────────────────────

function getInitials(name: string): string {
  const skip = ["the", "of", "and", "&", "co.", "co", "brewing", "brewery", "craft", "beer", "ales"];
  const words = name.split(/\s+/).filter(w => !skip.includes(w.toLowerCase()));
  if (words.length === 0) return name.charAt(0).toUpperCase();
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function BreweryCrest({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <div style={{ width: 64, height: 64, flexShrink: 0 }}>
      <svg viewBox="0 0 64 64" width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle */}
        <circle cx="32" cy="32" r="30" stroke={C.gold} strokeWidth="1.5" fill="none" />
        {/* Inner circle */}
        <circle cx="32" cy="32" r="25" stroke={C.gold} strokeWidth="0.5" opacity="0.3" fill="none" />
        {/* Diamond accent at top */}
        <polygon points="32,4 35,8 32,12 29,8" fill={C.gold} opacity="0.6" />
        {/* Horizontal accent lines */}
        <line x1="10" y1="32" x2="18" y2="32" stroke={C.gold} strokeWidth="0.5" opacity="0.3" />
        <line x1="46" y1="32" x2="54" y2="32" stroke={C.gold} strokeWidth="0.5" opacity="0.3" />
        {/* Initials */}
        <text
          x="32" y="33"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'DM Sans', system-ui, sans-serif"
          fontWeight="700"
          fontSize={initials.length > 2 ? "16" : "20"}
          letterSpacing="2"
          fill={C.gold}
        >
          {initials}
        </text>
      </svg>
    </div>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────

function StarRating({ rating, size = 10 }: { rating: number | null; size?: number }) {
  if (rating == null) return null;
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: size, color: s <= rounded ? C.gold : C.darkBorder }}>★</span>
      ))}
    </div>
  );
}

// ─── Beer Tile ───────────────────────────────────────────────────────────────

function BeerTile({
  beer,
  fonts,
  isFeatured,
  showABV,
  showDesc,
  showPrice,
  showRating,
  showStyle,
  showStats,
  stats,
  index,
}: {
  beer: BoardBeer;
  fonts: (typeof FONT_SIZES)["large"];
  isFeatured?: boolean;
  showABV: boolean;
  showDesc: boolean;
  showPrice: boolean;
  showRating: boolean;
  showStyle: boolean;
  showStats: boolean;
  stats?: BeerStats;
  index: number;
}) {
  const is86d = beer.is_86d;
  const hasPromo = !is86d && beer.promo_text;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: is86d ? 0.35 : 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "12px 14px",
        borderRadius: 12,
        overflow: "hidden",
        gridColumn: isFeatured ? "span 2" : undefined,
        background: isFeatured
          ? `linear-gradient(135deg, ${C.darkSurface}, rgba(212,168,67,0.06))`
          : C.darkSurface,
        border: `1px solid ${isFeatured ? "rgba(212,168,67,0.25)" : hasPromo ? "rgba(212,168,67,0.2)" : C.darkBorder}`,
      }}
    >
      {/* Top gold accent line for highlighted cards (matches landing page) */}
      {isFeatured && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        }} />
      )}

      {/* BOTW label */}
      {isFeatured && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <Star size={10} style={{ color: C.gold }} fill={C.gold} />
          <span
            style={{
              fontSize: 9, fontFamily: "var(--font-mono), monospace",
              textTransform: "uppercase", letterSpacing: "0.22em",
              fontWeight: 600, color: C.gold,
            }}
          >
            Beer of the Week
          </span>
        </div>
      )}

      {/* Promo badge */}
      {hasPromo && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginBottom: 4,
        }}>
          <Tag size={9} style={{ color: C.gold }} />
          <span style={{
            fontSize: 9, fontFamily: "var(--font-mono), monospace",
            textTransform: "uppercase", letterSpacing: "0.18em",
            fontWeight: 600, color: C.gold,
          }}>
            {beer.promo_text}
          </span>
        </div>
      )}

      {/* 86'd badge */}
      {is86d && (
        <span
          style={{
            position: "absolute", top: 8, right: 8,
            fontSize: 8, fontFamily: "var(--font-mono), monospace",
            textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "2px 6px", borderRadius: 99,
            color: C.danger, background: `${C.danger}18`,
          }}
        >
          86&apos;d
        </span>
      )}

      {/* Style label */}
      {showStyle && beer.style && (
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            textTransform: "uppercase", letterSpacing: "0.18em",
            fontSize: fonts.style === "text-[10px]" ? 10 : fonts.style === "text-[11px]" ? 11 : 12,
            marginBottom: 2, color: C.creamMuted,
          }}
        >
          {beer.style}
        </p>
      )}

      {/* Beer name — DM Sans bold */}
      <h2
        style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: fonts.name === "text-lg" ? 18 : fonts.name === "text-xl" ? 20 : 24,
          lineHeight: 1.2,
          color: C.creamText,
          textDecoration: is86d ? "line-through" : undefined,
        }}
      >
        {beer.name}
      </h2>

      {/* ABV / IBU */}
      {showABV && (beer.abv != null || beer.ibu != null) && (
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: fonts.meta === "text-[10px]" ? 10 : fonts.meta === "text-[11px]" ? 11 : 12,
          marginTop: 2, color: C.creamSubtle,
        }}>
          {beer.abv != null && `${beer.abv.toFixed(1)}% ABV`}
          {beer.abv != null && beer.ibu != null && " · "}
          {beer.ibu != null && `${beer.ibu} IBU`}
        </p>
      )}

      {/* Description */}
      {showDesc && beer.description && (
        <p style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: fonts.desc === "text-[10px]" ? 10 : fonts.desc === "text-[11px]" ? 11 : 12,
          marginTop: 4, color: C.creamMuted,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {beer.description}
        </p>
      )}

      {/* Per-beer stats */}
      {showStats && stats && stats.pourCount > 0 && (
        <p style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: 9, marginTop: 3, color: C.creamSubtle,
        }}>
          {stats.pourCount} {stats.pourCount === 1 ? "pour" : "pours"} tracked
          {stats.avgRating != null && ` · ${stats.avgRating.toFixed(1)} avg`}
        </p>
      )}

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 4 }} />

      {/* Bottom row: price + rating */}
      {(showPrice || showRating) && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 6, paddingTop: 6,
          borderTop: `1px solid ${C.darkBorder}`,
        }}>
          {showPrice && beer.price_per_pint != null ? (
            <span style={{
              fontFamily: "var(--font-mono), monospace", fontWeight: 700,
              fontSize: fonts.price === "text-base" ? 16 : fonts.price === "text-lg" ? 18 : 20,
              color: C.gold,
            }}>
              ${beer.price_per_pint % 1 === 0 ? beer.price_per_pint.toFixed(0) : beer.price_per_pint.toFixed(2)}
            </span>
          ) : <span />}
          {showRating && <StarRating rating={stats?.avgRating ?? beer.avg_rating} size={12} />}
        </div>
      )}
    </motion.div>
  );
}

// ─── Grid Columns ────────────────────────────────────────────────────────────

function getGridColumns(beerCount: number): number {
  if (beerCount <= 4) return 2;
  if (beerCount <= 8) return 3;
  if (beerCount <= 12) return 4;
  return 5;
}

// ─── Format Event Date ───────────────────────────────────────────────────────

function formatEventDate(dateStr: string, time: string | null) {
  const date = new Date(dateStr + "T00:00:00");
  const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
  const monthDay = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (time) {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${dayName} ${monthDay} · ${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }
  return `${dayName} ${monthDay}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function BoardClient({ breweryId, breweryName, initialBeers, events = [], breweryStats, beerStats = {} }: BoardClientProps) {
  const [beers, setBeers] = useState<BoardBeer[]>(initialBeers);
  const [settings, setSettings] = useState<BoardSettings>(() => loadSettings(breweryId));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const { fontSize, showABV, showDesc, showPrice, showRating, showStyle, showStats } = settings;
  const fonts = FONT_SIZES[fontSize];

  // Persist settings
  useEffect(() => { saveSettings(breweryId, settings); }, [breweryId, settings]);

  const updateSetting = <K extends keyof BoardSettings>(key: K, value: BoardSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Separate featured, active, and 86'd beers
  const featuredBeer = beers.find(b => b.is_featured && !b.is_86d);
  const activeTapBeers = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);

  const totalSlots = (featuredBeer ? 2 : 0) + activeTapBeers.length + eightySixedBeers.length;
  const gridCols = useMemo(() => getGridColumns(totalSlots), [totalSlots]);
  const gridRows = useMemo(() => Math.ceil(totalSlots / gridCols), [totalSlots, gridCols]);

  // Supabase Realtime
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`board-${breweryId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "beers", filter: `brewery_id=eq.${breweryId}` }, () => refetchBeers())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breweryId]);

  const refetchBeers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await (supabase as any)
      .from("beers").select("*")
      .eq("brewery_id", breweryId)
      .eq("is_on_tap", true)
      .order("display_order", { ascending: true })
      .order("name");
    if (data) setBeers(data);
  }, [breweryId]);

  // Auto-scroll for overflow (20+ beers)
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    let animationId: number;
    let scrollPos = 0;
    let pauseTimer = 0;
    const speed = 0.15;
    const pauseFrames = 180;

    function animate() {
      if (!el) return;
      const scrollable = el.querySelector("[data-grid]") as HTMLElement | null;
      if (!scrollable || scrollable.scrollHeight <= scrollable.clientHeight) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      if (pauseTimer > 0) { pauseTimer--; animationId = requestAnimationFrame(animate); return; }
      scrollPos += speed;
      if (scrollPos >= scrollable.scrollHeight - scrollable.clientHeight) {
        scrollPos = 0;
        pauseTimer = pauseFrames;
      }
      scrollable.scrollTop = scrollPos;
      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [beers, fontSize]);

  const activeBeerCount = (featuredBeer ? 1 : 0) + activeTapBeers.length;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 60%),
          radial-gradient(circle at 80% 100%, rgba(212,168,67,0.04) 0%, transparent 50%),
          ${C.dark}
        `,
      }}
    >
      {/* Grain overlay — matches landing page .grain-overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: GRAIN_SVG,
        opacity: 0.03,
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* Content layer (above grain) */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ padding: "16px 24px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BreweryCrest name={breweryName} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 42,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: C.creamText,
              }}>
                {breweryName}
              </h1>
            </div>
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 10, fontFamily: "var(--font-mono), monospace",
                textTransform: "uppercase", letterSpacing: "0.22em",
                color: C.gold,
              }}>
                On Tap
              </span>
              <span style={{
                fontSize: 10, fontFamily: "var(--font-mono), monospace",
                color: C.creamSubtle,
              }}>·</span>
              <span style={{
                fontSize: 14, fontFamily: "var(--font-mono), monospace",
                fontWeight: 600, color: C.gold,
              }}>
                {activeBeerCount}
              </span>
            </div>
          </div>
          {/* Divider with gold center accent — matches landing page pour connector */}
          <div style={{ position: "relative", marginTop: 12, height: 1 }}>
            <div style={{ position: "absolute", inset: 0, background: C.darkBorder }} />
            <div style={{
              position: "absolute", left: "50%", transform: "translateX(-50%)",
              top: -1, width: 80, height: 3,
              background: `linear-gradient(90deg, transparent, ${C.gold}60, transparent)`,
              borderRadius: 2,
            }} />
          </div>
        </div>

        {/* Settings gear */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          style={{
            position: "absolute", top: 16, right: 24,
            padding: 8, borderRadius: 12, border: "none",
            background: "transparent", cursor: "pointer",
            color: `${C.creamMuted}80`, zIndex: 10,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.creamMuted)}
          onMouseLeave={e => (e.currentTarget.style.color = `${C.creamMuted}80`)}
        >
          <Settings size={16} />
        </button>

        {/* Settings panel */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ overflow: "hidden", margin: "0 24px 8px", borderRadius: 12, border: `1px solid ${C.darkBorder}` }}
            >
              <div style={{
                padding: "10px 20px",
                display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20,
                background: C.darkSurface,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", textTransform: "uppercase", letterSpacing: "0.08em", color: C.creamSubtle }}>Font</span>
                  {(["medium", "large", "xl"] as FontSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateSetting("fontSize", s)}
                      style={{
                        padding: "4px 10px", borderRadius: 8, border: "none", cursor: "pointer",
                        fontSize: 9, fontFamily: "var(--font-mono), monospace",
                        background: fontSize === s ? C.gold : C.surface2,
                        color: fontSize === s ? C.dark : C.creamMuted,
                        transition: "all 0.2s",
                      }}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>

                {([
                  { label: "Style", key: "showStyle" as const, checked: showStyle },
                  { label: "ABV", key: "showABV" as const, checked: showABV },
                  { label: "Desc", key: "showDesc" as const, checked: showDesc },
                  { label: "Price", key: "showPrice" as const, checked: showPrice },
                  { label: "Rating", key: "showRating" as const, checked: showRating },
                  { label: "Stats", key: "showStats" as const, checked: showStats },
                ]).map(({ label, key, checked }) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => updateSetting(key, e.target.checked)}
                      style={{ accentColor: C.gold }}
                    />
                    <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", color: C.creamSubtle }}>{label}</span>
                  </label>
                ))}

                <button
                  onClick={() => setSettingsOpen(false)}
                  style={{ marginLeft: "auto", padding: 4, background: "none", border: "none", cursor: "pointer", color: C.creamSubtle }}
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Events strip ────────────────────────────────────────────── */}
        {events.length > 0 && (
          <div style={{ padding: "0 24px 8px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px", borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.darkSurface}, rgba(212,168,67,0.04))`,
                  border: `1px solid rgba(212,168,67,0.25)`,
                }}
              >
                <Calendar size={12} style={{ color: C.gold }} />
                <span style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 500,
                  fontSize: 13, color: C.creamText,
                }}>
                  {event.title}
                </span>
                <span style={{
                  fontSize: 10, fontFamily: "var(--font-mono), monospace",
                  padding: "2px 6px", borderRadius: 4,
                  color: C.gold, background: `rgba(212,168,67,0.1)`,
                }}>
                  {formatEventDate(event.event_date, event.start_time)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Beer Tile Grid ──────────────────────────────────────────── */}
        <div ref={gridRef} style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {beers.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", textAlign: "center", padding: "0 24px",
            }}>
              <Droplets size={48} style={{ color: `${C.creamSubtle}30`, marginBottom: 12 }} />
              <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 20, color: `${C.creamText}50` }}>
                No beers on tap
              </p>
              <p style={{ fontSize: 14, marginTop: 4, color: C.creamSubtle }}>
                Add beers to your tap list to see them here
              </p>
            </div>
          ) : (
            <div
              data-grid
              style={{
                position: "absolute", inset: 0,
                display: "grid",
                gap: 10,
                padding: "0 24px 8px",
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                overflow: "auto",
              }}
            >
              {/* Featured beer (BOTW) */}
              {featuredBeer && (
                <BeerTile
                  beer={featuredBeer}
                  fonts={fonts}
                  isFeatured
                  showABV={showABV}
                  showDesc={showDesc}
                  showPrice={showPrice}
                  showRating={showRating}
                  showStyle={showStyle}
                  showStats={showStats}
                  stats={beerStats[featuredBeer.id]}
                  index={0}
                />
              )}

              {/* Active beers */}
              {activeTapBeers.map((beer, i) => (
                <BeerTile
                  key={beer.id}
                  beer={beer}
                  fonts={fonts}
                  showABV={showABV}
                  showDesc={showDesc}
                  showPrice={showPrice}
                  showRating={showRating}
                  showStyle={showStyle}
                  showStats={showStats}
                  stats={beerStats[beer.id]}
                  index={(featuredBeer ? 1 : 0) + i}
                />
              ))}

              {/* 86'd beers */}
              {eightySixedBeers.map((beer, i) => (
                <BeerTile
                  key={beer.id}
                  beer={beer}
                  fonts={fonts}
                  showABV={showABV}
                  showDesc={showDesc}
                  showPrice={showPrice}
                  showRating={showRating}
                  showStyle={showStyle}
                  showStats={showStats}
                  stats={beerStats[beer.id]}
                  index={(featuredBeer ? 1 : 0) + activeTapBeers.length + i}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Brewery Stats Bar ───────────────────────────────────────── */}
        {showStats && breweryStats && breweryStats.totalPours > 0 && (
          <div style={{
            padding: "6px 24px",
            display: "flex", alignItems: "center", gap: 24,
            borderTop: `1px solid ${C.darkBorder}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={12} style={{ color: C.gold }} />
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>
                <span style={{ color: C.gold, fontWeight: 600 }}>{breweryStats.totalPours.toLocaleString()}</span> pours tracked
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Users size={12} style={{ color: C.gold }} />
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>
                <span style={{ color: C.gold, fontWeight: 600 }}>{breweryStats.uniqueVisitors.toLocaleString()}</span> visitors
              </span>
            </div>
            {breweryStats.topRatedBeer && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Award size={12} style={{ color: C.gold }} />
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>
                  Top rated: <span style={{ color: C.creamText, fontWeight: 500 }}>{breweryStats.topRatedBeer}</span>
                  {breweryStats.topRatedScore && (
                    <span style={{ color: C.gold }}> {breweryStats.topRatedScore.toFixed(1)}★</span>
                  )}
                </span>
              </div>
            )}
            {breweryStats.mostPopularBeer && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={12} style={{ color: C.gold }} />
                <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", color: C.creamMuted }}>
                  Most popular: <span style={{ color: C.creamText, fontWeight: 500 }}>{breweryStats.mostPopularBeer}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div style={{
          padding: "6px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: `1px solid ${C.darkBorder}`,
        }}>
          <p style={{
            fontSize: 9, fontFamily: "var(--font-mono), monospace",
            textTransform: "uppercase", letterSpacing: "0.2em",
            color: C.creamSubtle,
          }}>
            Powered by HopTrack
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#3D7A52",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }} />
            <p style={{
              fontSize: 9, fontFamily: "var(--font-mono), monospace",
              textTransform: "uppercase", letterSpacing: "0.08em",
              color: C.creamSubtle,
            }}>
              Live
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
