"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ToggleRight, Ban, CheckSquare, Square, Loader2, AlertTriangle } from "lucide-react";

interface BatchActionBarProps {
  selectedCount: number;
  filteredCount: number;
  batchSaving: boolean;
  batchDeleteConfirm: boolean;
  onSelectAll: () => void;
  onDone: () => void;
  onMark86: (mark: boolean) => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export function BatchActionBar({
  selectedCount,
  filteredCount,
  batchSaving,
  batchDeleteConfirm,
  onSelectAll,
  onDone,
  onMark86,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: BatchActionBarProps) {
  const allSelected = selectedCount === filteredCount && filteredCount > 0;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="overflow-hidden mb-4"
    >
      <div
        className="flex flex-col gap-3 px-4 py-3 rounded-xl border"
        style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }}
      >
        {/* Top row: select all + count + done */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onSelectAll}
              className="flex items-center gap-2 text-sm font-medium min-h-[44px] sm:min-h-0"
              style={{ color: "var(--accent-gold)" }}
            >
              {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
              {allSelected ? "Deselect All" : "Select All"}
            </button>
            {selectedCount > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
                {selectedCount} selected
              </span>
            )}
          </div>
          <button
            onClick={onDone}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border min-h-[44px] sm:min-h-0"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
          >
            Done
          </button>
        </div>

        {/* Bottom row: action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onMark86(true)}
            disabled={selectedCount === 0 || batchSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 min-h-[44px] sm:min-h-0"
            style={{ background: "rgba(196,75,58,0.15)", color: "var(--danger)", border: "1px solid rgba(196,75,58,0.3)" }}
          >
            {batchSaving ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
            Mark 86'd
          </button>
          <button
            onClick={() => onMark86(false)}
            disabled={selectedCount === 0 || batchSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 min-h-[44px] sm:min-h-0"
            style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            {batchSaving ? <Loader2 size={14} className="animate-spin" /> : <ToggleRight size={14} />}
            Un-86
          </button>
          <button
            onClick={onDeleteRequest}
            disabled={selectedCount === 0 || batchSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 min-h-[44px] sm:min-h-0"
            style={{ background: "var(--danger)", color: "#fff" }}
          >
            {batchSaving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
        </div>

        {/* Inline delete confirmation */}
        <AnimatePresence>
          {batchDeleteConfirm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
                style={{ background: "rgba(196,75,58,0.08)", borderColor: "rgba(196,75,58,0.4)" }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={13} style={{ color: "var(--danger)" }} />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Permanently remove <strong style={{ color: "var(--text-primary)" }}>{selectedCount} beer{selectedCount !== 1 ? "s" : ""}</strong>? This cannot be undone.
                  </span>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <button onClick={onDeleteCancel}
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                    Cancel
                  </button>
                  <button onClick={onDeleteConfirm}
                    disabled={batchSaving}
                    className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                    style={{ background: "var(--danger)", color: "#fff" }}>
                    {batchSaving ? <Loader2 size={12} className="animate-spin inline" /> : "Delete All"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
