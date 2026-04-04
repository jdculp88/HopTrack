"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flag, Send, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { MODERATION_REASONS } from "@/lib/moderation";
import { spring } from "@/lib/animation";

interface ReportButtonProps {
  reviewId: string;
  reviewType: "beer" | "brewery";
}

export function ReportButton({ reviewId, reviewType }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const { success, error: showError } = useToast();

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, review_type: reviewType, reason }),
      });
      if (res.ok) {
        success("Review reported. Our team will take a look.");
        setReported(true);
        setIsOpen(false);
        setReason("");
      } else {
        const data = await res.json();
        showError(data?.error?.message ?? "Failed to report review");
      }
    } catch {
      showError("Failed to report review");
    }
    setSubmitting(false);
  }

  if (reported) {
    return (
      <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
        Reported
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-[10px] transition-opacity hover:opacity-70"
        style={{ color: "var(--text-muted)" }}
        aria-label="Report this review"
      >
        <Flag size={10} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.default}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-xl border p-3 space-y-2"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Why are you reporting this review?
              </p>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-xs outline-none"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Select a reason...</option>
                {MODERATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!reason || submitting}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                  style={{ background: "var(--danger)", color: "white" }}
                >
                  <Send size={10} />
                  {submitting ? "Sending..." : "Report"}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setReason("");
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={10} />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
