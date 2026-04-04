/**
 * Brewery presence API — Sprint 156 (The Triple Shot)
 *
 * Returns friends currently checked in at a brewery.
 * Falls back when Supabase Realtime Presence isn't available.
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-helpers";
import { apiSuccess, apiUnauthorized, apiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  try {
    // Get current user's friends
    const { data: friendshipsRaw } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    const friendIds = (friendshipsRaw ?? []).map(
      (f: { requester_id: string; addressee_id: string }) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
    );

    if (friendIds.length === 0) {
      return apiSuccess({ users: [], count: 0 });
    }

    // Find active sessions at this brewery from friends
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    const { data: activeSessions } = await supabase // supabase join shape
      .from("sessions")
      .select(
        `id, user_id,
        profile:profiles!user_id(id, username, display_name, avatar_url, notification_preferences)`
      )
      .in("user_id", friendIds)
      .eq("brewery_id", brewery_id)
      .eq("is_active", true)
      .gte("started_at", sixHoursAgo)
      .lt("started_at", now)
      .limit(20);

    // Filter to users who share live presence and dedupe
    const seen = new Set<string>();
    const users = ((activeSessions ?? []) as any[])
      .filter((s) => {
        const prefs = s.profile?.notification_preferences ?? {};
        if (prefs.share_live === false) return false;
        if (seen.has(s.user_id)) return false;
        seen.add(s.user_id);
        return true;
      })
      .map((s) => ({
        id: s.profile?.id ?? s.user_id,
        display_name: s.profile?.display_name ?? null,
        avatar_url: s.profile?.avatar_url ?? null,
        username: s.profile?.username ?? "user",
      }));

    // Also get total active session count (not just friends)
    const { count: totalCount } = await supabase
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("brewery_id", brewery_id)
      .eq("is_active", true)
      .gte("started_at", sixHoursAgo)
      .lt("started_at", now) as any;

    return apiSuccess({ users, count: totalCount ?? users.length });
  } catch (err) {
    console.error("Presence API error:", err);
    return apiError("Failed to fetch presence data", "PRESENCE_ERROR", 500);
  }
}
