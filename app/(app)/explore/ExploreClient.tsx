"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Map, List, Loader2, SlidersHorizontal, X, Sparkles,
  Navigation, ChevronDown, ChevronUp, MapPin, Users, Calendar, Clock, Bookmark,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BreweryCard, getBreweryPlaceholder } from "@/components/brewery/BreweryCard";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import { useToast } from "@/components/ui/Toast";
import type { BreweryWithStats, BreweryType } from "@/types/database";
import { useGeolocation } from "@/hooks/useGeolocation";
import { haversineDistance, formatDistance } from "@/lib/geo";


const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  hasBeerOfTheWeek?: string[];
  hasUpcomingEvents?: string[];
  followerCounts?: Record<string, number>;
  recentBreweryIds?: string[];
  totalBreweryCount?: number;
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

export function ExploreClient({
  breweries: initialBreweries,
  hasBeerOfTheWeek = [],
  hasUpcomingEvents = [],
  followerCounts = {},
  recentBreweryIds = [],
  totalBreweryCount = 0,
}: ExploreClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { info } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<ViewMode>((searchParams.get("view") as ViewMode) ?? "list");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [visitFilter, setVisitFilter] = useState<VisitFilter>((searchParams.get("visit") as VisitFilter) ?? "all");
  const [typeFilter, setTypeFilter] = useState<BreweryType | "all">((searchParams.get("type") as BreweryType) ?? "all");
  const [botwFilter, setBotwFilter] = useState(searchParams.get("botw") === "1");
  const [wishlistFilter, setWishlistFilter] = useState(searchParams.get("filter") === "wishlist");
  const [wishlistBreweryIds, setWishlistBreweryIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(typeFilter !== "all" || botwFilter || wishlistFilter);
  const enriched = initialBreweries.map(b => ({ ...b, has_upcoming_events: hasUpcomingEvents.includes(b.id) }));
  const [breweries, setBreweries] = useState<BreweryWithStats[]>(enriched);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(initialBreweries.length);
  const [hasMore, setHasMore] = useState(initialBreweries.length < totalBreweryCount);
  const geo = useGeolocation();

  const activeFilterCount = (typeFilter !== "all" ? 1 : 0) + (botwFilter ? 1 : 0) + (wishlistFilter ? 1 : 0);

  // Fetch wishlist brewery IDs when filter is active
  useEffect(() => {
    if (!wishlistFilter) { setWishlistBreweryIds(new Set()); return; }
    (async () => {
      try {
        const res = await fetch("/api/wishlist/on-tap");
        const data = await res.json();
        setWishlistBreweryIds(new Set(data.brewery_ids ?? []));
      } catch {
        setWishlistBreweryIds(new Set());
      }
    })();
  }, [wishlistFilter]);

  // Pre-compute distances for all breweries when location is available
  const distanceMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!geo.latitude || !geo.longitude) return map;
    for (const b of initialBreweries) {
      const lat = b.latitude;
      const lng = b.longitude;
      if (typeof lat === "number" && typeof lng === "number") {
        map[b.id] = haversineDistance(geo.latitude, geo.longitude, lat, lng);
      }
    }
    return map;
  }, [geo.latitude, geo.longitude, initialBreweries]);

  // Near Me breweries — sorted by distance, top 10
  const nearMeBreweries = useMemo(() => {
    if (!geo.latitude || !geo.longitude) return [];
    return [...initialBreweries]
      .filter(b => b.id in distanceMap)
      .sort((a, b) => (distanceMap[a.id] ?? Infinity) - (distanceMap[b.id] ?? Infinity))
      .slice(0, 10);
  }, [initialBreweries, distanceMap, geo.latitude, geo.longitude]);

  // Recently visited breweries
  const recentBreweries = useMemo(() => {
    return recentBreweryIds
      .map(id => initialBreweries.find(b => b.id === id))
      .filter(Boolean) as BreweryWithStats[];
  }, [recentBreweryIds, initialBreweries]);

  // Sync state to URL without re-rendering the page
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
    setTypeFilter("all"); setBotwFilter(false); setWishlistFilter(false);
    pushParams({ type: "", botw: "", filter: "" });
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!query.trim()) { setBreweries(enriched); pushParams({ q: "" }); return; }
    pushParams({ q: query });
    const t = setTimeout(async () => {
      setSearching(true);
      // Search our own DB first (supports name, city, state, zip)
      const dbRes = await fetch(`/api/breweries?q=${encodeURIComponent(query)}&limit=50`);
      const dbData = await dbRes.json();
      const dbResults = dbData.breweries ?? [];

      // Server API already supplements with Open Brewery DB, upserts, and re-fetches
      // — always use DB results which have correct internal UUIDs for routing
      setBreweries(dbResults.map((b: any) => ({ ...b, created_at: b.created_at ?? "" })));
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // Request geolocation on mount (silently — no prompt if already granted)
  useEffect(() => {
    geo.requestLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more breweries from API
  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/breweries/browse?offset=${offset}&limit=200`);
      const data = await res.json();
      const more = (data.breweries ?? []) as BreweryWithStats[];
      if (more.length === 0) {
        setHasMore(false);
      } else {
        setBreweries((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const deduped = more.filter((b) => !existingIds.has(b.id));
          return [...prev, ...deduped];
        });
        setOffset((prev) => prev + more.length);
        if (offset + more.length >= totalBreweryCount) setHasMore(false);
      }
    } catch {
      // Silently fail — user can retry
    }
    setLoadingMore(false);
  }, [offset, totalBreweryCount]);

  // Apply all filters
  const filteredBreweries = breweries
    .filter((b: any) => {
      if (!query.trim()) {
        if (visitFilter === "visited" && !b.user_visit) return false;
        if (visitFilter === "unvisited" && b.user_visit) return false;
      }
      if (typeFilter !== "all" && b.brewery_type !== typeFilter) return false;
      if (botwFilter && !hasBeerOfTheWeek.includes(b.id)) return false;
      if (wishlistFilter && !wishlistBreweryIds.has(b.id)) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      // If geo available, sort by distance
      if (geo.latitude && geo.longitude && !query.trim()) {
        const distA = distanceMap[a.id] ?? Infinity;
        const distB = distanceMap[b.id] ?? Infinity;
        return distA - distB;
      }
      return 0;
    });

  const visitedCount = initialBreweries.filter((b: any) => !!b.user_visit).length;
  const unvisitedCount = initialBreweries.filter((b: any) => !b.user_visit).length;

  const isSearching = query.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-sans text-3xl font-bold text-[var(--text-primary)]">Explore</h1>
          <div className="flex items-center gap-2">
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

        {/* Large search bar */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, city, state, or zip code..."
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl pl-12 pr-12 py-4 text-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
          />
          {searching && (
            <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "var(--accent-gold)" }} />
          )}
          {!searching && query.trim() && (
            <button
              onClick={() => { setQuery(""); searchInputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter bar — collapsible below search */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all border"
            style={
              showFilters || activeFilterCount > 0
                ? { background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }
                : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }
            }
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Visit filter pills — inline, only when not searching */}
          {!isSearching && view === "list" && (
            <>
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
            </>
          )}

          {/* Geo location status */}
          {geo.latitude && geo.longitude && !geo.error && (
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] ml-auto">
              <Navigation size={10} style={{ color: "var(--accent-gold)" }} />
              Sorting by distance
            </span>
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
                    <FilterChip
                      label="On My Wishlist"
                      active={wishlistFilter}
                      onClick={() => { setWishlistFilter(!wishlistFilter); pushParams({ filter: !wishlistFilter ? "wishlist" : "" }); }}
                      icon={<Bookmark size={12} />}
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
      </div>

      {view === "map" ? (
        <BreweryMap breweries={filteredBreweries} className="h-[480px]" />
      ) : isSearching ? (
        /* Search results */
        <div className="space-y-4">
          {searching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredBreweries.length === 0 ? (
            <SearchEmptyState query={query} onClear={() => { setQuery(""); searchInputRef.current?.focus(); }} />
          ) : (
            <>
              <p className="text-sm text-[var(--text-muted)]">
                {filteredBreweries.length} result{filteredBreweries.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBreweries.map((b: any, i: number) => {
                  const isExternal = !UUID_REGEX.test(b.id);
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {isExternal ? (
                        <div
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); info("This brewery isn't on HopTrack yet -- check back soon!"); }}
                          className="cursor-pointer [&_a]:pointer-events-none relative h-full"
                        >
                          <BreweryCard brewery={b} />
                          <span
                            className="absolute top-3 left-3 z-10 text-[10px] font-mono px-2 py-0.5 rounded-full"
                            style={{
                              background: "color-mix(in srgb, var(--text-muted) 15%, transparent)",
                              color: "var(--text-muted)",
                              border: "1px solid var(--border)",
                            }}
                          >
                            Not on HopTrack yet
                          </span>
                        </div>
                      ) : (
                        <EnrichedBreweryCard
                          brewery={b}
                          followerCount={followerCounts[b.id]}
                          hasEvent={hasUpcomingEvents.includes(b.id)}
                          distance={b.id in distanceMap ? formatDistance(distanceMap[b.id]!) : undefined}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Discovery view — sections */
        <div className="space-y-8">
          {/* Near Me section */}
          {nearMeBreweries.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Navigation size={16} style={{ color: "var(--accent-gold)" }} />
                <h2 className="font-sans text-xl font-bold text-[var(--text-primary)]">Near Me</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {nearMeBreweries.map((b, i) => (
                  <NearMeCard
                    key={b.id}
                    brewery={b}
                    distance={formatDistance(distanceMap[b.id]!)}
                    followerCount={followerCounts[b.id]}
                    hasEvent={hasUpcomingEvents.includes(b.id)}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recently Visited */}
          {recentBreweries.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} style={{ color: "var(--accent-gold)" }} />
                <h2 className="font-sans text-xl font-bold text-[var(--text-primary)]">Recently Visited</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {recentBreweries.map((b, i) => (
                  <NearMeCard
                    key={b.id}
                    brewery={b}
                    distance={b.id in distanceMap ? formatDistance(distanceMap[b.id]!) : undefined}
                    followerCount={followerCounts[b.id]}
                    hasEvent={hasUpcomingEvents.includes(b.id)}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Results count when filters active */}
          {activeFilterCount > 0 && (
            <p className="text-sm text-[var(--text-muted)]">
              {filteredBreweries.length} brewer{filteredBreweries.length !== 1 ? "ies" : "y"} found
            </p>
          )}

          {/* All Breweries grid */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-sans text-xl font-bold text-[var(--text-primary)]">
                {visitFilter === "all" ? "All Breweries" : visitFilter === "visited" ? "Visited" : "New to Me"}
              </h2>
              <span className="text-sm text-[var(--text-muted)]">({filteredBreweries.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      transition={{ delay: Math.min(i, 20) * 0.04 }}
                    >
                      <EnrichedBreweryCard
                        brewery={b}
                        followerCount={followerCounts[b.id]}
                        hasEvent={hasUpcomingEvents.includes(b.id)}
                        distance={b.id in distanceMap ? formatDistance(distanceMap[b.id]!) : undefined}
                      />
                    </motion.div>
                  ))
              }
            </div>
            {/* Load More — only shown when not searching and more breweries exist */}
            {!isSearching && hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all border"
                  style={{
                    background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                    color: "var(--accent-gold)",
                    borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)",
                  }}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>Load More Breweries</>
                  )}
                </button>
              </div>
            )}
            {!isSearching && !hasMore && filteredBreweries.length > 0 && totalBreweryCount > 200 && (
              <p className="text-center text-xs text-[var(--text-muted)] pt-4">
                Showing all {filteredBreweries.length.toLocaleString()} breweries
              </p>
            )}
          </section>
        </div>
      )}
    </div>
    </motion.div>
  );
}

/* ─── Enriched Brewery Card ────────────────────────────────────────────────── */
/* Wraps BreweryCard with follower count, event badge, and distance overlay */

function EnrichedBreweryCard({
  brewery,
  followerCount,
  hasEvent,
  distance,
}: {
  brewery: BreweryWithStats;
  followerCount?: number;
  hasEvent?: boolean;
  distance?: string;
}) {
  // Ensure the event flag is set on the brewery object so BreweryCard renders the badge in the image area
  const enrichedBrewery = hasEvent
    ? { ...brewery, has_upcoming_events: true }
    : brewery;

  const hasStats = (followerCount && followerCount > 0) || distance;

  return (
    <div className="flex flex-col h-full">
      <BreweryCard
        brewery={enrichedBrewery as BreweryWithStats}
        className={hasStats ? "flex-1 rounded-b-none border-b-0" : "flex-1"}
      />
      {/* Stats row — sits below the card, never overlaps content */}
      {hasStats && (
        <div className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-b-2xl bg-[var(--surface)]">
          {followerCount && followerCount > 0 && (
            <span
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--surface-2) 80%, transparent)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              <Users size={9} />
              {followerCount}
            </span>
          )}
          {distance && (
            <span
              className="ml-auto flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                color: "var(--accent-gold)",
                border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
              }}
            >
              <Navigation size={9} />
              {distance}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Near Me / Recently Visited horizontal card ───────────────────────────── */

function NearMeCard({
  brewery,
  distance,
  followerCount,
  hasEvent,
  index,
}: {
  brewery: BreweryWithStats;
  distance?: string;
  followerCount?: number;
  hasEvent?: boolean;
  index: number;
}) {
  const coverSrc = brewery.cover_image_url || getBreweryPlaceholder(brewery.name);

  return (
    <Link href={`/brewery/${brewery.id}`}>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex-shrink-0 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[color-mix(in_srgb,var(--accent-gold)_30%,transparent)] transition-colors group"
      >
        {/* Mini cover */}
        <div className="h-24 w-full relative overflow-hidden">
          <Image
            src={coverSrc}
            alt={brewery.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="224px"
          />
          {distance && (
            <span
              className="absolute top-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 15%, var(--bg))",
                color: "var(--accent-gold)",
                border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
              }}
            >
              {distance}
            </span>
          )}
          {hasEvent && (
            <span
              className="absolute top-2 left-2 flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{
                background: "color-mix(in srgb, #5B8DEF 15%, var(--bg))",
                color: "#5B8DEF",
                border: "1px solid color-mix(in srgb, #5B8DEF 30%, transparent)",
              }}
            >
              <Calendar size={8} />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <h3 className="font-display font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent-gold)] transition-colors">
            {brewery.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <MapPin size={10} />
            <span className="truncate">{brewery.city}{brewery.state ? `, ${brewery.state}` : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
            {followerCount && followerCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Users size={9} /> {followerCount}
              </span>
            )}
            {brewery.beer_count !== undefined && brewery.beer_count > 0 && (
              <span>{brewery.beer_count} on tap</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Search Empty State ────────────────────────────────────────────────────── */

function SearchEmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
      >
        <Search size={28} style={{ color: "var(--accent-gold)" }} />
      </div>
      <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">
        No breweries found
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-4">
        Nothing matched &ldquo;{query}&rdquo;. Try a different name, city, or style.
      </p>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-xl text-sm font-medium transition-colors border"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
          color: "var(--accent-gold)",
          borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)",
        }}
      >
        Clear search
      </button>
    </div>
  );
}

/* ─── Filter Chip ───────────────────────────────────────────────────────────── */

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
