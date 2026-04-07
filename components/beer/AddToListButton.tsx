"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { List, Plus, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AddToListButtonProps {
  beerId: string;
  userId: string | null;
}

interface ListOption {
  id: string;
  title: string;
  hasItem: boolean;
}

export function AddToListButton({ beerId, userId }: AddToListButtonProps) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<ListOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const { success, error: showError } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    fetch(`/api/beer-lists?userId=${userId}`)
      .then((r) => r.json())
      .then((data: any[]) => {
        setLists(
          data.map((l) => ({
            id: l.id,
            title: l.title,
            hasItem: (l.items ?? []).some((i: any) => i.beer_id === beerId),
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, userId, beerId]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCreate(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = useCallback(
    async (listId: string, hasItem: boolean) => {
      if (hasItem) {
        // Remove
        const res = await fetch(`/api/beer-lists/${listId}/items?beer_id=${beerId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setLists((prev) =>
            prev.map((l) => (l.id === listId ? { ...l, hasItem: false } : l))
          );
          success("Removed from list");
        } else {
          showError("Failed to remove");
        }
      } else {
        // Add
        const res = await fetch(`/api/beer-lists/${listId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beer_id: beerId }),
        });
        if (res.ok) {
          setLists((prev) =>
            prev.map((l) => (l.id === listId ? { ...l, hasItem: true } : l))
          );
          success("Added to list!");
        } else if (res.status === 409) {
          showError("Already in this list");
        } else {
          showError("Failed to add");
        }
      }
    },
    [beerId, success, showError]
  );

  const handleCreateAndAdd = useCallback(async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      // Create the list
      const createRes = await fetch("/api/beer-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), description: "", is_public: true }),
      });
      if (!createRes.ok) throw new Error("create");
      const newList = await createRes.json();

      // Add the beer
      const addRes = await fetch(`/api/beer-lists/${newList.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beer_id: beerId }),
      });
      if (!addRes.ok) throw new Error("add");

      setLists((prev) => [{ id: newList.id, title: newTitle.trim(), hasItem: true }, ...prev]);
      setNewTitle("");
      setShowCreate(false);
      success(`Added to "${newTitle.trim()}"!`);
    } catch {
      showError("Failed to create list");
    }
    setCreating(false);
  }, [newTitle, beerId, success, showError]);

  if (!userId) return null;

  const anyAdded = lists.some((l) => l.hasItem);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
        style={{
          background: anyAdded
            ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)"
            : open
            ? "var(--surface-2)"
            : "var(--surface-2)",
          borderColor: anyAdded ? "var(--accent-gold)" : open ? "var(--accent-gold)" : "var(--border)",
          color: anyAdded ? "var(--accent-gold)" : open ? "var(--accent-gold)" : "var(--text-secondary)",
        }}
      >
        <List size={14} />
        {anyAdded ? "In a list" : "Add to List"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-60 rounded-xl border shadow-xl overflow-hidden z-50"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            {loading ? (
              <div className="p-4 text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Loading...
                </p>
              </div>
            ) : (
              <>
                {/* Existing lists */}
                {lists.length > 0 && (
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {lists.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleToggle(l.id, l.hasItem)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-black/5"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <span
                          className="w-4 h-4 flex items-center justify-center rounded flex-shrink-0"
                          style={{
                            background: l.hasItem
                              ? "color-mix(in srgb, var(--accent-gold) 20%, transparent)"
                              : "var(--surface-2)",
                          }}
                        >
                          {l.hasItem && <Check size={10} style={{ color: "var(--accent-gold)" }} />}
                        </span>
                        <span className="truncate flex-1">{l.title}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Divider */}
                {lists.length > 0 && (
                  <div style={{ height: 1, background: "var(--border)" }} />
                )}

                {/* Create new list */}
                <AnimatePresence>
                  {showCreate ? (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 space-y-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="List name"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateAndAdd();
                            if (e.key === "Escape") setShowCreate(false);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-xs border outline-none"
                          style={{
                            background: "var(--surface-2)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowCreate(false)}
                            className="flex-1 py-1.5 rounded-lg text-xs"
                            style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}
                          >
                            <X size={11} className="inline mr-1" />
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateAndAdd}
                            disabled={!newTitle.trim() || creating}
                            className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
                            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                          >
                            {creating ? "..." : "Create"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowCreate(true)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      <Plus size={14} />
                      Create new list
                    </button>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
