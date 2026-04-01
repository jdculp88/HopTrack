"use client";

import { Calendar, Clock } from "lucide-react";
import { EventRSVPButton } from "@/components/events/EventRSVPButton";

export interface BreweryEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: string;
  description: string | null;
}

const EVENT_EMOJIS: Record<string, string> = {
  tap_takeover: "🍺",
  release_party: "🎉",
  trivia: "🧠",
  live_music: "🎵",
  food_pairing: "🍽️",
  other: "📅",
};

interface BreweryEventsSectionProps {
  events: BreweryEvent[];
  myEventRsvps: Record<string, { status: string }>;
}

export function BreweryEventsSection({ events, myEventRsvps }: BreweryEventsSectionProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-3">
        Upcoming Events
      </h2>
      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map((event) => {
            const emoji = EVENT_EMOJIS[event.event_type] ?? "📅";
            const dateStr = new Date(event.event_date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            const timeStr = event.start_time
              ? `${event.start_time}${event.end_time ? ` – ${event.end_time}` : ""}`
              : null;

            return (
              <div
                key={event.id}
                className="card-bg-notification flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)]"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
                >
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-[var(--text-primary)] truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {dateStr}
                    </span>
                    {timeStr && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {timeStr}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <EventRSVPButton
                      eventId={event.id}
                      initialStatus={
                        (myEventRsvps[event.id]?.status as "going" | "interested") ?? null
                      }
                      goingCount={0}
                      interestedCount={0}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm text-[var(--text-secondary)]">
            No upcoming events — stay tuned for tap takeovers, trivia nights, and more.
          </p>
        </div>
      )}
    </div>
  );
}
