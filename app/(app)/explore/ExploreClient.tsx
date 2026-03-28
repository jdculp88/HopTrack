"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Map, List, Loader2, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { BreweryCard } from "@/components/brewery/BreweryCard";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import type { BreweryWithStats, BreweryType } from "@/types/database";
import { searchBreweries, mapOpenBreweryToDb } from "@/lib/openbrewerydb";

const BreweryMap = dynamic(
  () => import("@/components/map/BreweryMap").then((m) => m.BreweryMap),
  {
    ssr: false,
    loading: () => (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl h-[480px] flex items-center justify-center gap-2 text-[var(--text-muted)]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading map...</span>
      </div>
    ),
  }
);

interface ExploreClientProps {
  breweries: BreweryWithStats[];
  hasBeerOfTheWeek?: string[]; // brewery IDs that have a Beer of the Week
  hasUpcomingEvents?: string[]; // brewery IDs with upcoming events
}

type ViewMode = "list" | "map";
type VisitFilter = "all" | "visited" | "unvisited";

const BREWERY_TYPE_OPTIONS: { value: BreweryType; label: string }[] = [
  { value: "brewpub", label: "Brewpub" },
  { value: "micro", label: "Micro" },
  { value: "nano", label: "Nano" },
  { value: "taproom", label: "Taproom" },
  { value: "regional", label: "Regional" },
  { value: "bar", label: "Bar" },
  { value: "large", label: "Large" },
  { value: "contract", label: "Contract" },
];

export function ExploreClient({ breweries: initialBreweries, hasBeerOfTheWeek = [], hasUpcomingEvents = [] }: ExploreClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [view, setView] = useState<ViewMode>((searchParams.get("view") as ViewMode) ?? "list");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [visitFilter, setVisitFilter] = useState<VisitFilter>((searchParams.get("visit") as VisitFilter) ?? "all");
  const [typeFilter, setTypeFilter] = useState<BreweryType | "all">((searchParams.get("type") as BreweryType) ?? "all");
  const [botwFilter, setBotwFilter] = useState(searchParams.get("botw") === "1");
  const [showFilters, setShowFilters] = useState(typeFilter !== "all" || botwFilter);
  const enriched = initialBreweries.map(b => ({ ...b, has_upcoming_events: hasUpcomingEvents.includes(b.id) }));
  const [breweries, setBreweries] = useState<BreweryWithStats[]>(enriched);
  const [searching, setSearching] = useState(false);

  const activeFilterCount = (typeFilter !== "all" ? 1 : 0) + (botwFilter ? 1 : 0);

  // Sync state → URL without re-rendering the page
  const pushParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v); else params.delete(k);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  function setViewAndSync(v: ViewMode) { setView(v); pushParams({ view: v === "list" ? "" : v }); }
  function setVisitFilterAndSync(f: VisitFilter) { setVisitFilter(f); pushParams({ visit: f === "all" ? "" : f }); }
  function setTypeFilterAndSync(t: BreweryType | "all") { setTypeFilter(t); pushParams({ type: t === "all" ? "" : t }); }
  function setBotwFilterAndSync(v: boolean) { setBotwFilter(v); pushParams({ botw: v ? "1" : "" }); }
  function clearFiltersAndSync() {
    setTypeFilter("all"); setBotwFilter(false);
    pushParams({ type: "", botw: "" });
  }

  useEffect(() => {
    if (!query.trim()) { setBreweries(enriched); pushParams({ q: "" }); return; }
    pushParams({ q: query });
    const t = setTimeout(async () => {
      setSearching(true);
      const raw = await searchBreweries(query, 20);
      setBreweries(raw.map((r) => ({ ...mapOpenBreweryToDb(r), id: r.id, created_at: "" } as any)));
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply all filters
  const filteredBreweries = (query.trim() ? breweries : breweries)
    .filter((b: any) => {
      // Visit filter (only when not searching)
      if (!query.trim()) {
        if (visitFilter === "visited" && !b.user_visit) return false;
        if (visitFilter === "unvisited" && b.user_visit) return false;
      }
      // Type filter
      if (typeFilter !== "all" && b.brewery_type !== typeFilter) return false;
      // Beer of the Week filter
      if (botwFilter && !hasBeerOfTheWeek.includes(b.id)) return false;
      return true;
    });

  const visitedCount   = initialBreweries.filter((b: any) => !!b.user_visit).length;
  const unvisitedCount = initialBreweries.filter((b: any) => !b.user_visit).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Explore</h1>
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}

            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all border relative"
            style={
              showFilters || activeFilterCount > 0
                ? { background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }
                : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }
            }
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
                {activeFilterCount}
              </span>
            )}
          </button>
          {/* View toggle */}
          <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
            <button
              onClick={() => setViewAndSync("list")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
              style={view === "list"
                ? { background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }
                : { color: "var(--text-muted)" }
              }
            >
              <List size={14} /> List
            </button>
            <button
              onClick={() => setViewAndSync("map")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
              style={view === "map"
                ? { background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }
                : { color: "var(--text-muted)" }
              }
            >
              <Map size={14} /> Map
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search breweries by name or city..."
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl pl-11 pr-12 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
        />
        {searching && (
          <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "var(--accent-gold)" }} />
        )}
        {!searching && query.trim() && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
              {/* Brewery type */}
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">Brewery Type</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="All Types"
                    active={typeFilter === "all"}
                    onClick={() => setTypeFilterAndSync("all")}
                  />
                  {BREWERY_TYPE_OPTIONS.map((opt) => (
                    <FilterChip
                      key={opt.value}
                      label={opt.label}
                      active={typeFilter === opt.value}
                      onClick={() => setTypeFilterAndSync(typeFilter === opt.value ? "all" : opt.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Special filters */}
              <div>
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">Special</p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="Beer of the Week"
                    active={botwFilter}
                    onClick={() => setBotwFilterAndSync(!botwFilter)}
                    icon={<Sparkles size={12} />}
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFiltersAndSync}
                  className="text-xs hover:underline"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visit filter — only show when not searching */}
      {!query.trim() && view === "list" && (
        <div className="flex items-center gap-2">
          {(["all", "visited", "unvisited"] as VisitFilter[]).map((f) => {
            const labels = {
              all: `All (${initialBreweries.length})`,
              visited: `Visited (${visitedCount})`,
              unvisited: `New to me (${unvisitedCount})`,
            };
            return (
              <button
                key={f}
                onClick={() => setVisitFilterAndSync(f)}
                className="px-3 py-1.5 rounded-xl text-sm transition-all border"
                style={
                  visitFilter === f
                    ? { background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }
                    : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }
                }
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
      )}

      {view === "map" ? (
        <BreweryMap breweries={filteredBreweries} className="h-[480px]" />
      ) : (
        <>
          {/* Results count when filters active */}
          {activeFilterCount > 0 && (
            <p className="text-sm text-[var(--text-muted)]">
              {filteredBreweries.length} brewer{filteredBreweries.length !== 1 ? "ies" : "y"} found
            </p>
          )}

          {/* Discovery sections (no search) */}
          {!query.trim() && (
            <Section title={visitFilter === "all" ? "All Breweries" : visitFilter === "visited" ? "Visited" : "New to Me"} count={filteredBreweries.length}>
              {searching
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : filteredBreweries.length === 0
                ? (
                  <p className="col-span-full text-center text-[var(--text-muted)] py-12">
                    No breweries match your filters. Try adjusting them.
                  </p>
                )
                : filteredBreweries.map((b: any, i: number) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <BreweryCard brewery={b} />
                    </motion.div>
                  ))
              }
            </Section>
          )}

          {/* Search results */}
          {query.trim() && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searching
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : breweries.length === 0
                ? <p className="col-span-full text-center text-[var(--text-muted)] py-12">No breweries found for &ldquo;{query}&rdquo;</p>
                : filteredBreweries.map((b: any, i: number) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <BreweryCard brewery={b} />
                    </motion.div>
                  ))
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">{title}</h2>
        <span className="text-sm text-[var(--text-muted)]">({count})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all border"
      aria-pressed={active}
      style={
        active
          ? { background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }
          : { background: "var(--surface-2)", color: "var(--text-muted)", borderColor: "var(--border)" }
      }
    >
      {icon}
      {label}
    </button>
  );
}
