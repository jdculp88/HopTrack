"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { X, Download, Link } from "lucide-react";
import { HopMark } from "@/components/ui/HopMark";

// Self-contained cream palette — same pattern as SessionRecapSheet / The Board
const C = {
  bg: "#faf6f0",
  surface: "#ffffff",
  gold: "#C4913A",
  goldLight: "#F0D49A",
  text: "#2C1810",
  textSecondary: "#6B5744",
  textMuted: "#A08B7A",
  border: "#E8D5C0",
};

interface RouteStop {
  stop_order: number;
  brewery: { name: string; city: string | null } | null;
}

interface HopRoute {
  id: string;
  title: string;
  location_city: string | null;
  stop_count: number;
}

interface HopRouteShareCardProps {
  route: HopRoute;
  stops: RouteStop[];
  onClose: () => void;
  onCopied: () => void;
}

export function HopRouteShareCard({ route, stops, onClose, onCopied }: HopRouteShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    const { default: html2canvas } = await import("html2canvas");
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { backgroundColor: C.bg, scale: 2 });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `hoproute-${route.id.slice(0, 8)}.png`;
    a.click();
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/hop-route/${route.id}`);
    onCopied();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm space-y-4"
      >
        {/* The shareable card */}
        <div
          ref={cardRef}
          style={{
            background: `repeating-linear-gradient(165deg, transparent, transparent 18px, rgba(196,145,58,0.04) 18px, rgba(196,145,58,0.04) 19px), radial-gradient(ellipse at 70% 50%, rgba(196,145,58,0.07) 0%, transparent 55%), ${C.bg}`,
            borderRadius: 20,
            padding: 24,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.goldLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              🍺
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                {route.title}
              </p>
              {route.location_city && (
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>📍 {route.location_city}</p>
              )}
            </div>
          </div>

          {/* Stops */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stops.slice(0, 5).map((stop) => (
              <div key={stop.stop_order} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 8, background: C.goldLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: C.gold, flexShrink: 0,
                }}>
                  {stop.stop_order}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>
                    {stop.brewery?.name ?? "TBD"}
                  </p>
                  {stop.brewery?.city && (
                    <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>{stop.brewery.city}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <HopMark variant="horizontal" theme="cream" height={20} />
            <p style={{ fontSize: 11, color: C.textMuted, margin: 0 }}>Join this HopRoute →</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white"
            style={{ background: C.gold }}
          >
            <Download size={14} /> Save Image
          </button>
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Link size={14} /> Copy Link
          </button>
          <button
            onClick={onClose}
            className="w-12 flex items-center justify-center rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
