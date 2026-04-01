"use client";

import { Calendar } from "lucide-react";
import { C, formatEventDate, type BoardEvent } from "./board-types";

interface BoardEventsProps {
  events: BoardEvent[];
}

/**
 * Renders the upcoming-events strip in the board footer.
 * Displays a Calendar icon before the first event, then event title + date
 * separated by mid-dots for subsequent entries.
 */
export function BoardEvents({ events }: BoardEventsProps) {
  if (events.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0, overflow: "hidden" }}>
      {events.map((ev, i) => (
        <div
          key={ev.id}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}
        >
          {i === 0 && <Calendar size={16} style={{ color: C.gold, flexShrink: 0 }} />}
          <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 600, fontSize: 16, color: C.text }}>
            {ev.title}
          </span>
          <span className="font-mono" style={{ fontSize: 14, color: C.gold }}>
            {formatEventDate(ev.event_date, ev.start_time)}
          </span>
          {i < events.length - 1 && (
            <span style={{ margin: "0 4px", color: C.textSubtle, fontSize: 14 }}>·</span>
          )}
        </div>
      ))}
    </div>
  );
}
