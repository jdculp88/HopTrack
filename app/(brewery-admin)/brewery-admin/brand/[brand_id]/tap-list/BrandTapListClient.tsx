"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Beer, Search, Filter, MapPin, ArrowRight, Check, X, Copy,
  AlertTriangle, ChevronDown, ChevronUp, GlassWater, Package,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { ITEM_TYPE_EMOJI } from "@/types/database";

// ── Types ────────────────────────────────────────────────────────────────────

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  cover_image_url: string | null;
}

interface BeerLocation {
  locationId: string;
  beerId: string;
  isOnTap: boolean;
  is86d: boolean;
  pricePerPint: number | null;
}

interface CatalogItem {
  id?: string;
  key: string;
  name: string;
  style: string | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  itemType: string;
  category: string | null;
  glassType: string | null;
  totalPours: number;
  avgRating: number | null;
  ratingCount: number;
  locations: BeerLocation[];
}

interface TapListData {
  catalog: CatalogItem[];
  orphans: CatalogItem[];
  locations: Location[];
  stats: {
    totalOnTap: number;
    totalOff: number;
    uniqueBeers: number;
    sharedBeers: number;
  };
}

type FilterValue = "all" | "on_tap" | "off_tap" | "shared" | "unique";
type BatchAction = "on_tap" | "off_tap" | "86" | "un86";

// ── Component ────────────────────────────────────────────────────────────────

export function BrandTapListClient({ brandId }: { brandId: string }) {
  const [data, setData] = useState<TapListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [pushModal, setPushModal] = useState<CatalogItem | null>(null);
  const [pushTargets, setPushTargets] = useState<Set<string>>(new Set());
  const [pushing, setPushing] = useState(false);
  const [batchActioning, setBatchActioning] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  // ── Fetch data ──
  async function fetchData(showLoading = false) {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/tap-list`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch { /* keep loading */ }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- async fetch pattern, setState is after await
  useEffect(() => {
    void fetchData(); // loading starts true
  }, [brandId]);

  // ── Filtered catalog ──
  const filtered = useMemo(() => {
    if (!data) return [];
    let items = data.catalog;

    // Apply filter
    switch (filter) {
      case "on_tap":
        items = items.filter(c => c.locations.some(l => l.isOnTap && !l.is86d));
        break;
      case "off_tap":
        items = items.filter(c => c.locations.every(l => !l.isOnTap));
        break;
      case "shared":
        items = items.filter(c => c.locations.length > 1);
        break;
      case "unique":
        items = items.filter(c => c.locations.length === 1);
        break;
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      items = items.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.style?.toLowerCase().includes(q)) ||
        (c.category?.toLowerCase().includes(q))
      );
    }

    return items;
  }, [data, filter, search]);

  // ── Push beer to locations ──
  async function handlePush() {
    if (!pushModal || pushTargets.size === 0) return;
    setPushing(true);

    try {
      // Use catalog-based push if the item has an id (catalog entry), else legacy clone
      const body: any = { targetLocationIds: Array.from(pushTargets) };
      if (pushModal.id) {
        body.catalogBeerIds = [pushModal.id];
      } else {
        body.sourceBeerIds = pushModal.locations.map(l => l.beerId).slice(0, 1);
      }

      const res = await fetch(`/api/brand/${brandId}/tap-list/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        toastSuccess(`Pushed ${pushModal.name} — ${json.data.created} created, ${json.data.skipped} skipped`);
        setPushModal(null);
        setPushTargets(new Set());
        fetchData(true);
      } else {
        toastError("Failed to push beer");
      }
    } catch {
      toastError("Failed to push beer");
    }
    setPushing(false);
  }

  // ── Batch action ──
  async function handleBatchAction(action: BatchAction) {
    if (selectedKeys.size === 0 || !data) return;
    setBatchActioning(true);

    // Collect all beer IDs for selected catalog items
    const beerIds: string[] = [];
    data.catalog.forEach(c => {
      if (selectedKeys.has(c.key)) {
        c.locations.forEach(l => beerIds.push(l.beerId));
      }
    });

    try {
      const res = await fetch(`/api/brand/${brandId}/tap-list/batch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beerIds, action }),
      });

      if (res.ok) {
        const json = await res.json();
        const actionLabel = action === "on_tap" ? "on tap" : action === "off_tap" ? "off tap" : action === "86" ? "86'd" : "un-86'd";
        toastSuccess(`${json.data.updated} beers marked ${actionLabel}`);
        setBatchMode(false);
        setSelectedKeys(new Set());
        fetchData(true);
      } else {
        toastError("Batch action failed");
      }
    } catch {
      toastError("Batch action failed");
    }
    setBatchActioning(false);
  }

  // ── Toggle selection ──
  function toggleSelect(key: string) {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Beer size={32} style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading tap list...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Failed to load tap list</p>
        </div>
      </div>
    );
  }

  const { stats, locations } = data;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8 space-y-5">
      {/* Manage Catalog Link */}
      <div className="flex justify-end">
        <Link
          href={`/brewery-admin/brand/${brandId}/catalog`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-80 no-underline"
          style={{ borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }}
        >
          <Package size={14} /> Manage Catalog
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "On Tap", value: stats.totalOnTap, color: "var(--accent-gold)" },
          { label: "Off Tap", value: stats.totalOff, color: "var(--text-muted)" },
          { label: "Unique Beers", value: stats.uniqueBeers, color: "var(--text-primary)" },
          { label: "Shared Across Locations", value: stats.sharedBeers, color: "#4A7C59" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-3.5 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters + Batch Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0 w-full sm:w-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search beers..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border bg-transparent outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "all", label: "All" },
            { value: "on_tap", label: "On Tap" },
            { value: "off_tap", label: "Off Tap" },
            { value: "shared", label: "Shared" },
            { value: "unique", label: "Unique" },
          ] as { value: FilterValue; label: string }[]).map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
              style={{
                background: filter === f.value ? "var(--accent-gold)" : "transparent",
                color: filter === f.value ? "#0F0E0C" : "var(--text-muted)",
                borderColor: filter === f.value ? "var(--accent-gold)" : "var(--border)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Batch mode toggle */}
        <button
          onClick={() => { setBatchMode(!batchMode); setSelectedKeys(new Set()); }}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0"
          style={{
            background: batchMode ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)" : "transparent",
            color: batchMode ? "var(--accent-gold)" : "var(--text-muted)",
            borderColor: batchMode ? "var(--accent-gold)" : "var(--border)",
          }}
        >
          {batchMode ? "Cancel Batch" : "Batch Edit"}
        </button>
      </div>

      {/* Batch Action Bar */}
      <AnimatePresence>
        {batchMode && selectedKeys.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border p-4 flex flex-wrap items-center gap-3"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))", borderColor: "var(--accent-gold)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--accent-gold)" }}>
              {selectedKeys.size} selected
            </span>
            <div className="flex gap-2 flex-wrap">
              {([
                { action: "on_tap" as BatchAction, label: "Put On Tap", color: "#4A7C59" },
                { action: "off_tap" as BatchAction, label: "Take Off Tap", color: "var(--text-muted)" },
                { action: "86" as BatchAction, label: "86 All", color: "var(--danger)" },
                { action: "un86" as BatchAction, label: "Un-86 All", color: "var(--text-secondary)" },
              ]).map(a => (
                <button
                  key={a.action}
                  onClick={() => handleBatchAction(a.action)}
                  disabled={batchActioning}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ borderColor: "var(--border)", color: a.color }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Legend */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Locations:</span>
        {locations.map((loc, i) => (
          <span
            key={loc.id}
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: `color-mix(in srgb, ${LOCATION_COLORS[i % LOCATION_COLORS.length]} 15%, transparent)`,
              color: LOCATION_COLORS[i % LOCATION_COLORS.length],
            }}
          >
            {loc.name}
          </span>
        ))}
      </div>

      {/* Catalog List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <GlassWater size={32} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {search ? "No beers match your search" : "No beers found"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, idx) => (
            <CatalogRow
              key={item.key}
              item={item}
              locations={locations}
              index={idx}
              expanded={expandedKey === item.key}
              onToggleExpand={() => setExpandedKey(expandedKey === item.key ? null : item.key)}
              batchMode={batchMode}
              selected={selectedKeys.has(item.key)}
              onToggleSelect={() => toggleSelect(item.key)}
              onPush={() => { setPushModal(item); setPushTargets(new Set()); }}
            />
          ))}
        </div>
      )}

      {/* Orphan Beers (not in catalog) */}
      {data.orphans && data.orphans.length > 0 && (
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: "var(--text-muted)" }} />
            <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Unlinked Beers ({data.orphans.length}) — not in catalog
            </p>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            These beers exist at your locations but aren{"'"}t linked to the brand catalog.
            Use <Link href={`/brewery-admin/brand/${brandId}/catalog`} className="underline" style={{ color: "var(--accent-gold)" }}>Manage Catalog</Link> to import them.
          </p>
          {data.orphans.map((item: CatalogItem, idx: number) => (
            <CatalogRow
              key={item.key}
              item={item}
              locations={locations}
              index={idx}
              expanded={expandedKey === `orphan-${item.key}`}
              onToggleExpand={() => setExpandedKey(expandedKey === `orphan-${item.key}` ? null : `orphan-${item.key}`)}
              batchMode={false}
              selected={false}
              onToggleSelect={() => {}}
              onPush={() => {}}
            />
          ))}
        </div>
      )}

      {/* Push Modal */}
      <AnimatePresence>
        {pushModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setPushModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border p-6 space-y-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              onClick={e => e.stopPropagation()}
            >
              <div>
                <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  Push "{pushModal.name}"
                </h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Clone this beer to other locations. Each location manages their own copy (prices, status).
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Select target locations
                </p>
                {locations.map((loc, i) => {
                  const alreadyExists = pushModal.locations.some(l => l.locationId === loc.id);
                  const isSelected = pushTargets.has(loc.id);

                  return (
                    <button
                      key={loc.id}
                      disabled={alreadyExists}
                      onClick={() => {
                        setPushTargets(prev => {
                          const next = new Set(prev);
                          if (next.has(loc.id)) next.delete(loc.id); else next.add(loc.id);
                          return next;
                        });
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all disabled:opacity-40"
                      style={{
                        borderColor: isSelected ? "var(--accent-gold)" : "var(--border)",
                        background: isSelected ? "color-mix(in srgb, var(--accent-gold) 8%, transparent)" : "transparent",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border"
                        style={{
                          borderColor: isSelected ? "var(--accent-gold)" : "var(--border)",
                          background: isSelected ? "var(--accent-gold)" : "transparent",
                        }}
                      >
                        {isSelected && <Check size={12} color="#0F0E0C" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{loc.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{loc.city}, {loc.state}</p>
                      </div>
                      {alreadyExists && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                          Already there
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPushModal(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePush}
                  disabled={pushTargets.size === 0 || pushing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
                >
                  <Copy size={14} />
                  {pushing ? "Pushing..." : `Push to ${pushTargets.size} location${pushTargets.size !== 1 ? "s" : ""}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Location Colors ──
const LOCATION_COLORS = [
  "#D4A843", "#4A7C59", "#7C4A6B", "#4A6B7C", "#7C6B4A", "#5C4A7C",
];

// ── Catalog Row ──
function CatalogRow({
  item, locations, index, expanded, onToggleExpand,
  batchMode, selected, onToggleSelect, onPush,
}: {
  item: CatalogItem;
  locations: Location[];
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  batchMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onPush: () => void;
}) {
  const anyOnTap = item.locations.some(l => l.isOnTap && !l.is86d);
  const any86d = item.locations.some(l => l.is86d);
  const emoji = ITEM_TYPE_EMOJI[item.itemType as keyof typeof ITEM_TYPE_EMOJI] ?? "🍺";
  const locationCount = item.locations.length;
  const totalLocations = locations.length;
  const missingCount = totalLocations - locationCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-90"
        onClick={batchMode ? onToggleSelect : onToggleExpand}
      >
        {/* Batch checkbox */}
        {batchMode && (
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border"
            style={{
              borderColor: selected ? "var(--accent-gold)" : "var(--border)",
              background: selected ? "var(--accent-gold)" : "transparent",
            }}
          >
            {selected && <Check size={12} color="#0F0E0C" />}
          </div>
        )}

        {/* Emoji + Name */}
        <span className="text-lg flex-shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {item.name}
            </p>
            {any86d && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", color: "var(--danger)" }}>
                86'd
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {item.style && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{item.style}</span>
            )}
            {item.abv != null && (
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{item.abv}%</span>
            )}
          </div>
        </div>

        {/* Location dots */}
        <div className="flex gap-1 flex-shrink-0">
          {locations.map((loc, i) => {
            const beerLoc = item.locations.find(l => l.locationId === loc.id);
            if (!beerLoc) {
              return (
                <div
                  key={loc.id}
                  className="w-3 h-3 rounded-full border"
                  style={{ borderColor: "var(--border)", background: "transparent" }}
                  title={`${loc.name}: not listed`}
                />
              );
            }
            return (
              <div
                key={loc.id}
                className="w-3 h-3 rounded-full"
                style={{
                  background: beerLoc.is86d
                    ? "var(--danger)"
                    : beerLoc.isOnTap
                      ? LOCATION_COLORS[i % LOCATION_COLORS.length]
                      : "var(--text-muted)",
                  opacity: beerLoc.isOnTap && !beerLoc.is86d ? 1 : 0.4,
                }}
                title={`${loc.name}: ${beerLoc.is86d ? "86'd" : beerLoc.isOnTap ? "on tap" : "off tap"}`}
              />
            );
          })}
        </div>

        {/* Stats */}
        <div className="text-right shrink-0 w-16 hidden sm:block">
          <p className="font-mono text-xs font-bold" style={{ color: "var(--accent-gold)" }}>{item.totalPours}</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>pours</p>
        </div>
        {item.avgRating && (
          <div className="text-right shrink-0 w-12 hidden sm:block">
            <p className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>{item.avgRating} ★</p>
          </div>
        )}

        {/* Expand indicator */}
        {!batchMode && (
          expanded
            ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} />
            : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        )}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && !batchMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
              {/* Per-location status table */}
              <div className="space-y-1.5">
                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Location Status
                </p>
                {locations.map((loc, i) => {
                  const beerLoc = item.locations.find(l => l.locationId === loc.id);
                  return (
                    <div key={loc.id} className="flex items-center gap-2.5 py-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: LOCATION_COLORS[i % LOCATION_COLORS.length] }}
                      />
                      <span className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>{loc.name}</span>
                      {beerLoc ? (
                        <>
                          <span
                            className="text-xs font-mono px-2 py-0.5 rounded-full"
                            style={{
                              background: beerLoc.is86d
                                ? "color-mix(in srgb, var(--danger) 15%, transparent)"
                                : beerLoc.isOnTap
                                  ? "color-mix(in srgb, #4A7C59 15%, transparent)"
                                  : "var(--surface-2)",
                              color: beerLoc.is86d ? "var(--danger)" : beerLoc.isOnTap ? "#4A7C59" : "var(--text-muted)",
                            }}
                          >
                            {beerLoc.is86d ? "86'd" : beerLoc.isOnTap ? "On Tap" : "Off Tap"}
                          </span>
                          {beerLoc.pricePerPint != null && (
                            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                              ${beerLoc.pricePerPint.toFixed(2)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs italic" style={{ color: "var(--text-muted)" }}>Not listed</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Push button */}
              {missingCount > 0 && (
                <button
                  onClick={onPush}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                  style={{ borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }}
                >
                  <Copy size={13} />
                  Push to {missingCount} more location{missingCount !== 1 ? "s" : ""}
                </button>
              )}

              {/* Description */}
              {item.description && (
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
