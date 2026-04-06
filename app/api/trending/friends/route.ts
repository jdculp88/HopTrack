/**
 * Friends trending API — Sprint 157
 *
 * Returns beers that the current user's friends have checked in this week,
 * ranked by check-in count. Auth required.
 *
 * Response shape:
 *   { data: Array<{ beer_id, name, style, brewery_name, count, friends: string[] }> }
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api-response";

// Rate limit: 30 req/min (simple in-memory, per-user)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Auth
    const user = await requireAuth(supabase);
    if (!user) return apiUnauthorized();

    // Rate limit check
    const now = Date.now();
    const bucket = rateLimitMap.get(user.id);
    if (bucket && bucket.resetAt > now) {
      if (bucket.count >= 30) {
        return apiError("Rate limit exceeded", "RATE_LIMITED", 429);
      }
      bucket.count++;
    } else {
      rateLimitMap.set(user.id, { count: 1, resetAt: now + 60_000 });
    }

    // 2. Get current user's friend list (status = 'accepted')
    const { data: friendshipsRaw } = await (supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted") as any);

    const friendIds = ((friendshipsRaw ?? []) as any[]).map(
      (f: { requester_id: string; addressee_id: string }) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
    );

    if (friendIds.length === 0) {
      return apiSuccess(
        [],
        200,
        {},
        { "Cache-Control": "public, max-age=300" }
      );
    }

    // 3. Query beer_logs from friends in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const upperBound = new Date().toISOString();

    const { data: logsRaw } = await (supabase
      .from("beer_logs")
      .select("beer_id, user_id, beer:beers(id, name, style, brewery:breweries(name))")
      .in("user_id", friendIds)
      .gte("created_at", sevenDaysAgo)
      .lt("created_at", upperBound)
      .not("beer_id", "is", null)
      .limit(5000) as any);

    const logs = (logsRaw ?? []) as any[];

    // 4. Group by beer_id, count check-ins, collect friend names
    const beerMap = new Map<string, {
      beer_id: string;
      name: string;
      style: string | null;
      brewery_name: string | null;
      count: number;
      friendIds: Set<string>;
    }>();

    for (const log of logs) {
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
          brewery_name: log.beer?.brewery?.name ?? null,
          count: 1,
          friendIds: new Set([log.user_id]),
        });
      }
    }

    // 5. Resolve friend user_ids to display names
    const allFriendIdsUsed = new Set<string>();
    for (const entry of beerMap.values()) {
      for (const fid of entry.friendIds) {
        allFriendIdsUsed.add(fid);
      }
    }

    const friendNameMap = new Map<string, string>();
    if (allFriendIdsUsed.size > 0) {
      const { data: profilesRaw } = await (supabase
        .from("profiles")
        .select("id, display_name, username")
        .in("id", [...allFriendIdsUsed]) as any);

      for (const p of (profilesRaw ?? []) as any[]) {
        const name = p.display_name?.split(" ")[0] || p.username || "Friend";
        friendNameMap.set(p.id, name);
      }
    }

    // 6. Sort by count DESC, limit 10
    const sorted = [...beerMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((entry) => ({
        beer_id: entry.beer_id,
        name: entry.name,
        style: entry.style,
        brewery_name: entry.brewery_name,
        count: entry.count,
        friends: [...entry.friendIds].map((fid) => friendNameMap.get(fid) ?? "Friend"),
      }));

    return apiSuccess(
      sorted,
      200,
      {},
      { "Cache-Control": "public, max-age=300" }
    );
  } catch (err) {
    console.error("Friends trending API error:", err);
    return apiError("Failed to fetch friends trending data", "FRIENDS_TRENDING_ERROR", 500);
  }
}
