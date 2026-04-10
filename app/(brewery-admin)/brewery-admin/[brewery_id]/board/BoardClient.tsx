"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PourSize } from "@/lib/glassware";

import {
  C, loadSettings, saveSettings, getInitials,
  DEFAULT_SETTINGS, FORMAT_DEFAULTS, getEffectiveSettings,
  resolveBoardDisplayScale,
  type BoardBeer, type BoardEvent, type BeerStats, type BreweryStats,
  type BoardSettings, type BoardDisplayFormat, type ResolvedDisplayScale,
} from "./board-types";
import { resolveTheme, themeToCssVars, type BoardThemeId } from "@/lib/board-themes";
import { BoardHeader } from "./BoardHeader";
import { BoardClassic } from "./BoardClassic";
import { BoardCompact } from "./BoardCompact";
import { BoardSlideshow } from "./BoardSlideshow";
import { BoardEvents } from "./BoardEvents";
import { BoardStats } from "./BoardStats";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BoardClientProps {
  breweryId: string;
  breweryName: string;
  initialBeers: BoardBeer[];
  events?: BoardEvent[];
  breweryStats?: BreweryStats;
  beerStats?: Record<string, BeerStats>;
  pourSizesMap?: Record<string, PourSize[]>;
  /** Sprint A: brewery theme configuration (from `breweries` row). */
  boardThemeId?: BoardThemeId | null;
  brandColor?: string | null;
  brandColorSecondary?: string | null;
  /** Sprint A: brewery's display scale preference (from `breweries.board_display_scale`). */
  boardDisplayScale?: "auto" | "monitor" | "large-tv" | "cinema" | null;
}

// ─── Shared format props ──────────────────────────────────────────────────────

export interface FormatProps {
  beers: BoardBeer[];
  settings: BoardSettings;
  pourSizesMap: Record<string, PourSize[]>;
  beerStats: Record<string, BeerStats>;
  listRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Sprint A: resolved display scale for big-screen rendering. Format
   * components should pass this to `getScaledFS(settings, resolvedScale)`
   * when reading font sizes. Defaults to "monitor" during SSR.
   */
  resolvedScale: ResolvedDisplayScale;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BoardClient({
  breweryId,
  breweryName,
  initialBeers,
  events = [],
  breweryStats,
  beerStats = {},
  pourSizesMap = {},
  boardThemeId,
  brandColor,
  brandColorSecondary: _brandColorSecondary, // reserved for Sprint B (custom themes)
  boardDisplayScale,
}: BoardClientProps) {
  const [beers, setBeers]                         = useState<BoardBeer[]>(initialBeers);
  const [localPourSizes, setLocalPourSizes]       = useState<Record<string, PourSize[]>>(pourSizesMap);
  // Sprint A: hydration-safe settings load — initialize with the server-side
  // defaults (matching what SSR rendered), then read localStorage in a
  // useEffect after mount. The brewery row's `boardDisplayScale` is the
  // server-side seed; per-device localStorage settings replace it on the client.
  // This avoids hydration mismatches when the user has stored format/theme/scale
  // overrides that differ from defaults.
  const initialSettings: BoardSettings = useMemo(() => {
    if (boardDisplayScale) {
      return { ...DEFAULT_SETTINGS, displayScale: boardDisplayScale };
    }
    return DEFAULT_SETTINGS;
  }, [boardDisplayScale]);
  const [settings, setSettings] = useState<BoardSettings>(initialSettings);
  const [draftSettings, setDraftSettings] = useState<BoardSettings>(initialSettings);
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen]   = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // After mount, replace defaults with the user's per-device localStorage choices.
  useEffect(() => {
    const stored = loadSettings(breweryId);
    setSettings(prev => ({ ...stored, displayScale: stored.displayScale ?? prev.displayScale }));
    setDraftSettings(prev => ({ ...stored, displayScale: stored.displayScale ?? prev.displayScale }));
    setSettingsHydrated(true);
  }, [breweryId]);

  // ── Sprint A: viewport tracking for auto display-scale detection ───────────
  const [viewport, setViewport] = useState<{ width: number; height: number } | undefined>(undefined);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // While settings panel is open the board previews draft; otherwise uses saved.
  const activeSettings = getEffectiveSettings(settingsOpen ? draftSettings : settings);

  // ── Sprint A: resolve theme + display scale ────────────────────────────────
  // activeSettings.themeId (localStorage override) takes precedence over the
  // brewery row's theme — lets owners preview themes without persisting to
  // the server. Falls back to brewery row, then "cream-classic".
  const effectiveThemeId = activeSettings.themeId ?? boardThemeId ?? "cream-classic";
  const theme = useMemo(
    () => resolveTheme({ board_theme_id: effectiveThemeId, brand_color: brandColor }, effectiveThemeId),
    [effectiveThemeId, brandColor],
  );
  const themeCssVars = useMemo(() => themeToCssVars(theme), [theme]);
  const resolvedScale = useMemo(
    () => resolveBoardDisplayScale(activeSettings, viewport),
    [activeSettings, viewport],
  );

  // Persist saved settings to localStorage whenever they change.
  // Skip the initial render so we don't overwrite stored settings with defaults
  // before the post-mount hydration effect runs.
  useEffect(() => {
    if (!settingsHydrated) return;
    saveSettings(breweryId, settings);
  }, [breweryId, settings, settingsHydrated]);

  // ── Settings panel handlers ────────────────────────────────────────────────
  function openSettings()   { setDraftSettings(settings); setSettingsOpen(true); }
  function applySettings()  { setSettings(draftSettings); setSettingsOpen(false); }
  function cancelSettings() { setDraftSettings(settings); setSettingsOpen(false); }
  const setDraft = <K extends keyof BoardSettings>(k: K, v: BoardSettings[K]) =>
    setDraftSettings(p => ({ ...p, [k]: v }));

  function onFormatChange(format: BoardDisplayFormat) {
    const recommended = FORMAT_DEFAULTS[format];
    setDraftSettings(prev => ({ ...prev, displayFormat: format, ...recommended }));
  }

  // ── Realtime: refetch beers + pour sizes ───────────────────────────────────
  const refetchBeers = useCallback(async () => {
    const s = createClient();
    const { data } = await (s as any)
      .from("beers").select("*")
      .eq("brewery_id", breweryId).eq("is_on_tap", true)
      .order("display_order", { ascending: true }).order("name");

    if (data) {
      setBeers(data);
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

  // ── Derived values ─────────────────────────────────────────────────────────
  const activeTapBeers   = beers.filter(b => !b.is_featured && !b.is_86d);
  const featuredBeer     = beers.find(b => b.is_featured && !b.is_86d);
  const activeBeerCount  = (featuredBeer ? 1 : 0) + activeTapBeers.length;
  const hasMultipleTypes = new Set(activeTapBeers.map(b => b.item_type ?? "beer")).size > 1;

  const formatProps: FormatProps = {
    beers,
    settings: activeSettings,
    pourSizesMap: localPourSizes,
    beerStats,
    listRef,
    resolvedScale,
  };

  const isSlideshow = activeSettings.displayFormat === "slideshow";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="font-sans"
      style={{
        // Sprint A: theme CSS variables — consumed by `C` in board-types.ts
        ...themeCssVars,
        position: "fixed", inset: 0, overflow: "hidden",
        background: isSlideshow ? C.cream : `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 55%), ${C.cream}`,
        color: C.text, display: "flex", flexDirection: "column",
      }}
    >
      {/* Header hidden in slideshow mode */}
      {!isSlideshow && (
        <BoardHeader
          breweryName={breweryName}
          initials={getInitials(breweryName)}
          activeBeerCount={activeBeerCount}
          hasMultipleTypes={hasMultipleTypes}
          settingsOpen={settingsOpen}
          draftSettings={draftSettings}
          onOpenSettings={openSettings}
          onCancelSettings={cancelSettings}
          onApplySettings={applySettings}
          onDraftChange={setDraft}
          onFormatChange={onFormatChange}
        />
      )}

      {/* Slideshow has its own minimal settings gear */}
      {isSlideshow && (
        <SlideshowSettingsButton
          settingsOpen={settingsOpen}
          draftSettings={draftSettings}
          onOpenSettings={openSettings}
          onCancelSettings={cancelSettings}
          onApplySettings={applySettings}
          onDraftChange={setDraft}
          onFormatChange={onFormatChange}
        />
      )}

      {/* Format renderer */}
      <FormatRenderer
        format={activeSettings.displayFormat}
        {...formatProps}
        breweryName={breweryName}
        breweryStats={breweryStats}
      />

      {/* Footer hidden in slideshow mode */}
      {!isSlideshow && (
        <div style={{
          flexShrink: 0,
          borderTop: "1px solid rgba(26,23,20,0.1)",
          padding: "16px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
        }}>
          <BoardEvents events={events} />
          <BoardStats breweryStats={breweryStats} showStats={activeSettings.showStats} />
        </div>
      )}
    </div>
  );
}

// ─── Format renderer ─────────────────────────────────────────────────────────

function FormatRenderer({ format, breweryName, breweryStats, ...props }: FormatProps & { format: BoardDisplayFormat; breweryName: string; breweryStats?: BreweryStats }) {
  switch (format) {
    case "classic":   return <BoardClassic {...props} />;
    case "compact":   return <BoardCompact {...props} />;
    case "slideshow": return <BoardSlideshow {...props} breweryName={breweryName} breweryStats={breweryStats} />;
  }
}

// ─── Slideshow mini settings button (top-right gear) ──────────────────────────

import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FORMAT_LABELS } from "./board-types";

function SlideshowSettingsButton({
  settingsOpen, draftSettings,
  onOpenSettings, onCancelSettings, onApplySettings, onDraftChange, onFormatChange,
}: {
  settingsOpen: boolean;
  draftSettings: BoardSettings;
  onOpenSettings: () => void;
  onCancelSettings: () => void;
  onApplySettings: () => void;
  onDraftChange: <K extends keyof BoardSettings>(key: K, value: BoardSettings[K]) => void;
  onFormatChange: (format: BoardDisplayFormat) => void;
}) {
  const formats: BoardDisplayFormat[] = ["classic", "compact", "slideshow"];

  return (
    <>
      <button
        onClick={settingsOpen ? onCancelSettings : onOpenSettings}
        style={{
          position: "absolute", top: 16, right: 16,
          padding: 8, borderRadius: 10, border: "none",
          background: "rgba(251,247,240,0.6)", backdropFilter: "blur(8px)",
          cursor: "pointer", color: C.textSubtle, zIndex: 20,
        }}
      >
        <Settings size={18} />
      </button>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: "absolute", top: 52, right: 16, zIndex: 20,
              borderRadius: 12, border: `1px solid ${C.border}`,
              background: "rgba(251,247,240,0.97)", backdropFilter: "blur(12px)",
              padding: "12px 16px", minWidth: 240,
            }}
          >
            {/* Format selector */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => onFormatChange(f)}
                  style={{
                    padding: "4px 10px", borderRadius: 99, border: "none", cursor: "pointer",
                    fontSize: 11, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    background: draftSettings.displayFormat === f ? "#0F0E0C" : C.border,
                    color: draftSettings.displayFormat === f ? "#F5F0E8" : C.textMuted,
                    fontWeight: 600,
                  }}
                >
                  {FORMAT_LABELS[f]}
                </button>
              ))}
            </div>

            {/* Apply / Cancel */}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={onCancelSettings}
                style={{
                  padding: "4px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
                  fontSize: 11, cursor: "pointer", background: "transparent", color: C.textMuted,
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onApplySettings}
                style={{
                  padding: "4px 12px", borderRadius: 8, border: "none",
                  fontSize: 11, cursor: "pointer", background: "#0F0E0C", color: C.gold,
                  fontWeight: 700, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                }}
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
