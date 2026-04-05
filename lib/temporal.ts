// Temporal stats — Sprint 162 (The Identity)
//
// Day-of-week + hour aggregation from beer_logs.logged_at timestamps.
// Timezone-safe: converts UTC timestamps to user's local timezone
// before bucketing. "Your Beer Thursday" style stats.

// ─── Types ─────────────────────────────────────────────────────────────────

export interface TemporalLog {
  logged_at: string; // ISO timestamp (UTC)
}

export interface DowAggregate {
  dow: number;    // 0 = Sunday, 6 = Saturday
  label: string;  // "Sunday", "Monday", ...
  count: number;
  share: number;  // 0.0 - 1.0
}

export interface HourAggregate {
  hour: number;   // 0-23
  label: string;  // "9am", "3pm", "midnight"
  count: number;
  share: number;
}

export interface TemporalProfile {
  favoriteDay: DowAggregate | null;
  favoriteHour: HourAggregate | null;
  dowBreakdown: DowAggregate[];  // all 7 days, sorted by dow asc
  hourBreakdown: HourAggregate[]; // only hours with count > 0
  totalLogs: number;
  hasEnoughData: boolean;        // false if < 5 logs
  timezone: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const MIN_LOGS_FOR_DATA = 5;

const DOW_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DOW_LOOKUP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Extracts local day-of-week (0-6) from an ISO timestamp in given timezone. */
function getLocalDow(isoTimestamp: string, timezone: string): number | null {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return null;
  try {
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
    }).format(d);
    return DOW_LOOKUP[weekday] ?? null;
  } catch {
    // Invalid timezone → fall back to UTC
    return d.getUTCDay();
  }
}

/** Extracts local hour-of-day (0-23) from an ISO timestamp in given timezone. */
function getLocalHour(isoTimestamp: string, timezone: string): number | null {
  const d = new Date(isoTimestamp);
  if (Number.isNaN(d.getTime())) return null;
  try {
    const hourStr = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(d);
    // Intl may return "24" for midnight in some locales; normalize to 0
    const hour = parseInt(hourStr, 10);
    if (Number.isNaN(hour)) return null;
    return hour === 24 ? 0 : hour;
  } catch {
    return d.getUTCHours();
  }
}

/** Formats an hour 0-23 as "9am", "3pm", "midnight", "noon". */
export function formatHourLabel(hour: number): string {
  if (hour === 0) return "midnight";
  if (hour === 12) return "noon";
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

// ─── Main API ──────────────────────────────────────────────────────────────

/**
 * Aggregates logs by day-of-week and hour-of-day in the user's local timezone.
 * Pass logs with logged_at UTC timestamps; returns profile with favorites.
 *
 * @param logs  - array of { logged_at: ISO string }
 * @param timezone - IANA tz (e.g. "America/New_York"); defaults to "America/New_York"
 */
export function computeTemporalProfile(
  logs: TemporalLog[],
  timezone: string = "America/New_York",
): TemporalProfile {
  const dowCounts = new Array(7).fill(0) as number[];
  const hourCounts = new Array(24).fill(0) as number[];
  let validLogs = 0;

  for (const log of logs) {
    const dow = getLocalDow(log.logged_at, timezone);
    const hour = getLocalHour(log.logged_at, timezone);
    if (dow === null || hour === null) continue;
    dowCounts[dow] += 1;
    hourCounts[hour] += 1;
    validLogs += 1;
  }

  const totalLogs = validLogs;
  const hasEnoughData = totalLogs >= MIN_LOGS_FOR_DATA;

  const dowBreakdown: DowAggregate[] = dowCounts.map((count, dow) => ({
    dow,
    label: DOW_LABELS[dow],
    count,
    share: totalLogs > 0 ? count / totalLogs : 0,
  }));

  const hourBreakdown: HourAggregate[] = hourCounts
    .map((count, hour) => ({
      hour,
      label: formatHourLabel(hour),
      count,
      share: totalLogs > 0 ? count / totalLogs : 0,
    }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count);

  const favoriteDay = !hasEnoughData
    ? null
    : [...dowBreakdown]
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count)[0] ?? null;

  const favoriteHour = !hasEnoughData ? null : hourBreakdown[0] ?? null;

  return {
    favoriteDay,
    favoriteHour,
    dowBreakdown,
    hourBreakdown,
    totalLogs,
    hasEnoughData,
    timezone,
  };
}

/**
 * Builds a "Your Beer Thursday" style stat line.
 * Returns null if insufficient data.
 */
export function formatTemporalHighlight(
  profile: TemporalProfile,
): string | null {
  if (!profile.favoriteDay) return null;
  const pct = Math.round(profile.favoriteDay.share * 100);
  return `Your Beer ${profile.favoriteDay.label} — ${pct}% of your pours`;
}
