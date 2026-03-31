// ─── Shared helpers extracted from BoardClient ──────────────────────────────

export function getInitials(name: string): string {
  const skip = ["the", "of", "and", "&", "co.", "co", "brewing", "brewery", "craft", "beer", "ales", "taproom", "pub"];
  const words = name.split(/\s+/).filter(w => !skip.includes(w.toLowerCase()));
  if (!words.length) return name[0]?.toUpperCase() ?? "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function formatEventDate(dateStr: string, time: string | null): string {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.toLocaleDateString(undefined, { weekday: "short" });
  const md = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!time) return `${day} ${md}`;
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${day} ${md} · ${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatPrice(price: number): string {
  return price % 1 === 0 ? `$${price.toFixed(0)}` : `$${price.toFixed(2)}`;
}

// ─── Cream Menu Color System ────────────────────────────────────────────────

export interface CreamColors {
  cream: string;
  gold: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  chipBg: string;
  chipBorder: string;
  danger: string;
}

export const CREAM: CreamColors = {
  cream: "#FBF7F0",
  gold: "#D4A843",
  text: "#1A1714",
  textMuted: "#6B5E4E",
  textSubtle: "#9E8E7A",
  border: "#E5DDD0",
  chipBg: "rgba(251,247,240,0.85)",
  chipBorder: "#DDD5C5",
  danger: "#C44B3A",
};

export const DARK: CreamColors = {
  cream: "#0F0E0C",
  gold: "#D4A843",
  text: "#F5F0E8",
  textMuted: "#8B7D6E",
  textSubtle: "#6B5E4E",
  border: "#2A2520",
  chipBg: "rgba(30,27,22,0.85)",
  chipBorder: "#3A3530",
  danger: "#E05545",
};
