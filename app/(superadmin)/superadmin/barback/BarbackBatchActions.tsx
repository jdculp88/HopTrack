"use client";

import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";

interface BarbackBatchActionsProps {
  highConfCount: number;
  showBatchConfirm: boolean;
  batchLoading: boolean;
  onOpenConfirm: () => void;
  onCancelConfirm: () => void;
  onBatchApprove: () => void;
}

export function BarbackBatchActions({
  highConfCount,
  showBatchConfirm,
  batchLoading,
  onOpenConfirm,
  onCancelConfirm,
  onBatchApprove,
}: BarbackBatchActionsProps) {
  return (
    <>
      {highConfCount > 0 && (
        <button
          onClick={onOpenConfirm}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "rgba(61,122,82,0.12)", color: "var(--success)" }}
        >
          Approve All High Confidence ({highConfCount})
        </button>
      )}

      <AnimatePresence>
        {showBatchConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4"
          >
            <div
              className="rounded-2xl border p-4 flex items-center justify-between gap-4"
              style={{ background: "var(--surface)", borderColor: "var(--accent-gold)" }}
            >
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                Approve and promote{" "}
                <span className="font-mono font-bold" style={{ color: "var(--accent-gold)" }}>
                  {highConfCount}
                </span>{" "}
                beer{highConfCount === 1 ? "" : "s"} with confidence &ge; 0.85?
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={onCancelConfirm}
                  disabled={batchLoading}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={onBatchApprove}
                  disabled={batchLoading}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
                  style={{ background: "rgba(61,122,82,0.9)", color: "#fff" }}
                >
                  {batchLoading && <Loader2 size={14} className="animate-spin" />}
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
