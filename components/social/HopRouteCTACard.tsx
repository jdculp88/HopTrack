"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Map, Route } from "lucide-react";

export function HopRouteCTACard({ index = 0 }: { index?: number }) {
  void index; // used for future stagger if needed
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 12%, var(--surface)), color-mix(in srgb, var(--accent-amber) 6%, var(--surface)))",
        border:
          "1px solid color-mix(in srgb, var(--accent-gold) 25%, var(--border))",
      }}
    >
      {/* Bubble decorations */}
      {/* Large — top-right */}
      <div
        className="absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: "var(--accent-gold)", opacity: 0.07 }}
      />
      {/* Medium — bottom-left */}
      <div
        className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: "var(--accent-amber)", opacity: 0.05 }}
      />
      {/* Small — mid-right */}
      <div
        className="absolute top-1/2 -right-2 w-8 h-8 rounded-full pointer-events-none"
        style={{ background: "var(--accent-gold)", opacity: 0.08 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Top row: icon + label */}
        <div className="flex items-center gap-2 mb-2">
          <Map
            size={18}
            strokeWidth={1.5}
            style={{ color: "var(--accent-gold)" }}
          />
          <span
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: "var(--accent-gold)" }}
          >
            HopRoute
          </span>
        </div>

        {/* Heading */}
        <p
          className="font-display text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Ready for a crawl?
        </p>

        {/* Subtext */}
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Let AI plan your perfect brewery route.
        </p>

        {/* CTA button */}
        <Link
          href="/hop-route/new"
          className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: "var(--accent-gold)",
            color: "var(--bg)",
          }}
        >
          <Route size={14} />
          Plan a HopRoute
        </Link>
      </div>
    </motion.div>
  );
}
