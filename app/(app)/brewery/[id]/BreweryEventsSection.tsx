"use client";

import Link from "next/link";
import { Calendar, Clock, Beer } from "lucide-react";
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
  isAuthenticated?: boolean;
  returnPath?: string;
}

export function BreweryEventsSection({
  events,
  myEventRsvps,
  isAuthenticated = true,
  returnPath,
}: BreweryEventsSectionProps) {
  return (
    <div>
      <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] mb-3">
        Upcoming Events
      </h2>
      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map((event) => {
            const d = new Date(event.event_date);
            const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
            const day = d.getDate();
            const dow = d.toLocaleDateString("en-US", { weekday: "short" });

            // Human-readable time: "7:00 PM" not "19:00:00"
            function formatTime(t: string | null): string | null {
              if (!t) return null;
              const [h, m] = t.split(":");
              const hour = parseInt(h, 10);
              const ampm = hour >= 12 ? "PM" : "AM";
              const h12 = hour % 12 || 12;
              return `${h12}:${m} ${ampm}`;
            }
            const startTime = formatTime(event.start_time);
            const endTime = formatTime(event.end_time);
            const timeStr = startTime ? `${startTime}${endTime ? ` – ${endTime}` : ""}` : null;

            return (
              <div
                key={event.id}
                className="flex gap-3.5 p-4 rounded-[14px] border"
                style={{
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--amber, var(--accent-gold)) 4%, var(--card-bg, #FFFFFF)), color-mix(in srgb, var(--amber, var(--accent-gold)) 2%, var(--card-bg, #FFFFFF)))",
                  borderColor: "color-mix(in srgb, var(--amber, var(--accent-gold)) 20%, var(--border))",
                }}
              >
                {/* Date chip — Card Type 9 */}
                <div
                  className="w-[52px] flex-shrink-0 text-center rounded-xl border p-2"
                  style={{
                    background: "var(--card-bg, #FFFFFF)",
                    borderColor: "var(--border)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="font-mono text-[9px] font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--amber, var(--accent-gold))" }}>
                    {month}
                  </div>
                  <div className="font-mono text-[22px] font-bold leading-[1.1]" style={{ color: "var(--text-primary)" }}>
                    {day}
                  </div>
                  <div className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {dow}
                  </div>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                    {event.title}
                  </p>
                  {timeStr && (
                    <p className="font-mono text-[10.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {timeStr}
                    </p>
                  )}
                  <div className="flex gap-1.5 mt-2.5">
                    {isAuthenticated ? (
                      <EventRSVPButton
                        eventId={event.id}
                        initialStatus={
                          (myEventRsvps[event.id]?.status as "going" | "interested") ?? null
                        }
                        goingCount={0}
                        interestedCount={0}
                      />
                    ) : (
                      <Link
                        href={`/signup?next=${encodeURIComponent(returnPath ?? "/")}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg"
                        style={{ background: "var(--amber, var(--accent-gold))", color: "#fff" }}
                      >
                        <Beer size={11} />
                        Sign up to RSVP
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="text-center py-10 px-6 rounded-[14px]"
          style={{ background: "var(--surface, var(--bg))", border: "1.5px dashed var(--border)" }}
        >
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3"
            style={{ background: "var(--warm-bg, var(--surface-2))" }}
          >
            <Calendar size={24} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)] mb-1">No upcoming events</p>
          <p className="text-[13px] text-[var(--text-muted)]">
            Stay tuned for tap takeovers, trivia nights, and more.
          </p>
        </div>
      )}
    </div>
  );
}
