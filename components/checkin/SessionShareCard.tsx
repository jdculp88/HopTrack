"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, Star, Beer, Zap } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { Session, BeerLog } from "@/types/database";

interface SessionShareCardProps {
  open: boolean;
  onClose: () => void;
  breweryName: string;
  beerLogs: BeerLog[];
  session: Session | null;
  xpGained: number;
}

function formatDuration(startedAt: string, endedAt?: string | null) {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function SessionShareCard({ open, onClose, breweryName, beerLogs, session, xpGained }: SessionShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { success, error: showError } = useToast();

  const ratedLogs = beerLogs.filter((b) => b.rating != null);
  const avgRating = ratedLogs.length > 0
    ? (ratedLogs.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedLogs.length).toFixed(1)
    : null;
  const beerCount = beerLogs.reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
  const duration = session ? formatDuration(session.started_at, session.ended_at) : "";

  const shareText = useCallback(() => {
    const lines = [
      `🍺 Just wrapped a session at ${breweryName}!`,
      `${beerCount} beer${beerCount !== 1 ? "s" : ""}${duration ? ` · ${duration}` : ""}${avgRating ? ` · avg ★ ${avgRating}` : ""}`,
      "",
      ...beerLogs.slice(0, 5).map((log: any) => {
        const name = log.beer?.name || "Unknown beer";
        const stars = log.rating ? ` ${"★".repeat(Math.round(log.rating))}` : "";
        return `  🍺 ${name}${stars}`;
      }),
      beerLogs.length > 5 ? `  ...and ${beerLogs.length - 5} more` : "",
      "",
      `+${xpGained} XP earned ✨`,
      "",
      "Tracked on HopTrack · hoptrack.app",
    ].filter(Boolean);
    return lines.join("\n");
  }, [breweryName, beerCount, duration, avgRating, beerLogs, xpGained]);

  async function handleShare() {
    const text = shareText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        success("Shared!");
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareText());
      success("Copied to clipboard!");
    } catch {
      showError("Failed to copy");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-sm"
          >
            {/* Close */}
            <div className="flex justify-end mb-3">
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Card */}
            <div
              ref={cardRef}
              className="rounded-3xl overflow-hidden"
              style={{ background: "#1C1A16" }}
            >
              {/* Gold header */}
              <div
                className="p-5 text-center"
                style={{ background: "linear-gradient(135deg, #D4A843 0%, #E8841A 100%)" }}
              >
                <p className="text-xs font-mono uppercase tracking-widest text-black/60 mb-1">
                  Session Recap
                </p>
                <h2 className="font-display text-2xl font-bold text-[#0F0E0C]">
                  {breweryName}
                </h2>
                {duration && (
                  <p className="text-sm text-black/70 mt-1">
                    {duration} · {beerCount} beer{beerCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Beer list */}
              <div className="p-4 space-y-2">
                {beerLogs.slice(0, 6).map((log: any) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Beer size={12} style={{ color: "#D4A843" }} />
                      <span className="text-sm text-white/90 truncate">
                        {log.beer?.name || "Unknown beer"}
                      </span>
                    </div>
                    {log.rating != null && (
                      <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                        <Star size={10} style={{ color: "#D4A843", fill: "#D4A843" }} />
                        <span className="text-xs font-mono" style={{ color: "#D4A843" }}>
                          {log.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {beerLogs.length > 6 && (
                  <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                    +{beerLogs.length - 6} more beers
                  </p>
                )}
              </div>

              {/* Stats */}
              <div
                className="mx-4 mb-4 grid grid-cols-3 gap-2 p-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div className="text-center">
                  <p className="font-mono font-bold text-lg" style={{ color: "#D4A843" }}>{beerCount}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Beers</p>
                </div>
                <div className="text-center">
                  {avgRating ? (
                    <>
                      <p className="font-mono font-bold text-lg" style={{ color: "#D4A843" }}>{avgRating}</p>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Avg Rating</p>
                    </>
                  ) : (
                    <>
                      <p className="font-mono font-bold text-lg" style={{ color: "rgba(255,255,255,0.3)" }}>—</p>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Rating</p>
                    </>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-mono font-bold text-lg" style={{ color: "#D4A843" }}>+{xpGained}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>XP</p>
                </div>
              </div>

              {/* Footer branding */}
              <div className="px-4 pb-4 flex items-center justify-center gap-2">
                <Beer size={12} style={{ color: "#D4A843" }} />
                <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                  HopTrack · Track Every Pour
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleShare}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: "linear-gradient(135deg, #D4A843 0%, #E8841A 100%)", color: "#0F0E0C" }}
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={handleCopy}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <Copy size={16} />
                Copy to clipboard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
