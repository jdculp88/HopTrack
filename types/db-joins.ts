/**
 * Typed Supabase join shapes — db-joins.ts
 *
 * Provides precise TypeScript interfaces for the most common Supabase
 * query result shapes that include embedded (joined) relations.
 *
 * Use these instead of ad-hoc `as any` casts whenever a Supabase query
 * embeds related rows via PostgREST syntax, e.g.:
 *
 *   .select("*, profile:profiles(*), beer_logs(*, beer:beers(*))")
 *
 * All field names and nullability match the live database schema.
 * Interfaces are intentionally standalone (not extending the base DB types)
 * so they remain stable if the base types are regenerated.
 */

// ─── Pour sizes ───────────────────────────────────────────────────────────────

/**
 * A single pour-size row from `beer_pour_sizes`, as returned by
 * embedded joins on beer queries.
 */
export interface PourSizeShape {
  id: string;
  beer_id: string;
  /** Short human label shown on the menu board, e.g. "Pint", "Half Pint" */
  label: string;
  /** Volume in fluid ounces; null when not applicable (e.g. bottle) */
  oz: number | null;
  /** Price in dollars */
  price: number | null;
  display_order: number;
}

// ─── Beer log with embedded beer ──────────────────────────────────────────────

/**
 * A `beer_logs` row with its nested `beer` relation resolved.
 * Used in session detail pages, feed cards, and profile history.
 */
export interface BeerLogWithBeer {
  id: string;
  session_id: string;
  user_id: string;
  beer_id: string | null;
  brewery_id: string | null;
  quantity: number;
  rating: number | null;
  flavor_tags: string[] | null;
  serving_style: string | null;
  comment: string | null;
  photo_url: string | null;
  logged_at: string;
  beer: {
    id: string;
    name: string;
    /** Canonical beer style string (e.g. "IPA", "Stout") */
    style: string | null;
    abv: number | null;
    ibu: number | null;
    avg_rating: number | null;
    image_url: string | null;
    /** One of: "beer" | "cider" | "wine" | "cocktail" | "na_beverage" | "food" */
    item_type: string;
    glass_type: string | null;
  } | null;
}

// ─── Session with full joins ──────────────────────────────────────────────────

/**
 * A `sessions` row with profile, brewery, beer_logs (including nested beers),
 * and optional session photos resolved.
 *
 * Matches the result of a query like:
 *   .select("*, profile:profiles(*), brewery:breweries(*), beer_logs(*, beer:beers(*)), session_photos(*)")
 */
export interface SessionWithJoins {
  id: string;
  user_id: string;
  brewery_id: string | null;
  /** "brewery" | "home" */
  context: string;
  started_at: string;
  ended_at: string | null;
  is_active: boolean;
  share_to_feed: boolean;
  note: string | null;
  /** XP awarded on session end */
  xp_awarded: number;
  created_at: string;
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    level: number;
    xp: number;
    current_streak: number;
  } | null;
  brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    logo_url: string | null;
  } | null;
  beer_logs: BeerLogWithBeer[];
  session_photos: {
    id: string;
    url: string;
    created_at: string;
  }[];
}

// ─── Beer with brewery and pour sizes ─────────────────────────────────────────

/**
 * A `beers` row with its parent brewery and pour sizes resolved.
 * Used in tap-list displays, beer detail pages, and the public v1 API.
 */
export interface BeerWithBrewery {
  id: string;
  brewery_id: string;
  name: string;
  style: string | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  /** Primary image URL for the beer */
  image_url: string | null;
  cover_image_url: string | null;
  avg_rating: number | null;
  total_ratings: number;
  is_on_tap: boolean;
  is_featured: boolean;
  /** One of: "beer" | "cider" | "wine" | "cocktail" | "na_beverage" | "food" */
  item_type: string;
  category: string | null;
  glass_type: string | null;
  created_at: string;
  brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    logo_url: string | null;
  } | null;
  /** Available pour sizes ordered by display_order */
  pour_sizes: PourSizeShape[];
}

// ─── Brewery with derived stats ────────────────────────────────────────────────

/**
 * A `breweries` row augmented with aggregated stats computed in the API layer.
 * The `followers_count` and `checkins_count` fields are not stored columns —
 * they are calculated from related tables and attached by the API route.
 */
export interface BreweryWithStats {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  /** Street address */
  street: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
  website_url: string | null;
  phone: string | null;
  /** "free" | "tap" | "cask" | "barrel" */
  subscription_tier: string;
  is_verified: boolean;
  /** Aggregated: total followers count */
  followers_count?: number;
  /** Aggregated: total check-in / session count */
  checkins_count?: number;
}

// ─── Profile with aggregated stats ────────────────────────────────────────────

/**
 * A `profiles` row with all stats columns included.
 * Used in profile pages, leaderboards, and the /api/v1/users shape.
 */
export interface ProfileWithStats {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  xp: number;
  level: number;
  /** Current consecutive-day streak */
  current_streak: number;
  longest_streak: number;
  /** Total number of brewery sessions */
  total_checkins: number;
  /** Total distinct beer styles logged */
  unique_beers: number;
  /** Total distinct breweries visited */
  unique_breweries: number;
  is_public: boolean;
  created_at: string;
}
