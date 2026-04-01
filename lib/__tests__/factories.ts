/**
 * Test data factories — Sprint 105 (The Test Wall)
 * Reese built these. Covers every core domain object.
 * Usage: createMockBrewery({ name: "Heist" }) — overrides merge with defaults.
 */

// ─── Types (inline to avoid import side-effects in test environments) ─────────

interface MockUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
  current_streak: number;
  subscription_tier: "free" | "tap" | "cask" | "barrel";
  created_at: string;
  bio: string | null;
  home_city: string | null;
  is_public: boolean;
  total_checkins: number;
  unique_beers: number;
  unique_breweries: number;
}

interface MockBrewery {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  street: string | null;
  latitude: number | null;
  longitude: number | null;
  subscription_tier: "free" | "tap" | "cask" | "barrel";
  is_verified: boolean;
  verified: boolean;
  phone: string | null;
  website: string | null;
  website_url: string | null;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  external_id: string | null;
}

interface MockBeer {
  id: string;
  brewery_id: string;
  name: string;
  style: string;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  is_on_tap: boolean;
  is_active: boolean;
  item_type: "beer" | "cider" | "wine" | "cocktail" | "na_beverage" | "food";
  avg_rating: number | null;
  total_ratings: number;
  created_at: string;
}

interface MockSession {
  id: string;
  user_id: string;
  brewery_id: string | null;
  started_at: string;
  ended_at: string | null;
  share_to_feed: boolean;
  xp_earned: number;
  xp_awarded: number;
  is_active: boolean;
  context: "brewery" | "home";
  created_at: string;
}

interface MockBeerLog {
  id: string;
  session_id: string;
  user_id: string;
  beer_id: string | null;
  rating: number | null;
  notes: string | null;
  comment: string | null;
  pour_size: string | null;
  serving_style: string | null;
  logged_at: string;
  quantity: number;
  brewery_id: string | null;
  flavor_tags: string[] | null;
  photo_url: string | null;
}

interface MockApiKey {
  id: string;
  brewery_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  rate_limit: number;
  created_by: string;
}

// ─── ID helper ───────────────────────────────────────────────────────────────

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Vitest / Node fallback — should not be needed in modern Node but kept as safety net
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const BASE_DATE = "2026-01-15T10:00:00.000Z";

// ─── createMockUser ───────────────────────────────────────────────────────────

export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  const id = overrides?.id ?? newId();
  return {
    id,
    username: "hopfan42",
    display_name: "Hop Fan",
    avatar_url: null,
    xp: 250,
    level: 3,
    streak_days: 5,
    current_streak: 5,
    subscription_tier: "free",
    created_at: BASE_DATE,
    bio: null,
    home_city: "Asheville, NC",
    is_public: true,
    total_checkins: 12,
    unique_beers: 10,
    unique_breweries: 4,
    ...overrides,
  };
}

// ─── createMockBrewery ────────────────────────────────────────────────────────

export function createMockBrewery(overrides?: Partial<MockBrewery>): MockBrewery {
  const id = overrides?.id ?? newId();
  return {
    id,
    name: "Heist Brewery",
    city: "Charlotte",
    state: "NC",
    address: "2909 N Davidson St, Charlotte, NC 28205",
    street: "2909 N Davidson St",
    latitude: 35.2271,
    longitude: -80.8431,
    subscription_tier: "free",
    is_verified: false,
    verified: false,
    phone: "704-375-8260",
    website: "https://heistbrewery.com",
    website_url: "https://heistbrewery.com",
    description: "Craft beer brewed in Charlotte, NC.",
    logo_url: null,
    created_at: BASE_DATE,
    external_id: null,
    ...overrides,
  };
}

// ─── createMockBeer ───────────────────────────────────────────────────────────

export function createMockBeer(overrides?: Partial<MockBeer>): MockBeer {
  const id = overrides?.id ?? newId();
  return {
    id,
    brewery_id: newId(),
    name: "Trail Blazer IPA",
    style: "IPA",
    abv: 6.5,
    ibu: 55,
    description: "A bold West Coast IPA with citrus and pine notes.",
    is_on_tap: true,
    is_active: true,
    item_type: "beer",
    avg_rating: 4.2,
    total_ratings: 38,
    created_at: BASE_DATE,
    ...overrides,
  };
}

// ─── createMockSession ────────────────────────────────────────────────────────

export function createMockSession(overrides?: Partial<MockSession>): MockSession {
  const id = overrides?.id ?? newId();
  return {
    id,
    user_id: newId(),
    brewery_id: newId(),
    started_at: BASE_DATE,
    ended_at: null,
    share_to_feed: true,
    xp_earned: 50,
    xp_awarded: 50,
    is_active: true,
    context: "brewery",
    created_at: BASE_DATE,
    ...overrides,
  };
}

// ─── createMockBeerLog ────────────────────────────────────────────────────────

export function createMockBeerLog(overrides?: Partial<MockBeerLog>): MockBeerLog {
  const id = overrides?.id ?? newId();
  return {
    id,
    session_id: newId(),
    user_id: newId(),
    beer_id: newId(),
    rating: 4,
    notes: "Really smooth finish.",
    comment: "Really smooth finish.",
    pour_size: "pint",
    serving_style: "draft",
    logged_at: BASE_DATE,
    quantity: 1,
    brewery_id: newId(),
    flavor_tags: ["Hoppy", "Citrusy"],
    photo_url: null,
    ...overrides,
  };
}

// ─── createMockApiKey ─────────────────────────────────────────────────────────

export function createMockApiKey(overrides?: Partial<MockApiKey>): MockApiKey {
  const id = overrides?.id ?? newId();
  const prefix = "ht_live_testkey1";
  return {
    id,
    brewery_id: newId(),
    name: "Test API Key",
    key_hash: "a".repeat(64),
    key_prefix: prefix,
    is_active: true,
    created_at: BASE_DATE,
    last_used_at: null,
    revoked_at: null,
    rate_limit: 100,
    created_by: newId(),
    ...overrides,
  };
}
