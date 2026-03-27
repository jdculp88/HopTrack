"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Calendar, Hop } from "lucide-react";
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
}

const DEFAULT: BoardSettings = {
  fontSize: "large",
  showABV: true,
  showDesc: false,
  showPrice: true,
  showRating: true,
  showStyle: true,
  showStats: true,
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

// Font size maps — TV readable sizes
const FS: Record<FontSize, { name: number; style: number; meta: number; price: number; stat: number }> = {
  medium: { name: 34, style: 14, meta: 13, price: 28, stat: 12 },
  large:  { name: 42, style: 16, meta: 15, price: 36, stat: 14 },
  xl:     { name: 54, style: 19, meta: 17, price: 46, stat: 16 },
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

// ─── Main Component ───────────────────────────────────────────────────────────

export function BoardClient({
  breweryId, breweryName, initialBeers, events = [], breweryStats, beerStats = {},
}: BoardClientProps) {
  const [beers, setBeers] = useState<BoardBeer[]>(initialBeers);
  const [settings, setSettings] = useState<BoardSettings>(() => loadSettings(breweryId));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const { fontSize, showABV, showPrice, showRating, showStyle, showStats } = settings;
  const fs = FS[fontSize];

  useEffect(() => { saveSettings(breweryId, settings); }, [breweryId, settings]);
  const set = <K extends keyof BoardSettings>(k: K, v: BoardSettings[K]) =>
    setSettings(p => ({ ...p, [k]: v }));

  const featuredBeer = beers.find(b => b.is_featured && !b.is_86d);
  const activeTapBeers = beers.filter(b => !b.is_featured && !b.is_86d);
  const eightySixedBeers = beers.filter(b => b.is_86d);
  const activeBeerCount = (featuredBeer ? 1 : 0) + activeTapBeers.length;
  const initials = getInitials(breweryName);

  // Realtime updates
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel(`board-${breweryId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "beers", filter: `brewery_id=eq.${breweryId}` }, refetchBeers)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breweryId]);

  const refetchBeers = useCallback(async () => {
    const s = createClient();
    const { data } = await (s as any)
      .from("beers").select("*")
      .eq("brewery_id", breweryId).eq("is_on_tap", true)
      .order("display_order", { ascending: true }).order("name");
    if (data) setBeers(data);
  }, [breweryId]);

  // Auto-scroll for overflow — 5s pause at top before starting
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let id: number, pos = 0, pause = 300; // Start with 5s pause (300 frames at 60fps)
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

  // Build stats line for footer
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

  return (
    <div
      className="font-sans"
      style={{
        position: "fixed", inset: 0,
        overflow: "hidden",
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 55%),
          ${C.cream}
        `,
        color: C.text,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{ padding: "28px 40px 20px", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Left: Monogram + Brewery Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
            {/* Monogram badge */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#0F0E0C",
            }}>
              <span className="font-mono" style={{
                fontWeight: 800, fontSize: 18,
                color: C.gold, letterSpacing: 1,
              }}>
                {initials}
              </span>
            </div>

            {/* Brewery name — Instrument Serif italic */}
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: "clamp(64px, 7vw, 100px)",
              lineHeight: 1,
              letterSpacing: "-0.01em",
              color: C.text,
              flex: 1,
              minWidth: 0,
            }}>
              {breweryName}
            </h1>
          </div>

          {/* Right: ON TAP count */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span className="font-mono" style={{
              fontSize: 13, textTransform: "uppercase", letterSpacing: "0.22em",
              color: C.gold,
            }}>
              On Tap
            </span>
            <span className="font-mono" style={{
              fontSize: 36, fontWeight: 700, lineHeight: 1,
              color: C.gold,
            }}>
              {activeBeerCount}
            </span>
          </div>
        </div>

        {/* Settings gear — absolute top-right */}
        <button
          onClick={() => setSettingsOpen(v => !v)}
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

        {/* Separator line */}
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
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18,
              background: "rgba(251,247,240,0.95)", backdropFilter: "blur(12px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="font-mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>Size</span>
                {(["medium", "large", "xl"] as FontSize[]).map(s => (
                  <button key={s} onClick={() => set("fontSize", s)} style={{
                    padding: "4px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                    fontSize: 11, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    background: fontSize === s ? "#0F0E0C" : C.border,
                    color: fontSize === s ? "#F5F0E8" : C.textMuted,
                    fontWeight: 600,
                  }}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
              {([
                { label: "Style", key: "showStyle" as const, val: showStyle },
                { label: "ABV", key: "showABV" as const, val: showABV },
                { label: "Desc", key: "showDesc" as const, val: settings.showDesc },
                { label: "Price", key: "showPrice" as const, val: showPrice },
                { label: "Rating", key: "showRating" as const, val: showRating },
                { label: "Stats", key: "showStats" as const, val: showStats },
              ]).map(({ label, key, val }) => (
                <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={val} onChange={e => set(key, e.target.checked)} style={{ accentColor: C.gold }} />
                  <span className="font-mono" style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
                </label>
              ))}
              <button onClick={() => setSettingsOpen(false)} style={{ marginLeft: "auto", padding: 4, background: "none", border: "none", cursor: "pointer", color: C.textSubtle }}>
                <X size={16} />
              </button>
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
          style={{ padding: "20px 40px 24px", flexShrink: 0 }}
        >
          {/* BOTW label */}
          <span className="font-mono" style={{
            fontSize: 14, textTransform: "uppercase", letterSpacing: "0.2em",
            color: C.gold, display: "block", marginBottom: 10,
          }}>
            ★ Beer of the Week
          </span>

          {/* Name row: name + dotted leader + price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span className="font-display" style={{
              fontWeight: 700,
              fontSize: "clamp(40px, 4.5vw, 56px)",
              lineHeight: 1.1,
              color: C.text,
              flexShrink: 0,
            }}>
              {featuredBeer.name}
            </span>
            {showPrice && featuredBeer.price_per_pint != null && (
              <>
                <span style={{
                  flex: 1,
                  borderBottom: "2px dotted rgba(212,168,67,0.4)",
                  marginBottom: 8,
                  marginLeft: 12,
                  marginRight: 12,
                  minWidth: 20,
                }} />
                <span className="font-mono" style={{
                  fontWeight: 700,
                  fontSize: "clamp(40px, 4.5vw, 56px)",
                  lineHeight: 1.1,
                  color: C.gold,
                  flexShrink: 0,
                }}>
                  {formatPrice(featuredBeer.price_per_pint)}
                </span>
              </>
            )}
          </div>

          {/* Meta: Style · ABV · IBU */}
          <div className="font-mono" style={{
            fontSize: 16, color: C.textMuted,
            marginTop: 6, display: "flex", alignItems: "center", gap: 0,
          }}>
            {showStyle && featuredBeer.style && (
              <span style={{ textTransform: "uppercase", letterSpacing: "0.15em" }}>{featuredBeer.style}</span>
            )}
            {showStyle && featuredBeer.style && showABV && featuredBeer.abv != null && (
              <span style={{ margin: "0 8px", color: C.textSubtle }}>·</span>
            )}
            {showABV && featuredBeer.abv != null && (
              <span style={{ color: C.textSubtle }}>{featuredBeer.abv.toFixed(1)}% ABV</span>
            )}
            {showABV && featuredBeer.ibu != null && featuredBeer.abv != null && (
              <span style={{ margin: "0 8px", color: C.textSubtle }}>·</span>
            )}
            {showABV && featuredBeer.ibu != null && (
              <span style={{ color: C.textSubtle }}>{featuredBeer.ibu} IBU</span>
            )}
          </div>

          {/* Promo badge */}
          {featuredBeer.promo_text && (
            <div className="font-mono" style={{ fontSize: 14, color: C.gold, marginTop: 6 }}>
              ✦ {featuredBeer.promo_text}
            </div>
          )}

          {/* Stats row */}
          {showStats && (() => {
            const stats = beerStats[featuredBeer.id];
            const rating = stats?.avgRating ?? featuredBeer.avg_rating;
            const hasData = rating != null || (stats && stats.pourCount > 0) || stats?.biggestFan;
            if (!hasData) return null;
            return (
              <div className="font-mono" style={{
                fontSize: 15, color: C.textSubtle, marginTop: 8,
                display: "flex", alignItems: "center", gap: 0,
              }}>
                {showRating && rating != null && (
                  <>
                    <span style={{ color: C.gold, fontWeight: 700 }}>⭐ {rating.toFixed(1)}</span>
                  </>
                )}
                {showRating && rating != null && stats && stats.pourCount > 0 && (
                  <span style={{ margin: "0 8px" }}>·</span>
                )}
                {stats && stats.pourCount > 0 && (
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

          {/* Gold underline */}
          <div style={{ marginTop: 16, height: 2, background: "rgba(212,168,67,0.35)" }} />
        </motion.div>
      )}

      {/* ── Beer List ────────────────────────────────────────────────── */}
      {beers.length === 0 ? (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
          padding: 40,
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
          style={{
            flex: 1, minHeight: 0,
            padding: "12px 40px",
            overflowY: "auto",
          }}
        >
          <AnimatePresence mode="popLayout">
            {activeTapBeers.map((beer, i) => {
              const stats = beerStats[beer.id];
              const rating = stats?.avgRating ?? beer.avg_rating;
              const hasStats = showStats && (
                (showRating && rating != null) ||
                (stats && stats.pourCount > 0) ||
                stats?.biggestFan
              );

              return (
                <motion.div
                  key={beer.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, delay: (featuredBeer ? 1 : 0) * 0.04 + i * 0.04, ease: EASE }}
                  style={{ marginBottom: `clamp(14px, 2vh, 28px)` }}
                >
                  {/* Name row: name + dotted leader + price */}
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span className="font-display" style={{
                      fontWeight: 700,
                      fontSize: fs.name,
                      lineHeight: 1.15,
                      color: C.text,
                      flexShrink: 0,
                    }}>
                      {beer.name}
                    </span>
                    {showPrice && beer.price_per_pint != null && (
                      <>
                        <span style={{
                          flex: 1,
                          borderBottom: "1.5px dotted rgba(212,168,67,0.35)",
                          marginBottom: 8,
                          marginLeft: 10,
                          marginRight: 10,
                          minWidth: 16,
                        }} />
                        <span className="font-mono" style={{
                          fontWeight: 700,
                          fontSize: fs.price,
                          lineHeight: 1.15,
                          color: C.gold,
                          flexShrink: 0,
                        }}>
                          {formatPrice(beer.price_per_pint)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Meta row: Style · ABV · IBU · promo */}
                  <div className="font-mono" style={{
                    display: "flex", alignItems: "center", gap: 0,
                    marginTop: 3,
                  }}>
                    {showStyle && beer.style && (
                      <span style={{
                        fontSize: fs.style, textTransform: "uppercase",
                        letterSpacing: "0.15em", color: C.textMuted,
                      }}>
                        {beer.style}
                      </span>
                    )}
                    {showStyle && beer.style && showABV && beer.abv != null && (
                      <span style={{ margin: "0 8px", fontSize: fs.meta, color: C.textSubtle }}>·</span>
                    )}
                    {showABV && beer.abv != null && (
                      <span style={{ fontSize: fs.meta, color: C.textSubtle }}>
                        {beer.abv.toFixed(1)}% ABV
                      </span>
                    )}
                    {showABV && beer.ibu != null && (
                      <>
                        <span style={{ margin: "0 8px", fontSize: fs.meta, color: C.textSubtle }}>·</span>
                        <span style={{ fontSize: fs.meta, color: C.textSubtle }}>
                          {beer.ibu} IBU
                        </span>
                      </>
                    )}
                    {beer.promo_text && (
                      <>
                        <span style={{ margin: "0 8px", fontSize: fs.meta, color: C.textSubtle }}>·</span>
                        <span style={{ fontSize: 14, color: C.gold }}>
                          ✦ {beer.promo_text}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Stats row */}
                  {hasStats && (
                    <div className="font-mono" style={{
                      fontSize: fs.stat, color: C.textSubtle, marginTop: 4,
                      display: "flex", alignItems: "center", gap: 0,
                    }}>
                      {showRating && rating != null && (
                        <span style={{ color: C.gold, fontWeight: 700 }}>⭐ {rating.toFixed(1)}</span>
                      )}
                      {showRating && rating != null && stats && stats.pourCount > 0 && (
                        <span style={{ margin: "0 8px" }}>·</span>
                      )}
                      {stats && stats.pourCount > 0 && (
                        <span>{stats.pourCount.toLocaleString()} {stats.pourCount === 1 ? "pour" : "pours"}</span>
                      )}
                      {stats?.biggestFan && (
                        <>
                          <span style={{ margin: "0 8px" }}>·</span>
                          <span>Biggest fan: {stats.biggestFan}</span>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* 86'd beers — sorted to end */}
            {eightySixedBeers.map((beer, i) => (
              <motion.div
                key={beer.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 0.5, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, delay: ((featuredBeer ? 1 : 0) + activeTapBeers.length + i) * 0.04, ease: EASE }}
                style={{ marginBottom: `clamp(14px, 2vh, 28px)` }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span className="font-display" style={{
                    fontWeight: 700,
                    fontSize: fs.name,
                    lineHeight: 1.15,
                    color: C.danger,
                    textDecoration: "line-through",
                    textDecorationColor: C.danger,
                    flexShrink: 0,
                  }}>
                    {beer.name}
                  </span>
                  <span className="font-mono" style={{
                    fontSize: fs.style, fontWeight: 800,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    color: C.danger,
                  }}>
                    86&apos;D
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        borderTop: "1px solid rgba(26,23,20,0.1)",
        padding: "16px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24,
      }}>
        {/* Left: Events */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0, overflow: "hidden" }}>
          {events.length > 0 && events.map((ev, i) => (
            <div key={ev.id} style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {i === 0 && <Calendar size={16} style={{ color: C.gold, flexShrink: 0 }} />}
              <span style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontWeight: 600, fontSize: 16,
                color: C.text,
              }}>
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

        {/* Center: Brewery stats */}
        {showStats && statsLine && (
          <div className="font-mono" style={{
            fontSize: 13, color: C.textMuted,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {statsLine}
          </div>
        )}

        {/* Right: HopTrack badge + Live */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              background: C.gold,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Hop size={9} style={{ color: "#0F0E0C" }} />
            </div>
            <span className="font-mono" style={{
              fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em",
              color: C.textSubtle,
            }}>
              HopTrack
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#3D7A52", display: "inline-block",
            }} />
            <span className="font-mono" style={{
              fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
              color: C.textSubtle,
            }}>
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
