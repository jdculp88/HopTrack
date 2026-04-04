"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { spring, stagger } from "@/lib/animation";
import { formatRelativeTime } from "@/lib/dates";
import type { UserActivityEvent } from "@/lib/superadmin-user";

// ── Filter types ───────────────────────────────────────────────────────

type FilterType = "all" | "session" | "achievement" | "social";

const FILTERS: { id: FilterType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "session", label: "Sessions" },
  { id: "achievement", label: "Achievements" },
  { id: "social", label: "Social" },
];

function matchesFilter(event: UserActivityEvent, filter: FilterType): boolean {
  if (filter === "all") return true;
  if (filter === "session") return event.type === "session";
  if (filter === "achievement") return event.type === "achievement";
  if (filter === "social") return event.type === "reaction" || event.type === "comment" || event.type === "follow";
  return true;
}

// ── Group by date ──────────────────────────────────────────────────────

function groupByDate(events: UserActivityEvent[]): { date: string; label: string; events: UserActivityEvent[] }[] {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  const groups: Record<string, UserActivityEvent[]> = {};
  for (const event of events) {
    const dateKey = event.timestamp.slice(0, 10);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
  }

  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, events]) => ({
      date,
      label: date === today ? "Today" : date === yesterday ? "Yesterday" : new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      events,
    }));
}

// ── Component ──────────────────────────────────────────────────────────

interface Props {
  events: UserActivityEvent[];
}

export function ActivityTimeline({ events }: Props) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(
    () => events.filter(e => matchesFilter(e, filter)),
    [events, filter]
  );

  const displayed = showAll ? filtered : filtered.slice(0, 30);
  const groups = useMemo(() => groupByDate(displayed), [displayed]);

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setShowAll(false); }}
            className="px-3 py-1.5 rounded-xl text-xs font-mono transition-all"
            style={{
              background: filter === f.id ? "var(--accent-gold)" : "var(--surface-2)",
              color: filter === f.id ? "#0F0E0C" : "var(--text-secondary)",
              border: `1px solid ${filter === f.id ? "var(--accent-gold)" : "var(--border)"}`,
            }}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs font-mono self-center" style={{ color: "var(--text-muted)" }}>
          {filtered.length} events
        </span>
      </div>

      {/* Event groups */}
      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
            No activity found
          </p>
        </Card>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {groups.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-mono uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {group.label}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {group.events.length} event{group.events.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {group.events.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...spring.gentle, delay: i * 0.02 }}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors"
                      style={{ background: "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Icon */}
                      <span className="text-base flex-shrink-0 mt-0.5">{event.icon}</span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                          {event.title}
                        </p>
                        {event.detail && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                            {event.detail}
                          </p>
                        )}
                      </div>

                      {/* Time */}
                      <span
                        className="text-xs font-mono flex-shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Show more */}
      {!showAll && filtered.length > 30 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2.5 rounded-xl text-sm font-mono transition-all"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          Show all {filtered.length} events
        </button>
      )}
    </div>
  );
}
