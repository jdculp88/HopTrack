/**
 * First name extraction — Sprint 134 (The Tidy)
 *
 * Replaces 9+ instances of `.split(" ")[0]` scattered across social components.
 */
export function getFirstName(
  displayName?: string | null,
  username?: string | null
): string {
  return (displayName || username || "Someone").split(" ")[0];
}
