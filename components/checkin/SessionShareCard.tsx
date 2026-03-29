"use client";

import { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Copy, Star, Beer, Zap, Download, QrCode } from "lucide-react";
import { HopMark } from "@/components/ui/HopMark";
import QRCode from "react-qr-code";
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
  const [showQR, setShowQR] = useState(false);
  const [saving, setSaving] = useState(false);

  const ratedLogs = beerLogs.filter((b) => b.rating != null);
  const avgRating = ratedLogs.length > 0
    ? (ratedLogs.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedLogs.length).toFixed(1)
    : null;
  const beerCount = beerLogs.reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
  const duration = session ? formatDuration(session.started_at, session.ended_at) : "";

  const sessionUrl = session ? `${typeof window !== "undefined" ? window.location.origin : ""}/session/${session.id}` : "";

  const shareText = useCallback(() => {
    const lines = [
      `\u{1F37A} Just wrapped a session at ${breweryName}!`,
      `${beerCount} beer${beerCount !== 1 ? "s" : ""}${duration ? ` \u00B7 ${duration}` : ""}${avgRating ? ` \u00B7 avg \u2605 ${avgRating}` : ""}`,
      "",
      ...beerLogs.slice(0, 5).map((log: any) => {
        const name = log.beer?.name || "Unknown beer";
        const stars = log.rating ? ` ${"\u2605".repeat(Math.round(log.rating))}` : "";
        return `  \u{1F37A} ${name}${stars}`;
      }),
      beerLogs.length > 5 ? `  ...and ${beerLogs.length - 5} more` : "",
      "",
      `+${xpGained} XP earned \u2728`,
      "",
      sessionUrl || "Tracked on HopTrack \u00B7 hoptrack.app",
    ].filter(Boolean);
    return lines.join("\n");
  }, [breweryName, beerCount, duration, avgRating, beerLogs, xpGained, sessionUrl]);

  async function handleShare() {
    const text = shareText();
    if (navigator.share) {
      try {
        await navigator.share({ text, url: sessionUrl || undefined });
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

  async function handleSaveImage() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#1C1A16",
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `hoptrack-session-${session?.id?.slice(0, 8) || "recap"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      success("Image saved!");
    } catch {
      showError("Failed to save image");
    } finally {
      setSaving(false);
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
            className="w-full max-w-sm max-h-[90vh] overflow-y-auto"
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
                style={{ background: "linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)" }}
              >
                <p className="text-xs font-mono uppercase tracking-widest text-black/60 mb-1">
                  Session Recap
                </p>
                <h2 className="font-display text-2xl font-bold text-[var(--bg)]">
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
                      <Beer size={12} style={{ color: "var(--accent-gold)" }} />
                      <span className="text-sm text-white/90 truncate">
                        {log.beer?.name || "Unknown beer"}
                      </span>
                    </div>
                    {log.rating != null && (
                      <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                        <Star size={10} style={{ color: "var(--accent-gold)", fill: "var(--accent-gold)" }} />
                        <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
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
                  <p className="font-mono font-bold text-lg" style={{ color: "var(--accent-gold)" }}>{beerCount}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Beers</p>
                </div>
                <div className="text-center">
                  {avgRating ? (
                    <>
                      <p className="font-mono font-bold text-lg" style={{ color: "var(--accent-gold)" }}>{avgRating}</p>
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
                  <p className="font-mono font-bold text-lg" style={{ color: "var(--accent-gold)" }}>+{xpGained}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>XP</p>
                </div>
              </div>

              {/* QR Code (toggleable) */}
              <AnimatePresence>
                {showQR && session && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col items-center gap-2 px-4 pb-4">
                      <div className="bg-white p-3 rounded-xl">
                        <QRCode value={sessionUrl} size={100} />
                      </div>
                      <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Scan to view on HopTrack
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer branding */}
              <div className="px-4 pb-4 flex items-center justify-center" style={{ opacity: 0.35 }}>
                <HopMark variant="horizontal" theme="gold-mono" height={16} aria-hidden />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleShare}
                className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{ background: "linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%)", color: "var(--bg)" }}
              >
                <Share2 size={16} />
                Share
              </button>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleCopy}
                  className="py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 text-sm transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Copy size={14} />
                  Copy
                </button>
                <button
                  onClick={handleSaveImage}
                  disabled={saving}
                  className="py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 text-sm transition-all disabled:opacity-60"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Download size={14} />
                  {saving ? "..." : "Save"}
                </button>
                <button
                  onClick={() => setShowQR((v) => !v)}
                  className="py-3 rounded-xl font-medium flex items-center justify-center gap-1.5 text-sm transition-all"
                  style={{
                    background: showQR ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)" : "rgba(255,255,255,0.06)",
                    color: showQR ? "var(--accent-gold)" : "rgba(255,255,255,0.7)",
                    border: `1px solid ${showQR ? "color-mix(in srgb, var(--accent-gold) 30%, transparent)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <QrCode size={14} />
                  QR
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
