"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ChevronRight, Lock, Globe, Trash2, Beer, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { BeerList } from "@/types/database";

interface BeerListsSectionProps {
  lists: BeerList[];
  isOwnProfile: boolean;
  username: string;
}

export function BeerListsSection({ lists: initialLists, isOwnProfile }: BeerListsSectionProps) {
  const [lists, setLists] = useState(initialLists);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const handleCreate = useCallback(async () => {
    if (!title.trim()) return;
    setCreating(true);
    const res = await fetch("/api/beer-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, is_public: isPublic }),
    });
    if (res.ok) {
      const list = await res.json();
      setLists((prev) => [{ ...list, items: [] }, ...prev]);
      setTitle("");
      setDescription("");
      setShowCreate(false);
      success("List created!");
    } else {
      showError("Failed to create list");
    }
    setCreating(false);
  }, [title, description, isPublic, success, showError]);

  const handleDelete = useCallback(async (listId: string) => {
    const res = await fetch(`/api/beer-lists/${listId}`, { method: "DELETE" });
    if (res.ok) {
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setDeletingId(null);
      success("List deleted");
    } else {
      showError("Failed to delete");
    }
  }, [success, showError]);

  if (!isOwnProfile && lists.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
          Beer Lists
        </h3>
        {isOwnProfile && (
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
              color: "var(--accent-gold)",
            }}
          >
            {showCreate ? <X size={12} /> : <Plus size={12} />}
            {showCreate ? "Cancel" : "New List"}
          </button>
        )}
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-2xl border p-4 space-y-3"
              style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="List title (e.g. My Top 10 Stouts)"
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsPublic((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: isPublic ? "var(--accent-gold)" : "var(--text-muted)" }}
                >
                  {isPublic ? <Globe size={12} /> : <Lock size={12} />}
                  {isPublic ? "Public" : "Private"}
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!title.trim() || creating}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  {creating ? "Creating..." : "Create List"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List cards */}
      {lists.length === 0 && isOwnProfile ? (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
        >
          <Beer size={24} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="font-display text-sm" style={{ color: "var(--text-primary)" }}>No beer lists yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Curate your favorites — &quot;My Top 10 Stouts&quot;, &quot;Asheville Must-Tries&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {lists.map((list) => {
            const items = list.items ?? [];
            const isExpanded = expandedId === list.id;
            return (
              <div
                key={list.id}
                className="rounded-2xl border overflow-hidden"
                style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : list.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {list.title}
                      </p>
                      {!list.is_public && <Lock size={10} style={{ color: "var(--text-muted)" }} />}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {items.length} beer{items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="transition-transform shrink-0"
                    style={{
                      color: "var(--text-muted)",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 space-y-1.5 border-t" style={{ borderColor: "var(--border)" }}>
                        {items.length === 0 ? (
                          <p className="text-xs py-2" style={{ color: "var(--text-muted)" }}>
                            No beers in this list yet. Add some from beer pages!
                          </p>
                        ) : (
                          items
                            .sort((a, b) => a.position - b.position)
                            .map((item) => (
                              <div key={item.id} className="flex items-center gap-2 py-1.5">
                                <span className="text-xs font-mono w-5 text-right" style={{ color: "var(--text-muted)" }}>
                                  {item.position + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                                    {item.beer?.name ?? "Unknown"}
                                  </p>
                                  {item.beer?.style && (
                                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{item.beer.style}</p>
                                  )}
                                </div>
                                {item.beer?.avg_rating != null && (
                                  <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                                    {item.beer.avg_rating.toFixed(1)} ★
                                  </span>
                                )}
                              </div>
                            ))
                        )}
                        {isOwnProfile && (
                          <div className="pt-2 border-t flex justify-end" style={{ borderColor: "var(--border)" }}>
                            {deletingId === list.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs"
                                  style={{ color: "var(--text-secondary)" }}
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
                            ) : (
                              <button
                                onClick={() => setDeletingId(list.id)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: "var(--text-muted)" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
