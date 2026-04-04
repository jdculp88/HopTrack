/**
 * Trending content scoring algorithm.
 * Sprint 156 — The Triple Shot
 *
 * Time-decay scoring weights recent activity higher.
 * Used by the trending refresh cron to rank beers and breweries.
 */

export interface TrendingItem {
  content_type: "beer" | "brewery";
  content_id: string;
  name: string;
  city: string;
  score: number;
  checkin_count_24h: number;
  rating_count_24h: number;
  unique_users_24h: number;
  // Beer-specific
  style?: string;
  brewery_name?: string;
  // Brewery-specific
  state?: string;
}

/**
 * Time-decay scoring formula.
 *
 * score = (checkins * 3 + ratings * 2 + unique_users * 5) * e^(-hours/12)
 *
 * Weights:
 *   - Unique users (5x) — breadth of interest matters most
 *   - Check-ins (3x) — raw activity volume
 *   - Ratings (2x) — engagement depth
 *
 * Decay: half-life ~8.3 hours. Content older than 24h scores near zero.
 */
export function computeScore(
  checkins: number,
  ratings: number,
  uniqueUsers: number,
  hoursSinceLastActivity: number
): number {
  const rawScore = checkins * 3 + ratings * 2 + uniqueUsers * 5;
  const decay = Math.exp(-hoursSinceLastActivity / 12);
  return Math.round(rawScore * decay * 100) / 100;
}
