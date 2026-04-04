"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package, Search, Plus, Check, X, ChevronDown, ChevronUp,
  MapPin, Pencil, Archive, Send, GlassWater, Leaf,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ITEM_TYPE_EMOJI } from "@/types/database";
import { CatalogBeerFormModal } from "./CatalogBeerFormModal";

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
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  itemType: string;
  category: string | null;
  glassType: string | null;
  coverImageUrl: string | null;
  seasonal: boolean;
  isActive: boolean;
  totalPours: number;
  avgRating: number | null;
  ratingCount: number;
  locations: BeerLocation[];
  createdAt: string;
  updatedAt: string;
}

interface CatalogData {
  catalog: CatalogItem[];
  locations: Location[];
  stats: {
    totalCatalog: number;
    active: number;
    onTapSomewhere: number;
    availableEverywhere: number;
  };
}

type FilterValue = "all" | "on_tap" | "available_everywhere" | "not_pushed" | "seasonal" | "retired";

const LOCATION_COLORS = [
  "#D4A843", "#4A7C59", "#7C4A6B", "#4A6B7C", "#7C6B4A", "#5C4A7C",
];

// ── Component ────────────────────────────────────────────────────────────────

export function BrandCatalogClient({ brandId }: { brandId: string }) {
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBeer, setEditingBeer] = useState<CatalogItem | null>(null);
  const [pushModal, setPushModal] = useState<CatalogItem | null>(null);
  const [pushTargets, setPushTargets] = useState<Set<string>>(new Set());
  const [pushing, setPushing] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  async function fetchData(showLoading = false) {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/catalog`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch { /* keep loading */ }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- async fetch pattern, setState is after await
  useEffect(() => { void fetchData(); }, [brandId]); // loading starts true

  // ── Filtered catalog ──
  const filtered = useMemo(() => {
    if (!data) return [];
    let items = data.catalog;

    switch (filter) {
      case "on_tap":
        items = items.filter(c => c.isActive && c.locations.some(l => l.isOnTap && !l.is86d));
        break;
      case "available_everywhere":
        items = items.filter(c => c.isActive && c.locations.length === data.locations.length);
        break;
      case "not_pushed":
        items = items.filter(c => c.isActive && c.locations.length === 0);
        break;
      case "seasonal":
        items = items.filter(c => c.isActive && c.seasonal);
        break;
      case "retired":
        items = items.filter(c => !c.isActive);
        break;
      default:
        items = items.filter(c => c.isActive);
    }

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

  // ── Create / Edit ──
  async function handleSave(form: any) {
    try {
      const url = editingBeer
        ? `/api/brand/${brandId}/catalog/${editingBeer.id}`
        : `/api/brand/${brandId}/catalog`;
      const method = editingBeer ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toastSuccess(editingBeer ? `Updated ${form.name}` : `Added ${form.name} to catalog`);
        setShowForm(false);
        setEditingBeer(null);
        fetchData(true);
        return true;
      } else {
        const json = await res.json();
        toastError(json.error?.message ?? "Failed to save");
        return false;
      }
    } catch {
      toastError("Failed to save");
      return false;
    }
  }

  // ── Retire (soft delete) ──
  async function handleRetire(item: CatalogItem) {
    try {
      const res = await fetch(`/api/brand/${brandId}/catalog/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        toastSuccess(`${item.name} retired from catalog`);
        fetchData(true);
      } else {
        toastError("Failed to retire beer");
      }
    } catch {
      toastError("Failed to retire beer");
    }
  }

  // ── Restore ──
  async function handleRestore(item: CatalogItem) {
    try {
      const res = await fetch(`/api/brand/${brandId}/catalog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (res.ok) {
        toastSuccess(`${item.name} restored to catalog`);
        fetchData(true);
      }
    } catch {
      toastError("Failed to restore beer");
    }
  }

  // ── Push to locations ──
  async function handlePush() {
    if (!pushModal || pushTargets.size === 0) return;
    setPushing(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/catalog/${pushModal.id}/add-to-locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationIds: Array.from(pushTargets) }),
      });
      if (res.ok) {
        const json = await res.json();
        const d = json.data;
        toastSuccess(`${pushModal.name} — ${d.created} created, ${d.linked} linked, ${d.skipped} skipped`);
        setPushModal(null);
        setPushTargets(new Set());
        fetchData(true);
      } else {
        toastError("Failed to push to locations");
      }
    } catch {
      toastError("Failed to push to locations");
    }
    setPushing(false);
  }

  // ── Propagate changes ──
  async function handlePropagate(item: CatalogItem) {
    try {
      const res = await fetch(`/api/brand/${brandId}/catalog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propagate: true, name: item.name }),
      });
      if (res.ok) {
        const json = await res.json();
        toastSuccess(`Synced ${item.name} to ${json.data.propagated} location${json.data.propagated !== 1 ? "s" : ""}`);
      }
    } catch {
      toastError("Failed to propagate changes");
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Package size={32} style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading catalog...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Failed to load catalog</p>
        </div>
      </div>
    );
  }

  const { stats, locations } = data;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8 space-y-5">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Catalog", value: stats.totalCatalog, color: "var(--text-primary)" },
          { label: "Active", value: stats.active, color: "var(--accent-gold)" },
          { label: "On Tap Somewhere", value: stats.onTapSomewhere, color: "#4A7C59" },
          { label: "At All Locations", value: stats.availableEverywhere, color: "#7C4A6B" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-3.5 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters + Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-0 w-full sm:w-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border bg-transparent outline-none"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: "all", label: "All" },
            { value: "on_tap", label: "On Tap" },
            { value: "available_everywhere", label: "Everywhere" },
            { value: "not_pushed", label: "Not Pushed" },
            { value: "seasonal", label: "Seasonal" },
            { value: "retired", label: "Retired" },
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

        <button
          onClick={() => { setEditingBeer(null); setShowForm(true); }}
          className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-opacity hover:opacity-90 shrink-0"
          style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
        >
          <Plus size={14} /> Add to Catalog
        </button>
      </div>

      {/* Location Legend */}
      {locations.length > 0 && (
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
      )}

      {/* Catalog List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <GlassWater size={32} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {search ? "No beers match your search" : filter === "retired" ? "No retired beers" : "No beers in catalog yet"}
          </p>
          {filter === "all" && !search && (
            <button
              onClick={() => { setEditingBeer(null); setShowForm(true); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-80 mt-2"
              style={{ borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }}
            >
              Add your first beer
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, idx) => (
            <CatalogRow
              key={item.id}
              item={item}
              locations={locations}
              index={idx}
              expanded={expandedId === item.id}
              onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onEdit={() => { setEditingBeer(item); setShowForm(true); }}
              onRetire={() => handleRetire(item)}
              onRestore={() => handleRestore(item)}
              onPush={() => { setPushModal(item); setPushTargets(new Set()); }}
              onPropagate={() => handlePropagate(item)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <CatalogBeerFormModal
            editingBeer={editingBeer}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingBeer(null); }}
          />
        )}
      </AnimatePresence>

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
                  Add "{pushModal.name}" to Locations
                </h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Each location manages their own pricing and tap status.
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
                  <Send size={14} />
                  {pushing ? "Adding..." : `Add to ${pushTargets.size} location${pushTargets.size !== 1 ? "s" : ""}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Catalog Row ──────────────────────────────────────────────────────────────

function CatalogRow({
  item, locations, index, expanded, onToggleExpand,
  onEdit, onRetire, onRestore, onPush, onPropagate,
}: {
  item: CatalogItem;
  locations: Location[];
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onRetire: () => void;
  onRestore: () => void;
  onPush: () => void;
  onPropagate: () => void;
}) {
  const [confirmRetire, setConfirmRetire] = useState(false);
  const emoji = ITEM_TYPE_EMOJI[item.itemType as keyof typeof ITEM_TYPE_EMOJI] ?? "\u{1F37A}";
  const locationCount = item.locations.length;
  const totalLocations = locations.length;
  const missingCount = totalLocations - locationCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        opacity: item.isActive ? 1 : 0.6,
      }}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-90"
        onClick={onToggleExpand}
      >
        <span className="text-lg flex-shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {item.name}
            </p>
            {item.seasonal && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "color-mix(in srgb, #4A7C59 15%, transparent)", color: "#4A7C59" }}>
                <Leaf size={8} className="inline mr-0.5" />Seasonal
              </span>
            )}
            {!item.isActive && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                Retired
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

        {/* Location count badge */}
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: locationCount === totalLocations
              ? "color-mix(in srgb, #4A7C59 15%, transparent)"
              : locationCount === 0
                ? "var(--surface-2)"
                : "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            color: locationCount === totalLocations
              ? "#4A7C59"
              : locationCount === 0
                ? "var(--text-muted)"
                : "var(--accent-gold)",
          }}
        >
          {locationCount}/{totalLocations}
        </span>

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

        {expanded ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
              {/* Per-location status */}
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

              {/* Description */}
              {item.description && (
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {item.description}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <Pencil size={12} /> Edit
                </button>

                {item.isActive && missingCount > 0 && (
                  <button
                    onClick={onPush}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                    style={{ borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }}
                  >
                    <Send size={12} /> Add to {missingCount} location{missingCount !== 1 ? "s" : ""}
                  </button>
                )}

                {item.isActive && item.locations.length > 0 && (
                  <button
                    onClick={onPropagate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    <MapPin size={12} /> Sync to Locations
                  </button>
                )}

                {item.isActive ? (
                  <>
                    {!confirmRetire ? (
                      <button
                        onClick={() => setConfirmRetire(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                      >
                        <Archive size={12} /> Retire
                      </button>
                    ) : (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1.5"
                        >
                          <span className="text-xs" style={{ color: "var(--danger)" }}>Retire?</span>
                          <button
                            onClick={() => { onRetire(); setConfirmRetire(false); }}
                            className="px-2 py-1 rounded-lg text-xs font-bold"
                            style={{ background: "var(--danger)", color: "#fff" }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmRetire(false)}
                            className="px-2 py-1 rounded-lg text-xs font-semibold border"
                            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                          >
                            No
                          </button>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </>
                ) : (
                  <button
                    onClick={onRestore}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                    style={{ borderColor: "#4A7C59", color: "#4A7C59" }}
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
