"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Hop } from "lucide-react";

interface PintRewindShareCardProps {
  open: boolean;
  onClose: () => void;
  breweryName: string;
  scopeLabel: string;
  stats: {
    totalCheckins: number;
    uniqueVisitors: number;
    avgRating: string | null;
    topBeers: Array<{ name: string; count: number }>;
    busiestDay: string;
  };
}

export function PintRewindShareCard({
  open, onClose, breweryName, scopeLabel, stats,
}: PintRewindShareCardProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm"
          >
            {/* Close */}
            <div className="flex justify-end mb-3">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Share card — screenshot this */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: "#0F0E0C", border: "1px solid #3A3628" }}
            >
              {/* Gold header */}
              <div
                className="px-6 pt-8 pb-6"
                style={{ background: "linear-gradient(135deg, #D4A843 0%, #E8841A 100%)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Hop size={14} style={{ color: "#0F0E0C" }} />
                  <span
                    className="text-xs font-mono font-bold uppercase tracking-widest"
                    style={{ color: "rgba(15,14,12,0.7)" }}
                  >
                    HopTrack · Pint Rewind
                  </span>
                </div>
                <h2
                  className="font-display text-2xl font-bold leading-tight"
                  style={{ color: "#0F0E0C" }}
                >
                  {breweryName}
                </h2>
                <p className="text-sm font-medium mt-1" style={{ color: "rgba(15,14,12,0.65)" }}>
                  {scopeLabel}
                </p>
              </div>

              {/* Stats body */}
              <div className="px-5 py-5 space-y-3">
                {/* Top row */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "#1C1A16", border: "1px solid #3A3628" }}
                  >
                    <p className="font-display text-3xl font-bold" style={{ color: "#D4A843" }}>
                      {stats.totalCheckins.toLocaleString()}
                    </p>
                    <p
                      className="text-xs font-mono uppercase tracking-wider mt-1"
                      style={{ color: "#6B6456" }}
                    >
                      Check-ins
                    </p>
                  </div>
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "#1C1A16", border: "1px solid #3A3628" }}
                  >
                    <p className="font-display text-3xl font-bold" style={{ color: "#D4A843" }}>
                      {stats.uniqueVisitors.toLocaleString()}
                    </p>
                    <p
                      className="text-xs font-mono uppercase tracking-wider mt-1"
                      style={{ color: "#6B6456" }}
                    >
                      Visitors
                    </p>
                  </div>
                </div>

                {/* Top beer */}
                {stats.topBeers[0] && (
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "#1C1A16", border: "1px solid #3A3628" }}
                  >
                    <p
                      className="text-xs font-mono uppercase tracking-wider mb-1.5"
                      style={{ color: "#6B6456" }}
                    >
                      🥇 Top Beer
                    </p>
                    <p
                      className="font-display font-bold text-lg leading-tight"
                      style={{ color: "#F5F0E8" }}
                    >
                      {stats.topBeers[0].name}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "#A89F8C" }}>
                      {stats.topBeers[0].count} check-in{stats.topBeers[0].count !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {/* Bottom row */}
                <div className="grid grid-cols-2 gap-3">
                  {stats.avgRating && (
                    <div
                      className="rounded-2xl p-4"
                      style={{ background: "#1C1A16", border: "1px solid #3A3628" }}
                    >
                      <p className="font-display text-3xl font-bold" style={{ color: "#D4A843" }}>
                        {stats.avgRating} ★
                      </p>
                      <p
                        className="text-xs font-mono uppercase tracking-wider mt-1"
                        style={{ color: "#6B6456" }}
                      >
                        Avg Rating
                      </p>
                    </div>
                  )}
                  <div
                    className="rounded-2xl p-4"
                    style={{ background: "#1C1A16", border: "1px solid #3A3628" }}
                  >
                    <p className="font-display text-2xl font-bold" style={{ color: "#D4A843" }}>
                      {stats.busiestDay}
                    </p>
                    <p
                      className="text-xs font-mono uppercase tracking-wider mt-1"
                      style={{ color: "#6B6456" }}
                    >
                      Busiest Day
                    </p>
                  </div>
                </div>
              </div>

              {/* Branding footer */}
              <div
                className="px-5 pb-5 pt-1 flex items-center justify-between"
                style={{ borderTop: "1px solid #1C1A16" }}
              >
                <div className="flex items-center gap-1.5">
                  <Hop size={13} style={{ color: "#D4A843" }} />
                  <span className="font-display font-bold text-sm" style={{ color: "#D4A843" }}>
                    HopTrack
                  </span>
                </div>
                <span className="text-xs font-mono" style={{ color: "#3A3628" }}>
                  Track Every Pour
                </span>
              </div>
            </div>

            <p
              className="text-center text-xs mt-3"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Screenshot to share on social media
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
