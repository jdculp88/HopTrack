"use client";

import { motion } from "framer-motion";
import { Bell, Trophy, Users, Beer, Heart, TrendingUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/database";

const ICONS: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  friend_request:      { icon: <Users size={16} />,     color: "#4A7C59" },
  friend_checkin:      { icon: <Beer size={16} />,      color: "#D4A843" },
  tagged_checkin:      { icon: <Users size={16} />,     color: "#D4A843" },
  achievement_unlocked:{ icon: <Trophy size={16} />,    color: "#E8841A" },
  reaction:            { icon: <Heart size={16} />,     color: "#C44B3A" },
  weekly_stats:        { icon: <TrendingUp size={16} />,color: "var(--text-secondary)" },
  nudge:               { icon: <Beer size={16} />,      color: "var(--text-muted)" },
};

interface NotificationsClientProps {
  notifications: Notification[];
}

export function NotificationsClient({ notifications }: NotificationsClientProps) {
  if (notifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-8">Notifications</h1>
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto">
            <Bell size={24} className="text-[var(--text-muted)]" />
          </div>
          <p className="font-display text-xl text-[var(--text-primary)]">All caught up!</p>
          <p className="text-[var(--text-secondary)] text-sm">No new notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Notifications</h1>

      <div className="space-y-2">
        {notifications.map((n, i) => {
          const iconConfig = ICONS[n.type] ?? { icon: <Bell size={16} />, color: "var(--text-muted)" };
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                !n.read
                  ? "bg-[var(--surface)] border-[#D4A843]/20"
                  : "bg-[var(--surface)]/50 border-[var(--border)]"
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${iconConfig.color}20`, color: iconConfig.color }}
              >
                {iconConfig.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[var(--text-primary)] text-sm">{n.title}</p>
                <p className="text-[var(--text-secondary)] text-sm mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1.5">{formatRelativeTime(n.created_at)}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-[#D4A843] flex-shrink-0 mt-2" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
