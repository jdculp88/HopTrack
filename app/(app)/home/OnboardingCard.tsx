"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Beer, MapPin, UserPlus, X } from "lucide-react";

export function OnboardingCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      role="region"
      aria-label="Getting started"
      className="rounded-2xl p-5 relative"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, transparent), transparent)",
        border:
          "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
      }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <X size={16} />
      </button>
      <h3
        className="font-display text-lg font-bold mb-1"
        style={{ color: "var(--accent-gold)" }}
      >
        Welcome to HopTrack!
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Here&rsquo;s how to get started:
      </p>
      <div className="space-y-3">
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("hoptrack:open-checkin"))
          }
          className="flex items-center gap-3 w-full text-left p-3 rounded-xl transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            }}
          >
            <Beer size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Start a session
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Visit a brewery or drink at home
            </p>
          </div>
        </button>
        <Link
          href="/explore"
          className="flex items-center gap-3 w-full text-left p-3 rounded-xl transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            }}
          >
            <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Explore breweries
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Find breweries near you
            </p>
          </div>
        </Link>
        <Link
          href="/friends"
          className="flex items-center gap-3 w-full text-left p-3 rounded-xl transition-colors"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            }}
          >
            <UserPlus size={16} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Add friends
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              See what your friends are drinking
            </p>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
