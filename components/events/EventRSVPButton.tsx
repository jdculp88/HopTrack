"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Star, Users, Loader2 } from "lucide-react";

interface EventRSVPButtonProps {
  eventId: string;
  initialStatus: "going" | "interested" | null;
  goingCount: number;
  interestedCount: number;
  capacity?: number | null;
}

export function EventRSVPButton({
  eventId,
  initialStatus,
  goingCount: initialGoing,
  interestedCount: initialInterested,
  capacity,
}: EventRSVPButtonProps) {
  const [status, setStatus] = useState<"going" | "interested" | null>(initialStatus);
  const [going, setGoing] = useState(initialGoing);
  const [interested, setInterested] = useState(initialInterested);
  const [loading, setLoading] = useState(false);

  async function handleRSVP(newStatus: "going" | "interested") {
    if (loading) return;
    setLoading(true);

    try {
      if (status === newStatus) {
        // Toggle off
        await fetch(`/api/events/${eventId}/rsvp`, { method: "DELETE" });
        if (newStatus === "going") setGoing((g) => Math.max(0, g - 1));
        else setInterested((i) => Math.max(0, i - 1));
        setStatus(null);
      } else {
        // Set or switch
        const oldStatus = status;
        await fetch(`/api/events/${eventId}/rsvp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (oldStatus === "going") setGoing((g) => Math.max(0, g - 1));
        if (oldStatus === "interested") setInterested((i) => Math.max(0, i - 1));
        if (newStatus === "going") setGoing((g) => g + 1);
        else setInterested((i) => i + 1);
        setStatus(newStatus);
      }
    } catch {
      // Revert on error
    } finally {
      setLoading(false);
    }
  }

  const atCapacity = capacity != null && going >= capacity;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleRSVP("going")}
        disabled={loading || (atCapacity && status !== "going")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        style={{
          background: status === "going"
            ? "linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)"
            : "color-mix(in srgb, var(--surface-2) 80%, transparent)",
          color: status === "going" ? "var(--bg)" : "var(--text-secondary)",
          border: status === "going"
            ? "1px solid var(--accent-gold)"
            : "1px solid var(--border)",
        }}
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <CalendarCheck size={12} />
        )}
        Going{going > 0 && ` (${going})`}
      </button>

      <button
        onClick={() => handleRSVP("interested")}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
        style={{
          background: status === "interested"
            ? "color-mix(in srgb, var(--accent-gold) 20%, transparent)"
            : "color-mix(in srgb, var(--surface-2) 80%, transparent)",
          color: status === "interested" ? "var(--accent-gold)" : "var(--text-secondary)",
          border: status === "interested"
            ? "1px solid color-mix(in srgb, var(--accent-gold) 50%, transparent)"
            : "1px solid var(--border)",
        }}
      >
        <Star size={12} />
        Interested{interested > 0 && ` (${interested})`}
      </button>

      <AnimatePresence>
        {atCapacity && status !== "going" && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-mono"
            style={{ color: "var(--danger)" }}
          >
            Full
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
