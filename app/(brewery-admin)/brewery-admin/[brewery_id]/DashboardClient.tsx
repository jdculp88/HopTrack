"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Activity } from "lucide-react";
import { Sparkline } from "@/components/ui/Sparkline";

export { Sparkline };

// ── Active Sessions Counter (polls) ──────────────────────────────
interface ActiveSessionsProps {
  breweryId: string;
  initialCount: number;
}

export function ActiveSessionsCounter({ breweryId, initialCount }: ActiveSessionsProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/brewery/${breweryId}/active-sessions`);
        if (res.ok) {
          const { count: c } = await res.json();
          if (typeof c === "number") setCount(c);
        }
      } catch {
        // ignore — keep showing last known count
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [breweryId]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
        {count}
      </span>
      {count > 0 && (
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: "#22c55e" }}
        />
      )}
    </div>
  );
}

// ── Recent Activity Feed ──────────────────────────────────────────
export interface ActivityItem {
  id: string;
  type: "session" | "review" | "follower" | "achievement";
  text: string;
  subtext: string;
  time: string;
  icon: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivityFeed({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border p-6 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Activity size={20} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>No recent activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 px-4 py-3 rounded-xl transition-colors"
          style={{ background: i === 0 ? "var(--surface)" : "transparent" }}
        >
          <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {item.text}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {item.subtext}
            </p>
          </div>
          <span className="text-[10px] font-mono flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
            {item.time}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
