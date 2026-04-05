// Four Favorites API — Sprint 162 (The Identity)
//
// GET  ?userId=X   → list user's pinned beers (public)
// PUT              → replace full pin state (authenticated, 0-4 beer_ids)
// DELETE           → clear all pins (authenticated)

import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiBadRequest,
  apiServerError,
} from "@/lib/api-response";

const MAX_PINS = 4;
const RATE_LIMIT = { limit: 30, windowMs: 60_000 };

type PinnedBeerRow = {
  id: string;
  user_id: string;
  beer_id: string;
  position: number;
  pinned_at: string;
  beer: {
    id: string;
    name: string;
    style: string | null;
    item_type: string | null;
    abv: number | null;
    avg_rating: number | null;
    brewery: { id: string; name: string } | null;
  } | null;
};

// ─── GET ───────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const limited = rateLimitResponse(req, "pinned-beers", RATE_LIMIT);
  if (limited) return limited;

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return apiBadRequest("userId required", "userId");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_pinned_beers")
    .select(
      "id, user_id, beer_id, position, pinned_at, beer:beers(id, name, style, item_type, abv, avg_rating, brewery:breweries(id, name))",
    )
    .eq("user_id", userId)
    .order("position", { ascending: true });

  if (error) return apiServerError(`pinned-beers GET: ${error.message}`);

  return apiSuccess((data ?? []) as unknown as PinnedBeerRow[]);
}

// ─── PUT — replace full pin state ──────────────────────────────────────────

export async function PUT(req: Request) {
  const limited = rateLimitResponse(req, "pinned-beers", RATE_LIMIT);
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  let body: { beer_ids?: unknown };
  try {
    body = await req.json();
  } catch {
    return apiBadRequest("Invalid JSON body");
  }

  if (!Array.isArray(body.beer_ids)) {
    return apiBadRequest("beer_ids must be an array", "beer_ids");
  }

  const beerIds = body.beer_ids.filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );

  if (beerIds.length > MAX_PINS) {
    return apiError(
      `Can only pin up to ${MAX_PINS} beers`,
      "TOO_MANY_PINS",
      400,
    );
  }

  // Reject duplicate beer_ids
  const unique = new Set(beerIds);
  if (unique.size !== beerIds.length) {
    return apiBadRequest("Cannot pin the same beer twice", "beer_ids");
  }

  // Verify all beer_ids exist in beers table
  if (beerIds.length > 0) {
    const { data: beers } = await supabase
      .from("beers")
      .select("id")
      .in("id", beerIds);
    const foundIds = new Set((beers ?? []).map((b: { id: string }) => b.id));
    const missing = beerIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      return apiBadRequest(
        `Unknown beer_id(s): ${missing.join(", ")}`,
        "beer_ids",
      );
    }
  }

  // Replace strategy: delete all then insert (RLS enforces user scope).
  // Using a transaction would be ideal, but supabase-js doesn't support
  // client-side transactions. Acceptable race window — user is editing
  // their own pins from one device.
  const { error: delError } = await supabase
    .from("user_pinned_beers")
    .delete()
    .eq("user_id", user.id);

  if (delError) {
    return apiServerError(`pinned-beers PUT delete: ${delError.message}`);
  }

  if (beerIds.length > 0) {
    const rows = beerIds.map((beer_id, position) => ({
      user_id: user.id,
      beer_id,
      position,
    }));

    const { error: insError } = await supabase
      .from("user_pinned_beers")
      .insert(rows);

    if (insError) {
      return apiServerError(`pinned-beers PUT insert: ${insError.message}`);
    }
  }

  // Return new state
  const { data, error } = await supabase
    .from("user_pinned_beers")
    .select(
      "id, user_id, beer_id, position, pinned_at, beer:beers(id, name, style, item_type, abv, avg_rating, brewery:breweries(id, name))",
    )
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  if (error) return apiServerError(`pinned-beers PUT read: ${error.message}`);
  return apiSuccess((data ?? []) as unknown as PinnedBeerRow[]);
}

// ─── DELETE — clear all pins ───────────────────────────────────────────────

export async function DELETE(req: Request) {
  const limited = rateLimitResponse(req, "pinned-beers", RATE_LIMIT);
  if (limited) return limited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const { error } = await supabase
    .from("user_pinned_beers")
    .delete()
    .eq("user_id", user.id);

  if (error) return apiServerError(`pinned-beers DELETE: ${error.message}`);
  return apiSuccess({ cleared: true });
}
