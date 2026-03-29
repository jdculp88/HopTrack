"use client";

import { motion } from "framer-motion";

export type FeedTab = "friends" | "discover" | "you";

interface FeedTabBarProps {
  activeTab: FeedTab;
  onChange: (tab: FeedTab) => void;
}

const TABS: { key: FeedTab; label: string }[] = [
  { key: "friends", label: "Friends" },
  { key: "discover", label: "Discover" },
  { key: "you", label: "You" },
];

export function FeedTabBar({ activeTab, onChange }: FeedTabBarProps) {
  return (
    <div className="flex relative">
      {TABS.map(({ key, label }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex-1 py-3 text-sm font-sans transition-colors relative"
            style={{
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: active ? 600 : 400,
              letterSpacing: "0.3px",
            }}
            aria-pressed={active}
          >
            {label}
            {active && (
              <motion.div
                layoutId="feed-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "var(--accent-gold)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
      {/* Base line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "var(--border)" }}
      />
    </div>
  );
}
