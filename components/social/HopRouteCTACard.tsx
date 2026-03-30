"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Map, Route } from "lucide-react";

export interface FriendActiveRoute {
  routeId: string;
  friendName: string;
  friendUsername: string;
  routeTitle: string;
  currentStop: number;
  totalStops: number;
}

export function HopRouteCTACard({ route, index = 0 }: { route: FriendActiveRoute; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="card-bg-hoproute rounded-2xl p-4 relative overflow-hidden"
      style={{
        border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, var(--border))",
      }}
    >

      {/* Live header */}
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <Map size={12} strokeWidth={1.5} style={{ color: "var(--accent-gold)" }} />
        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--accent-gold)" }}>
          HopRoute · Live
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse ml-1"
          style={{ background: "var(--accent-gold)" }}
        />
      </div>

      {/* Route info */}
      <p className="text-sm relative z-10" style={{ color: "var(--text-primary)" }}>
        <Link href={`/profile/${route.friendUsername}`} className="font-semibold hover:underline underline-offset-2">
          {route.friendName.split(" ")[0]}
        </Link>
        <span style={{ color: "var(--text-muted)" }}> is on a route</span>
      </p>
      <p className="font-display text-base font-bold mt-0.5 mb-3 relative z-10" style={{ color: "var(--text-primary)" }}>
        {route.routeTitle}
      </p>

      {/* Stop progress bar — segments */}
      <div className="flex items-center gap-1 mb-1.5 relative z-10">
        {Array.from({ length: route.totalStops }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full flex-1 transition-all"
            style={{
              background: i < route.currentStop
                ? "var(--accent-gold)"
                : "color-mix(in srgb, var(--border) 70%, transparent)",
            }}
          />
        ))}
      </div>
      <p className="text-[10px] font-mono mb-3 relative z-10" style={{ color: "var(--text-muted)" }}>
        Stop {route.currentStop} of {route.totalStops}
      </p>

      {/* Join CTA */}
      <Link
        href={`/hop-route/${route.routeId}`}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold relative z-10"
        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
      >
        <Route size={14} />
        Join {route.friendName.split(" ")[0]} on this route
      </Link>
    </motion.div>
  );
}
