/**
 * Following Explore API — Sprint 160 (The Flow)
 *
 * Returns aggregate activity from people + breweries the user follows:
 *   - friendCheckins: friends' recent beer_logs (last 7d), grouped by beer
 *   - newAtFollowed: new beers added at followed breweries (last 7d)
 *
 * Auth required.
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api-response";

// Rate limit: 30 req/min per user (in-memory, per-process)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAuth(supabase);
    if (!user) return apiUnauthorized();

    // Rate limit
    const now = Date.now();
    const bucket = rateLimitMap.get(user.id);
    if (bucket && bucket.resetAt > now) {
      if (bucket.count >= 30) return apiError("Rate limit exceeded", "RATE_LIMITED", 429);
      bucket.count++;
    } else {
      rateLimitMap.set(user.id, { count: 1, resetAt: now + 60_000 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const upperBound = new Date().toISOString();

    // 1. Friends list
    const { data: friendshipsRaw } = await (supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted") as any);

    const friendIds: string[] = ((friendshipsRaw ?? []) as any[]).map(
      (f: { requester_id: string; addressee_id: string }) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
    );

    // 2. Followed breweries
    const { data: followsRaw } = await (supabase
      .from("brewery_follows")
      .select("brewery_id")
      .eq("user_id", user.id) as any);

    const followedBreweryIds: string[] = ((followsRaw ?? []) as any[]).map((f: any) => f.brewery_id);

    // 3. Friend check-ins (last 7d)
    let friendCheckins: Array<{
      beer_id: string;
      name: string;
      style: string | null;
      brewery_id: string | null;
      brewery_name: string | null;
      count: number;
      friendNames: string[];
    }> = [];

    if (friendIds.length > 0) {
      const { data: logsRaw } = await (supabase
        .from("beer_logs")
        .select("beer_id, user_id, logged_at, beer:beers(id, name, style, brewery_id, brewery:breweries(id, name))")
        .in("user_id", friendIds)
        .gte("logged_at", sevenDaysAgo)
        .lt("logged_at", upperBound)
        .not("beer_id", "is", null)
        .limit(2000) as any);

      const beerMap = new Map<
        string,
        {
          beer_id: string;
          name: string;
          style: string | null;
          brewery_id: string | null;
          brewery_name: string | null;
          count: number;
          friendIds: Set<string>;
        }
      >();

      for (const log of ((logsRaw ?? []) as any[])) {
        if (!log.beer_id || !log.beer) continue;
        const existing = beerMap.get(log.beer_id);
        if (existing) {
          existing.count++;
          existing.friendIds.add(log.user_id);
        } else {
          beerMap.set(log.beer_id, {
            beer_id: log.beer_id,
            name: log.beer?.name ?? "Unknown Beer",
            style: log.beer?.style ?? null,
            brewery_id: log.beer?.brewery?.id ?? null,
            brewery_name: log.beer?.brewery?.name ?? null,
            count: 1,
            friendIds: new Set([log.user_id]),
          });
        }
      }

      // Resolve friend IDs to names
      const allFriendIdsUsed = new Set<string>();
      for (const entry of beerMap.values()) {
        for (const fid of entry.friendIds) allFriendIdsUsed.add(fid);
      }

      const friendNameMap = new Map<string, string>();
      if (allFriendIdsUsed.size > 0) {
        const { data: profilesRaw } = await (supabase
          .from("profiles")
          .select("id, display_name, username")
          .in("id", [...allFriendIdsUsed]) as any);
        for (const p of ((profilesRaw ?? []) as any[])) {
          const name = p.display_name?.split(" ")[0] || p.username || "Friend";
          friendNameMap.set(p.id, name);
        }
      }

      friendCheckins = [...beerMap.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((entry) => ({
          beer_id: entry.beer_id,
          name: entry.name,
          style: entry.style,
          brewery_id: entry.brewery_id,
          brewery_name: entry.brewery_name,
          count: entry.count,
          friendNames: [...entry.friendIds].map((fid) => friendNameMap.get(fid) ?? "Friend"),
        }));
    }

    // 4. New beers at followed breweries (last 7d)
    let newAtFollowed: Array<{
      beer_id: string;
      name: string;
      style: string | null;
      abv: number | null;
      brewery_id: string;
      brewery_name: string | null;
      created_at: string;
    }> = [];

    if (followedBreweryIds.length > 0) {
      const { data: newBeersRaw } = await (supabase
        .from("beers")
        .select("id, name, style, abv, brewery_id, created_at, brewery:breweries(name)")
        .in("brewery_id", followedBreweryIds)
        .gte("created_at", sevenDaysAgo)
        .lt("created_at", upperBound)
        .order("created_at", { ascending: false })
        .limit(20) as any);

      newAtFollowed = ((newBeersRaw ?? []) as any[]).map((b: any) => ({
        beer_id: b.id,
        name: b.name,
        style: b.style,
        abv: b.abv,
        brewery_id: b.brewery_id,
        brewery_name: b.brewery?.name ?? null,
        created_at: b.created_at,
      }));
    }

    return apiSuccess(
      { friendCheckins, newAtFollowed },
      200,
      { friendCount: friendIds.length, followedCount: followedBreweryIds.length },
      { "Cache-Control": "private, max-age=60, stale-while-revalidate=300" }
    );
  } catch (err) {
    console.error("Explore following API error:", err);
    return apiError("Failed to fetch following data", "FOLLOWING_FETCH_ERROR", 500);
  }
}
