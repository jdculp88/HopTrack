/**
 * FTC-compliant disclosure for incentivized ratings.
 * Required on ALL rating surfaces per FTC Consumer Review Rule.
 * Sprint 156 — The Triple Shot (P0 compliance).
 */
export function RatingDisclosure() {
  return (
    <p
      className="text-xs mt-1"
      style={{ color: "var(--text-muted)" }}
    >
      You earn XP for rating beers. Ratings reflect your honest opinion.
    </p>
  );
}
