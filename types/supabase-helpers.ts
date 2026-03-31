/**
 * Supabase query helper types — common join shapes and utility types
 * used across API routes and components.
 *
 * Created: Sprint 65 (Type Safety Sweep)
 */

import type { Profile, Beer, Brewery, BeerLog, Session, BeerReview, BreweryReview } from "./database";

// ─── Common Profile Shapes ──────────────────────────────────────────────────
/** Minimal profile shape returned from most Supabase joins */
export type ProfileSummary = Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;

/** Profile shape with streak/level info (used in feed sessions) */
export type ProfileWithLevel = ProfileSummary & Pick<Profile, "current_streak" | "level">;

// ─── Common Beer Shapes ─────────────────────────────────────────────────────
/** Minimal beer shape from joins */
export type BeerSummary = Pick<Beer, "id" | "name" | "style">;

/** Beer shape with rating/glass info (used in feed cards, beer log joins) */
export type BeerWithRating = BeerSummary & Pick<Beer, "abv" | "avg_rating"> & { glass_type?: string | null };

// ─── Common Brewery Shapes ──────────────────────────────────────────────────
/** Minimal brewery shape from joins */
export type BrewerySummary = Pick<Brewery, "id" | "name" | "city" | "state">;

// ─── Session Join Shapes ────────────────────────────────────────────────────
/** Session with all common joins (used in feed, profile, session detail) */
export interface SessionWithJoins extends Omit<Session, "brewery" | "beer_logs" | "profile" | "session_photos"> {
  brewery: BrewerySummary | null;
  beer_logs: BeerLog[];
  profile: ProfileWithLevel | null;
  session_photos?: { id: string; url: string; created_at: string }[];
}

// ─── Review Join Shapes ─────────────────────────────────────────────────────
/** Beer review with profile join */
export interface BeerReviewWithProfile extends Omit<BeerReview, "profile"> {
  profile: ProfileSummary | null;
}

/** Brewery review with profile join */
export interface BreweryReviewWithProfile extends Omit<BreweryReview, "profile"> {
  profile: ProfileSummary | null;
}

// ─── API Response Helpers ───────────────────────────────────────────────────
/** Standard success response shape */
export interface ApiSuccess<T> {
  data: T;
}

/** Standard error response shape */
export interface ApiError {
  error: string;
}
