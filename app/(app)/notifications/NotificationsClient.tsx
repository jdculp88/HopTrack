"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trophy, Users, Beer, Heart, TrendingUp, MessageCircle, Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/database";

const ICONS: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  friend_request:      { icon: <Users size={16} />,         color: "#4A7C59" },
  friend_checkin:      { icon: <Beer size={16} />,          color: "#D4A843" },
  tagged_checkin:      { icon: <Users size={16} />,         color: "#D4A843" },
  achievement_unlocked:{ icon: <Trophy size={16} />,        color: "#E8841A" },
  reaction:            { icon: <Heart size={16} />,         color: "#C44B3A" },
  session_cheers:      { icon: <Beer size={16} />,          color: "#D4A843" },
  session_comment:     { icon: <MessageCircle size={16} />, color: "#5B8DEF" },
  weekly_stats:        { icon: <TrendingUp size={16} />,    color: "var(--text-secondary)" },
  nudge:               { icon: <Beer size={16} />,          color: "var(--text-muted)" },
};

interface NotificationsClientProps {
  notifications: Notification[];
}

export function NotificationsClient({ notifications: initial }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initial);
  const [friendActions, setFriendActions] = useState<Record<string, "accepting" | "declining" | "accepted" | "declined">>({});
  const [markingRead, setMarkingRead] = useState(false);

  const unread = notifications.filter(n => !n.read).length;

  async function markAllRead() {
    setMarkingRead(true);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await fetch("/api/notifications", { method: "PATCH" });
    setMarkingRead(false);
  }

  async function handleFriendAccept(notifId: string, friendshipId: string) {
    setFriendActions(p => ({ ...p, [notifId]: "accepting" }));
    const res = await fetch("/api/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: friendshipId, status: "accepted" }),
    });
    if (res.ok) {
      setFriendActions(p => ({ ...p, [notifId]: "accepted" }));
    } else {
      setFriendActions(p => ({ ...p, [notifId]: undefined as any }));
    }
  }

  async function handleFriendDecline(notifId: string, friendshipId: string) {
    setFriendActions(p => ({ ...p, [notifId]: "declining" }));
    const res = await fetch("/api/friends", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: friendshipId }),
    });
    if (res.ok) {
      setFriendActions(p => ({ ...p, [notifId]: "declined" }));
    } else {
      setFriendActions(p => ({ ...p, [notifId]: undefined as any }));
    }
  }

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
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Notifications</h1>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingRead}
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n, i) => {
          const iconConfig = ICONS[n.type] ?? { icon: <Bell size={16} />, color: "var(--text-muted)" };
          const data = (n.data as Record<string, string> | null) ?? {};
          const friendState = friendActions[n.id];

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

                {/* Notification actions */}
                <div className="mt-2">
                  {/* Friend request — Accept / Decline */}
                  {n.type === "friend_request" && data.friendship_id && (
                    <AnimatePresence mode="wait">
                      {!friendState && (
                        <motion.div
                          key="buttons"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2"
                        >
                          <button
                            onClick={() => handleFriendAccept(n.id, data.friendship_id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#4A7C59]/20 text-[#4A7C59] hover:bg-[#4A7C59]/30 transition-colors"
                          >
                            <Check size={12} /> Accept
                          </button>
                          <button
                            onClick={() => handleFriendDecline(n.id, data.friendship_id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[var(--surface-2)]/60 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <X size={12} /> Decline
                          </button>
                        </motion.div>
                      )}
                      {(friendState === "accepting" || friendState === "declining") && (
                        <motion.p
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-[var(--text-muted)] font-mono"
                        >
                          {friendState === "accepting" ? "Accepting…" : "Declining…"}
                        </motion.p>
                      )}
                      {friendState === "accepted" && (
                        <motion.p
                          key="accepted"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-[#4A7C59] font-mono flex items-center gap-1"
                        >
                          <Check size={12} /> Friends!
                        </motion.p>
                      )}
                      {friendState === "declined" && (
                        <motion.p
                          key="declined"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-[var(--text-muted)] font-mono"
                        >
                          Request declined
                        </motion.p>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Session comment / friend checkin — View Session */}
                  {(n.type === "session_comment" || n.type === "friend_checkin") && data.session_id && (
                    <Link
                      href={`/session/${data.session_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                    >
                      <ExternalLink size={11} /> View Session
                    </Link>
                  )}

                  {/* Achievement unlocked — View Achievements */}
                  {n.type === "achievement_unlocked" && (
                    <Link
                      href="/profile/achievements"
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
                    >
                      <ExternalLink size={11} /> View Achievements
                    </Link>
                  )}
                </div>
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
