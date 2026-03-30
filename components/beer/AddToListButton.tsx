"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, Plus, Check } from "lucide-react";
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
  const { success, error: showError } = useToast();

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
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, userId, beerId]);

  const handleToggle = useCallback(
    async (listId: string, hasItem: boolean) => {
      if (hasItem) return; // remove not supported from this button
      const res = await fetch(`/api/beer-lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beer_id: beerId }),
      });
      if (res.ok) {
        setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, hasItem: true } : l)));
        success("Added to list!");
      } else if (res.status === 409) {
        showError("Already in this list");
      } else {
        showError("Failed to add");
      }
    },
    [beerId, success, showError],
  );

  if (!userId) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
        style={{
          background: open ? "color-mix(in srgb, var(--accent-gold) 12%, transparent)" : "var(--surface-2)",
          borderColor: open ? "var(--accent-gold)" : "var(--border)",
          color: open ? "var(--accent-gold)" : "var(--text-secondary)",
        }}
      >
        <List size={14} />
        Add to List
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-lg overflow-hidden z-50"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {loading ? (
              <div className="p-4 text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading...</p>
              </div>
            ) : lists.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  No lists yet. Create one from your profile!
                </p>
              </div>
            ) : (
              <div className="py-1">
                {lists.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleToggle(l.id, l.hasItem)}
                    disabled={l.hasItem}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors disabled:opacity-60"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {l.hasItem ? (
                      <Check size={14} style={{ color: "var(--accent-gold)" }} />
                    ) : (
                      <Plus size={14} style={{ color: "var(--text-muted)" }} />
                    )}
                    <span className="truncate">{l.title}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
