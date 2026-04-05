"use client";

// MinimizedSessionBar — Sprint 160 (The Flow, stretch)
// Extracted from AppShell.tsx + Liquid Glass treatment.
//
// iOS 26-style accessory bar: mesh gradient + glass overlay (backdrop-blur-2xl)
// + subtle gold edge. Appears above the mobile tab bar when a session is
// minimized. Tapping expands the TapWallSheet.

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Beer, ChevronUp } from "lucide-react";
import { spring } from "@/lib/animation";
import { buildMeshGradient, getBubbleGlow } from "@/lib/session-colors";
import type { BeerLog } from "@/types/database";

interface MinimizedSessionBarProps {
  breweryName: string;
  beerCount: number;
  startedAt: string;
  beerLogs: BeerLog[];
  onTap: () => void;
}

export function MinimizedSessionBar({
  breweryName,
  beerCount,
  startedAt,
  beerLogs,
  onTap,
}: MinimizedSessionBarProps) {
  const [timeLabel, setTimeLabel] = useState("");

  useEffect(() => {
    function compute() {
      const start = new Date(startedAt);
      const diffMs = Date.now() - start.getTime();
      const mins = Math.floor(diffMs / 60000);
      const hours = Math.floor(mins / 60);
      const rem = mins % 60;
      setTimeLabel(hours > 0 ? `${hours}h ${rem}m` : `${mins}m`);
    }
    compute();
    const interval = setInterval(compute, 60000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const meshGradient = buildMeshGradient(beerLogs);
  const bubbleGlow = getBubbleGlow(beerLogs);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={spring.default}
      className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-3 pb-2"
    >
      <button
        onClick={onTap}
        aria-label="Expand active session"
        className="w-full rounded-2xl overflow-hidden relative backdrop-blur-2xl"
        style={{
          background: meshGradient,
          boxShadow: `${bubbleGlow}, inset 0 1px 0 rgba(255,255,255,0.25), inset 0 0 0 1px color-mix(in srgb, var(--accent-gold) 25%, transparent)`,
          transition: "background 0.6s ease, box-shadow 0.6s ease",
        }}
      >
        {/* Liquid Glass overlay — translucent white gloss on top of mesh gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.00) 65%, rgba(255,255,255,0.08) 100%)",
          }}
        />
        <div className="flex items-center justify-between px-4 py-3 relative">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* Live indicator */}
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
                <Beer size={14} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-black/20 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black leading-none truncate">{breweryName}</p>
              <p className="text-xs text-black/70 leading-none mt-0.5 font-mono">
                {beerCount} {beerCount === 1 ? "beer" : "beers"} · {timeLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs font-semibold text-black/70">Expand</span>
            <ChevronUp size={16} className="text-black/70" />
          </div>
        </div>
      </button>
    </motion.div>
  );
}

export default MinimizedSessionBar;
