"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Search, Plus, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AddLocationModalProps {
  brandId: string;
  onAdd: (location: any) => void;
  onClose: () => void;
}

export function AddLocationModal({ brandId, onAdd, onClose }: AddLocationModalProps) {
  const [tab, setTab] = useState<"search" | "create">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const { error: toastError } = useToast();

  // Create form
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");

  const inputStyle = {
    width: "100%", padding: "10px 16px", borderRadius: 12,
    border: "1px solid var(--border)", background: "var(--surface-2)",
    color: "var(--text-primary)", fontSize: 14, outline: "none",
  };

  async function handleSearch() {
    if (query.length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      // Filter to breweries only
      const breweries = data.data?.breweries ?? data.breweries ?? [];
      setResults(breweries);
    } catch {
      toastError("Search failed");
    }
    setSearching(false);
  }

  async function handleAddExisting(breweryId: string) {
    setAdding(true);
    const res = await fetch(`/api/brand/${brandId}/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brewery_id: breweryId }),
    });
    const data = await res.json();
    setAdding(false);
    if (res.ok && data.data) {
      onAdd(data.data);
    } else {
      toastError(data.error?.message ?? "Failed to add location");
    }
  }

  async function handleCreateNew() {
    if (!newName || !newCity || !newState) return;
    setAdding(true);
    const res = await fetch(`/api/brand/${brandId}/locations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, city: newCity, state: newState }),
    });
    const data = await res.json();
    setAdding(false);
    if (res.ok && data.data) {
      onAdd(data.data);
    } else {
      toastError(data.error?.message ?? "Failed to create location");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>Add Location</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-opacity hover:opacity-70" style={{ color: "var(--text-muted)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 flex gap-2 mb-4">
          <button
            onClick={() => setTab("search")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === "search" ? "var(--accent-gold)" : "var(--surface-2)",
              color: tab === "search" ? "var(--bg)" : "var(--text-secondary)",
            }}
          >
            <Search size={14} className="inline mr-1.5" />
            Search Existing
          </button>
          <button
            onClick={() => setTab("create")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === "create" ? "var(--accent-gold)" : "var(--surface-2)",
              color: tab === "create" ? "var(--bg)" : "var(--text-secondary)",
            }}
          >
            <Plus size={14} className="inline mr-1.5" />
            Create New
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5" style={{ minHeight: 200 }}>
          {tab === "search" ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search breweries..."
                  style={inputStyle}
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || query.length < 2}
                  className="px-3 py-2 rounded-xl text-sm font-medium flex-shrink-0 disabled:opacity-40"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {results.map((b: any) => (
                  <button
                    key={b.id}
                    onClick={() => handleAddExisting(b.id)}
                    disabled={adding}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-left"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{b.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{b.city}, {b.state}</p>
                    </div>
                    <Plus size={14} style={{ color: "var(--accent-gold)" }} />
                  </button>
                ))}
                {results.length === 0 && query.length > 0 && !searching && (
                  <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
                    No breweries found. Try creating a new location.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Name</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={inputStyle} placeholder="Brewery name" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>City</label>
                  <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} style={inputStyle} placeholder="City" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>State</label>
                  <input type="text" value={newState} onChange={(e) => setNewState(e.target.value)} style={inputStyle} placeholder="NC" maxLength={2} />
                </div>
              </div>
              <button
                onClick={handleCreateNew}
                disabled={adding || !newName || !newCity || !newState}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {adding ? "Creating..." : "Create & Add Location"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
