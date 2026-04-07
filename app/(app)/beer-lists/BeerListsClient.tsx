"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  ChevronDown,
  Lock,
  Globe,
  Trash2,
  Pencil,
  X,
  Beer,
  Check,
  ExternalLink,
  Star,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { StarRating } from "@/components/ui/StarRating";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import { generateGradientFromString } from "@/lib/utils";
import type { BeerList } from "@/types/database";

interface BeerListsClientProps {
  userId: string;
  initialLists: BeerList[];
}

export function BeerListsClient({ userId: _userId, initialLists }: BeerListsClientProps) {
  const [lists, setLists] = useState<BeerList[]>(initialLists);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPublic, setNewPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPublic, setEditPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/beer-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim(), is_public: newPublic }),
      });
      if (!res.ok) throw new Error();
      const list = await res.json();
      setLists((prev) => [{ ...list, items: [] }, ...prev]);
      setNewTitle("");
      setNewDesc("");
      setNewPublic(true);
      setShowCreate(false);
      success("List created!");
    } catch {
      showError("Failed to create list");
    }
    setCreating(false);
  }, [newTitle, newDesc, newPublic, success, showError]);

  const openEdit = useCallback((list: BeerList) => {
    setEditingId(list.id);
    setEditTitle(list.title);
    setEditDesc(list.description ?? "");
    setEditPublic(list.is_public);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/beer-lists/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), description: editDesc.trim(), is_public: editPublic }),
      });
      if (!res.ok) throw new Error();
      setLists((prev) =>
        prev.map((l) =>
          l.id === editingId
            ? { ...l, title: editTitle.trim(), description: editDesc.trim(), is_public: editPublic }
            : l
        )
      );
      setEditingId(null);
      success("List updated!");
    } catch {
      showError("Failed to update list");
    }
    setSaving(false);
  }, [editingId, editTitle, editDesc, editPublic, success, showError]);

  const handleDelete = useCallback(async (listId: string) => {
    try {
      const res = await fetch(`/api/beer-lists/${listId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setConfirmDeleteId(null);
      success("List deleted");
    } catch {
      showError("Failed to delete list");
    }
  }, [success, showError]);

  const handleRemoveBeer = useCallback(async (listId: string, beerId: string) => {
    try {
      const res = await fetch(`/api/beer-lists/${listId}/items?beer_id=${beerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, items: (l.items ?? []).filter((i) => i.beer_id !== beerId) }
            : l
        )
      );
    } catch {
      showError("Failed to remove beer");
    }
  }, [showError]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-[28px] tracking-[-0.02em]" style={{ color: "var(--text-primary)" }}>
          My Beer Lists
        </h1>
        <button
          onClick={() => { setShowCreate((v) => !v); setEditingId(null); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          <motion.div animate={{ rotate: showCreate ? 45 : 0 }} transition={{ duration: 0.15 }}>
            <Plus size={15} />
          </motion.div>
          New List
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <Card className="space-y-3" style={{ borderColor: "var(--accent-gold)" }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent-gold)" }}>
                New List
              </p>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="List title (e.g. My Top 10 Stouts)"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setNewPublic((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: newPublic ? "var(--accent-gold)" : "var(--text-muted)" }}
                >
                  {newPublic ? <Globe size={13} /> : <Lock size={13} />}
                  {newPublic ? "Public" : "Private"}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-3 py-1.5 rounded-xl text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newTitle.trim() || creating}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                  >
                    {creating ? "Creating..." : "Create List"}
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {lists.length === 0 && (
        <Card flat padding="spacious" className="text-center !py-10">
          <Beer size={36} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-display font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
            No lists yet — start curating!
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Build lists like &quot;Asheville Must-Tries&quot; or &quot;Best IPAs of 2026&quot;
          </p>
        </Card>
      )}

      {/* List cards */}
      <div className="space-y-3">
        {lists.map((list) => {
          const items = [...(list.items ?? [])].sort((a, b) => a.position - b.position);
          const isExpanded = expandedId === list.id;
          const isEditing = editingId === list.id;

          return (
            <Card
              key={list.id}
              bgClass="card-bg-collection"
              flat
              className="overflow-hidden !p-0"
            >
              {/* Card header */}
              <div className="flex items-center px-4 py-3 gap-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : list.id)}
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                >
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
                  </motion.div>

                  {/* Preview mosaic — first 4 beer thumbnails (Sprint 169) */}
                  {items.length > 0 && (
                    <div className="grid grid-cols-2 gap-0.5 w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      {items.slice(0, 4).map((item) => {
                        const beer = item.beer as any;
                        return (
                          <div
                            key={item.id}
                            className="w-full h-full"
                            style={{
                              background: beer?.cover_image_url
                                ? `url(${beer.cover_image_url}) center/cover`
                                : generateGradientFromString(beer?.name ?? "beer"),
                            }}
                          />
                        );
                      })}
                      {/* Fill empty slots */}
                      {items.length < 4 && Array.from({ length: 4 - Math.min(items.length, 4) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-full h-full" style={{ background: "var(--surface-2)" }} />
                      ))}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-display font-semibold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {list.title}
                      </span>
                      {!list.is_public ? (
                        <Lock size={10} style={{ color: "var(--text-muted)" }} />
                      ) : (
                        <Globe size={10} style={{ color: "var(--text-muted)" }} />
                      )}
                    </div>
                    {/* Stats line (Sprint 169) */}
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {items.length} beer{items.length !== 1 ? "s" : ""}
                      {(() => {
                        const styles = new Set(items.map((i: any) => i.beer?.style).filter(Boolean));
                        const ratings = items.map((i: any) => i.beer?.avg_rating).filter((r: any) => r != null);
                        const avg = ratings.length > 0 ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) : null;
                        return `${styles.size > 0 ? ` · ${styles.size} style${styles.size !== 1 ? "s" : ""}` : ""}${avg ? ` · ${avg} avg` : ""}`;
                      })()}
                    </span>
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => (isEditing ? setEditingId(null) : openEdit(list))}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: isEditing ? "var(--accent-gold)" : "var(--text-muted)" }}
                    title="Edit list"
                  >
                    {isEditing ? <Check size={14} /> : <Pencil size={14} />}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(confirmDeleteId === list.id ? null : list.id)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    title="Delete list"
                  >
                    {confirmDeleteId === list.id ? <X size={14} /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>

              {/* Inline edit form */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-4 pb-3 pt-1 space-y-2 border-t"
                      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                        style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 rounded-xl text-sm border outline-none"
                        style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                      />
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setEditPublic((v) => !v)}
                          className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: editPublic ? "var(--accent-gold)" : "var(--text-muted)" }}
                        >
                          {editPublic ? <Globe size={12} /> : <Lock size={12} />}
                          {editPublic ? "Public" : "Private"}
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editTitle.trim() || saving}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-50"
                          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline delete confirmation */}
              <AnimatePresence>
                {confirmDeleteId === list.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-4 py-3 border-t flex items-center justify-between"
                      style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--danger) 8%, transparent)" }}
                    >
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        Delete "{list.title}"? This can't be undone.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(list.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: "var(--danger)", color: "#fff" }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Beer list expanded */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t" style={{ borderColor: "var(--border)" }}>
                      {items.length === 0 ? (
                        <div className="px-4 py-4 text-center">
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            No beers here yet. Add from any beer page!
                          </p>
                        </div>
                      ) : (
                        <div className="px-3 py-3 space-y-3">
                          {items.map((item) => {
                            const beer = item.beer as any; // supabase join shape
                            const styleFamily = getStyleFamily(beer?.style ?? null);
                            const styleVars = getStyleVars(beer?.style ?? null);
                            return (
                              <div
                                key={item.id}
                                className="card-bg-reco flex items-center gap-3 p-3 rounded-xl transition-colors"
                                data-style={styleFamily}
                                style={{
                                  border: "1px solid var(--card-border)",
                                  borderLeft: `3px solid ${styleVars.primary}`,
                                }}
                              >
                                {/* Beer thumbnail */}
                                <div
                                  className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold"
                                  style={{
                                    background: beer?.cover_image_url
                                      ? `url(${beer.cover_image_url}) center/cover`
                                      : generateGradientFromString(beer?.name ?? "beer"),
                                    color: "rgba(255,255,255,0.8)",
                                  }}
                                >
                                  {!beer?.cover_image_url && (beer?.name?.[0]?.toUpperCase() ?? "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/beer/${beer?.id ?? ""}`}
                                    className="font-display text-sm font-semibold truncate block hover:text-[var(--accent-gold)] transition-colors"
                                    style={{ color: "var(--text-primary)" }}
                                  >
                                    {beer?.name ?? "Unknown"}
                                  </Link>
                                  {beer?.brewery?.name && (
                                    <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                                      {beer.brewery.name}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    {beer?.style && <BeerStyleBadge style={beer.style} size="xs" />}
                                    {beer?.abv != null && (
                                      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                                        {beer.abv}%
                                      </span>
                                    )}
                                    {beer?.avg_rating != null && (
                                      <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--accent-gold)" }}>
                                        <Star size={9} fill="currentColor" /> {beer.avg_rating.toFixed(1)}
                                      </span>
                                    )}
                                  </div>
                                  {item.note && (
                                    <p className="text-[10px] italic mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                      &quot;{item.note}&quot;
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveBeer(list.id, item.beer_id)}
                                  className="p-1.5 rounded-lg flex-shrink-0 transition-colors opacity-40 hover:opacity-100"
                                  style={{ color: "var(--danger)" }}
                                  title="Remove beer"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* View full list link */}
                      <div
                        className="px-4 py-2.5 border-t"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <Link
                          href={`/beer-lists/${list.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium"
                          style={{ color: "var(--accent-gold)" }}
                        >
                          <ExternalLink size={11} />
                          View full list
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
