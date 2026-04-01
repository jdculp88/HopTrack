"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Trophy, Users, Beer, Heart, TrendingUp, MessageCircle, Check, X, ExternalLink, ChevronDown } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { Notification, NotificationType } from "@/types/database";

const ICONS: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  friend_request:      { icon: <Users size={16} />,         color: "#4A7C59" },
  friend_checkin:      { icon: <Beer size={16} />,          color: "var(--accent-gold)" },
  tagged_checkin:      { icon: <Users size={16} />,         color: "var(--accent-gold)" },
  achievement_unlocked:{ icon: <Trophy size={16} />,        color: "var(--accent-amber)" },
  reaction:            { icon: <Heart size={16} />,         color: "#C44B3A" },
  session_cheers:      { icon: <Beer size={16} />,          color: "var(--accent-gold)" },
  session_comment:     { icon: <MessageCircle size={16} />, color: "#5B8DEF" },
  weekly_stats:        { icon: <TrendingUp size={16} />,    color: "var(--text-secondary)" },
  nudge:               { icon: <Beer size={16} />,          color: "var(--text-muted)" },
  brewery_follow:      { icon: <Heart size={16} />,         color: "var(--accent-gold)" },
  new_tap:             { icon: <Beer size={16} />,          color: "var(--accent-amber)" },
  new_event:           { icon: <Bell size={16} />,          color: "#5B8DEF" },
  first_referral:      { icon: <Users size={16} />,         color: "var(--accent-gold)" },
  group_invite:        { icon: <Users size={16} />,         color: "#5B8DEF" },
};

// Types that can be grouped when targeting the same session within 1 hour
const GROUPABLE_TYPES: NotificationType[] = ["reaction", "session_cheers", "session_comment"];
const ONE_HOUR_MS = 60 * 60 * 1000;

const GROUP_VERB: Record<string, string> = {
  reaction: "reacted to your session",
  session_cheers: "cheered your session",
  session_comment: "commented on your session",
};

interface NotificationGroup {
  kind: "single";
  notification: Notification;
}

interface NotificationGrouped {
  kind: "group";
  type: NotificationType;
  sessionId: string;
  notifications: Notification[];
  /** Distinct display names extracted from notification data/title */
  names: string[];
  /** Most recent created_at in the group */
  latestAt: string;
  /** True if any notification in the group is unread */
  hasUnread: boolean;
}

type FeedEntry = NotificationGroup | NotificationGrouped;

/** Extract a display name from a notification (best-effort from title) */
function extractName(n: Notification): string {
  const data = (n.data as Record<string, string> | null) ?? {};
  if (data.display_name) return data.display_name;
  if (data.username) return data.username;
  // Title is usually "Name cheered your session" — grab first word(s) before the verb
  const title = n.title ?? "";
  const match = title.match(/^(.+?)\s+(cheered|commented|reacted)/i);
  if (match) return match[1];
  return title.split(" ")[0] || "Someone";
}

/** Extract avatar info from notification data */
function extractAvatar(n: Notification): { display_name: string; avatar_url?: string | null } {
  const data = (n.data as Record<string, string> | null) ?? {};
  return {
    display_name: extractName(n),
    avatar_url: data.avatar_url ?? null,
  };
}

/** Group notifications by type + session_id within a 1-hour window */
function buildFeedEntries(notifications: Notification[]): FeedEntry[] {
  const entries: FeedEntry[] = [];
  const consumed = new Set<string>();

  for (let i = 0; i < notifications.length; i++) {
    const n = notifications[i];
    if (consumed.has(n.id)) continue;

    const data = (n.data as Record<string, string> | null) ?? {};
    const sessionId = data.session_id;

    // Only group groupable types that have a session_id
    if (GROUPABLE_TYPES.includes(n.type) && sessionId) {
      const group: Notification[] = [n];
      consumed.add(n.id);

      const baseTime = new Date(n.created_at).getTime();

      // Look ahead for same type + same session_id within 1 hour
      for (let j = i + 1; j < notifications.length; j++) {
        const candidate = notifications[j];
        if (consumed.has(candidate.id)) continue;
        const cData = (candidate.data as Record<string, string> | null) ?? {};
        if (
          candidate.type === n.type &&
          cData.session_id === sessionId &&
          Math.abs(new Date(candidate.created_at).getTime() - baseTime) < ONE_HOUR_MS
        ) {
          group.push(candidate);
          consumed.add(candidate.id);
        }
      }

      if (group.length === 1) {
        entries.push({ kind: "single", notification: n });
      } else {
        // Deduplicate names
        const nameSet = new Map<string, true>();
        const names: string[] = [];
        for (const g of group) {
          const name = extractName(g);
          if (!nameSet.has(name)) {
            nameSet.set(name, true);
            names.push(name);
          }
        }
        entries.push({
          kind: "group",
          type: n.type,
          sessionId,
          notifications: group,
          names,
          latestAt: group[0].created_at,
          hasUnread: group.some(g => !g.read),
        });
      }
    } else {
      consumed.add(n.id);
      entries.push({ kind: "single", notification: n });
    }
  }
  return entries;
}

/** Format grouped names: "Marcus, Drew, and 3 others" */
function formatGroupNames(names: string[], total: number): string {
  if (names.length === 1) return names[0];
  if (total <= 2) return names.join(" and ");
  if (total === 3) return `${names[0]}, ${names[1]}, and ${names[2]}`;
  const othersCount = total - 2;
  return `${names[0]}, ${names[1]}, and ${othersCount} ${othersCount === 1 ? "other" : "others"}`;
}

interface NotificationsClientProps {
  notifications: Notification[];
}

export function NotificationsClient({ notifications: initial }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initial);
  const [friendActions, setFriendActions] = useState<Record<string, "accepting" | "declining" | "accepted" | "declined" | undefined>>({});
  const [markingRead, setMarkingRead] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { success, error: showError } = useToast();

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleNotifications = useMemo(
    () => notifications.filter(n => !dismissedIds.has(n.id)),
    [notifications, dismissedIds]
  );

  const feedEntries = useMemo(() => buildFeedEntries(visibleNotifications), [visibleNotifications]);

  // Count unread by groups (a group with any unread counts as 1)
  const unread = useMemo(() => {
    return feedEntries.filter(entry => {
      if (entry.kind === "single") return !entry.notification.read;
      return entry.hasUnread;
    }).length;
  }, [feedEntries]);

  function toggleGroup(groupKey: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }

  async function markAllRead() {
    setMarkingRead(true);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        success("All notifications marked as read");
      } else {
        showError("Failed to mark notifications as read");
        setNotifications(initial);
      }
    } catch {
      showError("Failed to mark notifications as read");
      setNotifications(initial);
    }
    setMarkingRead(false);
  }

  async function dismissNotification(id: string, isUnread: boolean) {
    // Optimistic removal
    setDismissedIds(prev => new Set(prev).add(id));
    // If unread, mark as read on the server
    if (isUnread) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    }
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
      success("Friend request accepted!");
    } else {
      setFriendActions(p => ({ ...p, [notifId]: undefined }));
      showError("Failed to accept friend request");
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
      success("Friend request declined");
    } else {
      setFriendActions(p => ({ ...p, [notifId]: undefined }));
      showError("Failed to decline friend request");
    }
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="font-sans text-3xl font-bold text-[var(--text-primary)] mb-8">Notifications</h1>
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mx-auto">
              <Bell size={24} className="text-[var(--text-muted)]" />
            </div>
            <p className="font-display text-xl text-[var(--text-primary)]">The taps are quiet</p>
            <p className="text-[var(--text-secondary)] text-sm max-w-xs mx-auto">
              No notifications yet -- start a session to get social! Your friends&apos; cheers and comments will show up here.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-gold)] text-[var(--bg)] text-sm font-bold hover:bg-[var(--accent-amber)] transition-colors mt-2"
            >
              <Beer size={14} /> Find a Brewery
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold text-[var(--text-primary)]">Notifications</h1>
          {unread > 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-1">{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingRead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--accent-gold)] hover:bg-[var(--surface-2)] transition-colors disabled:opacity-50"
          >
            <motion.span className="flex items-center gap-1.5" whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
              <Check size={14} />
              {markingRead ? "Marking..." : "Mark all read"}
            </motion.span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {feedEntries.map((entry, i) => {
            if (entry.kind === "group") {
              return (
                <GroupedNotification
                  key={`group-${entry.type}-${entry.sessionId}-${entry.latestAt}`}
                  group={entry}
                  index={i}
                  expanded={expandedGroups.has(`${entry.type}-${entry.sessionId}-${entry.latestAt}`)}
                  onToggle={() => toggleGroup(`${entry.type}-${entry.sessionId}-${entry.latestAt}`)}
                />
              );
            }

            const n = entry.notification;
            return (
              <SingleNotification
                key={n.id}
                notification={n}
                index={i}
                friendActions={friendActions}
                onAccept={handleFriendAccept}
                onDecline={handleFriendDecline}
                onDismiss={() => dismissNotification(n.id, !n.read)}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar Stack                                                        */
/* ------------------------------------------------------------------ */

function AvatarStack({ notifications }: { notifications: Notification[] }) {
  // Show up to 3 overlapping avatars
  const avatars = notifications.slice(0, 3).map(n => extractAvatar(n));
  const remaining = notifications.length - 3;

  return (
    <div className="flex items-center flex-shrink-0 mt-0.5">
      {avatars.map((a, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-[var(--bg)] flex items-center justify-center overflow-hidden"
          style={{
            marginLeft: i === 0 ? 0 : -10,
            zIndex: 3 - i,
            position: "relative",
            background: `linear-gradient(135deg, var(--accent-gold), var(--accent-amber))`,
          }}
        >
          {a.avatar_url ? (
            <img
              src={a.avatar_url}
              alt={a.display_name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-[10px] font-bold text-[var(--bg)]">
              {a.display_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="w-8 h-8 rounded-full border-2 border-[var(--bg)] flex items-center justify-center"
          style={{
            marginLeft: -10,
            zIndex: 0,
            position: "relative",
            background: "var(--surface-2)",
          }}
        >
          <span className="text-[10px] font-bold text-[var(--text-secondary)]">+{remaining}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Grouped Notification                                                */
/* ------------------------------------------------------------------ */

function GroupedNotification({
  group,
  index,
  expanded,
  onToggle,
}: {
  group: NotificationGrouped;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const iconConfig = ICONS[group.type] ?? { icon: <Bell size={16} />, color: "var(--text-muted)" };
  const verb = GROUP_VERB[group.type] ?? "interacted with your session";
  const label = `${formatGroupNames(group.names, group.notifications.length)} ${verb}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      {/* Group header — clickable */}
      <button
        onClick={onToggle}
        className={`w-full flex items-start gap-4 p-4 rounded-2xl border transition-colors text-left ${
          group.hasUnread
            ? "card-bg-notification border-[var(--accent-gold)]/20"
            : "bg-[var(--surface)]/50 border-[var(--border)]"
        }`}
      >
        <AvatarStack notifications={group.notifications} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconConfig.color}20`, color: iconConfig.color }}
            >
              {iconConfig.icon}
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {group.notifications.length} notifications
            </span>
          </div>
          <p className="font-sans font-semibold text-[var(--text-primary)] text-sm">{label}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{formatRelativeTime(group.latestAt)}</p>

          {/* View Session link */}
          {group.sessionId && (
            <Link
              href={`/session/${group.sessionId}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors mt-1.5"
            >
              <ExternalLink size={11} /> View Session
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {group.hasUnread && (
            <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <ChevronDown size={14} className="text-[var(--text-muted)]" />
          </motion.div>
        </div>
      </button>

      {/* Expanded individual notifications */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="ml-6 mt-1 space-y-1 border-l-2 border-[var(--border)] pl-4">
              {group.notifications.map((n) => {
                const data = (n.data as Record<string, string> | null) ?? {};
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-sm ${
                      !n.read
                        ? "bg-[var(--surface)] border border-[var(--accent-gold)]/10"
                        : "bg-transparent"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, var(--accent-gold), var(--accent-amber))`,
                      }}
                    >
                      {data.avatar_url ? (
                        <img
                          src={data.avatar_url}
                          alt={extractName(n)}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-[8px] font-bold text-[var(--bg)]">
                          {extractName(n).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-primary)] text-sm truncate">{n.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{formatRelativeTime(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] flex-shrink-0" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Single Notification (unchanged from original)                       */
/* ------------------------------------------------------------------ */

function SingleNotification({
  notification: n,
  index: _index,
  friendActions,
  onAccept,
  onDecline,
  onDismiss,
}: {
  notification: Notification;
  index: number;
  friendActions: Record<string, "accepting" | "declining" | "accepted" | "declined" | undefined>;
  onAccept: (notifId: string, friendshipId: string) => void;
  onDecline: (notifId: string, friendshipId: string) => void;
  onDismiss: () => void;
}) {
  const iconConfig = ICONS[n.type] ?? { icon: <Bell size={16} />, color: "var(--text-muted)" };
  const data = (n.data as Record<string, string> | null) ?? {};
  const friendState = friendActions[n.id];

  return (
    <motion.div
      key={n.id}
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative group flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
        !n.read
          ? "card-bg-notification border-[var(--accent-gold)]/20"
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
                    onClick={() => onAccept(n.id, data.friendship_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#4A7C59]/20 text-[#4A7C59] hover:bg-[#4A7C59]/30 transition-colors"
                  >
                    <Check size={12} /> Accept
                  </button>
                  <button
                    onClick={() => onDecline(n.id, data.friendship_id)}
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
                  {friendState === "accepting" ? "Accepting..." : "Declining..."}
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

          {/* Group invite — Accept / Decline */}
          {n.type === "group_invite" && data.session_id && (
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
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/sessions/${data.session_id}/participants/status`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "accepted" }),
                        });
                        if (res.ok) onAccept(n.id, data.session_id);
                        else throw new Error();
                      } catch {
                        // error handled by parent via onAccept/onDecline state
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#5B8DEF]/20 text-[#5B8DEF] hover:bg-[#5B8DEF]/30 transition-colors"
                  >
                    <Check size={12} /> Join
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/sessions/${data.session_id}/participants/status`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "declined" }),
                      });
                      onDecline(n.id, data.session_id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[var(--surface-2)]/60 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <X size={12} /> Decline
                  </button>
                </motion.div>
              )}
              {friendState === "accepted" && (
                <motion.p
                  key="accepted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[#5B8DEF] font-mono flex items-center gap-1"
                >
                  <Check size={12} /> Joined!
                </motion.p>
              )}
              {friendState === "declined" && (
                <motion.p
                  key="declined"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[var(--text-muted)] font-mono"
                >
                  Invite declined
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
              href="/achievements"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
            >
              <ExternalLink size={11} /> View Achievements
            </Link>
          )}

          {/* First referral — View Invite Stats */}
          {n.type === "first_referral" && (
            <Link
              href="/settings#invite-friends"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors"
            >
              <ExternalLink size={11} /> View Invite Stats
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 flex-shrink-0 mt-1">
        {!n.read && (
          <div className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <motion.span className="flex items-center justify-center" whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
            <X size={12} />
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
}
