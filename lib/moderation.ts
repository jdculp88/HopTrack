/**
 * Review moderation utilities.
 * Sprint 156 — The Triple Shot
 */

// Blocklist of terms that trigger auto-flagging
const BLOCKLIST = [
  // Spam patterns
  "buy now",
  "click here",
  "free money",
  "bit.ly",
  "tinyurl",
  "earn cash",
  "limited offer",
  "act now",
  "subscribe here",
  "dm me",
];

export const MODERATION_REASONS = [
  "Spam or advertising",
  "Offensive or inappropriate content",
  "Fake or misleading review",
  "Harassment or bullying",
  "Other",
] as const;

export type ModerationReason = (typeof MODERATION_REASONS)[number];

export type ModerationStatus = "flagged" | "cleared" | "removed";

export function shouldAutoFlag(text: string): { flagged: boolean; reason: string | null } {
  if (!text) return { flagged: false, reason: null };
  const lower = text.toLowerCase();
  for (const term of BLOCKLIST) {
    if (lower.includes(term)) {
      return { flagged: true, reason: `Auto-flagged: contains "${term}"` };
    }
  }
  return { flagged: false, reason: null };
}
