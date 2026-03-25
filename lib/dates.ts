/**
 * Timezone-aware date formatting utilities.
 * All functions respect the user's local timezone via Intl.DateTimeFormat.
 */

/**
 * Format a date as "Mar 25, 2026"
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date as "Mar 25"
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date as "3/25/26"
 */
export function formatDateNumeric(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  }).format(new Date(date));
}

/**
 * Format a time as "9:45 PM"
 */
export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/**
 * Format as "Mar 25, 2026 at 9:45 PM"
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

/**
 * Relative time: "2 hours ago", "3 days ago", "just now"
 */
export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDateShort(date);
}

/**
 * Day of week label: "Monday", "Tuesday", etc.
 */
export function formatDayOfWeek(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(date));
}
