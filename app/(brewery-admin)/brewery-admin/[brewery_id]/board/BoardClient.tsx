"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PourSize } from "@/lib/glassware";

import {
  C, loadSettings, saveSettings, getInitials,
  DEFAULT_SETTINGS,
  type BoardBeer, type BoardEvent, type BeerStats, type BreweryStats, type BoardSettings,
} from "./board-types";
import { BoardHeader } from "./BoardHeader";
import { BoardTapList } from "./BoardTapList";
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
}: BoardClientProps) {
  const [beers, setBeers]                         = useState<BoardBeer[]>(initialBeers);
  const [localPourSizes, setLocalPourSizes]       = useState<Record<string, PourSize[]>>(pourSizesMap);
  const [settings, setSettings]                   = useState<BoardSettings>(() => loadSettings(breweryId));
  const [draftSettings, setDraftSettings]         = useState<BoardSettings>(() => loadSettings(breweryId));
  const [settingsOpen, setSettingsOpen]           = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  // While settings panel is open the board previews draft; otherwise uses saved.
  const activeSettings = settingsOpen ? draftSettings : settings;

  // Persist saved settings to localStorage whenever they change
  useEffect(() => { saveSettings(breweryId, settings); }, [breweryId, settings]);

  // ── Settings panel handlers ────────────────────────────────────────────────
  function openSettings()   { setDraftSettings(settings); setSettingsOpen(true); }
  function applySettings()  { setSettings(draftSettings); setSettingsOpen(false); }
  function cancelSettings() { setDraftSettings(settings); setSettingsOpen(false); }
  const setDraft = <K extends keyof BoardSettings>(k: K, v: BoardSettings[K]) =>
    setDraftSettings(p => ({ ...p, [k]: v }));

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

  // ── Auto-scroll (5s pause at top) ─────────────────────────────────────────
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
  }, [beers, activeSettings.fontSize]);

  // ── Derived values needed by sub-components ────────────────────────────────
  const activeTapBeers   = beers.filter(b => !b.is_featured && !b.is_86d);
  const featuredBeer     = beers.find(b => b.is_featured && !b.is_86d);
  const activeBeerCount  = (featuredBeer ? 1 : 0) + activeTapBeers.length;
  const hasMultipleTypes = new Set(activeTapBeers.map(b => b.item_type ?? "beer")).size > 1;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="font-sans"
      style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.07) 0%, transparent 55%), ${C.cream}`,
        color: C.text, display: "flex", flexDirection: "column",
      }}
    >
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
      />

      <BoardTapList
        beers={beers}
        settings={activeSettings}
        pourSizesMap={localPourSizes}
        beerStats={beerStats}
        listRef={listRef}
      />

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        borderTop: "1px solid rgba(26,23,20,0.1)",
        padding: "16px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
      }}>
        <BoardEvents events={events} />
        <BoardStats breweryStats={breweryStats} showStats={activeSettings.showStats} />
      </div>
    </div>
  );
}
