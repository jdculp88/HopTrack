import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

const SESSION_SELECT = `
  *,
  profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url, current_streak),
  brewery:breweries!brewery_id(id, name, city, state),
  beer_logs(id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at, quantity, beer:beers(id, name, style, glass_type))
`;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const tab = searchParams.get("tab") ?? "friends";

  if (tab !== "friends" && tab !== "you") {
    return NextResponse.json(
      { error: 'tab must be "friends" or "you"' },
      { status: 400 }
    );
  }

  const offset = (page - 1) * PAGE_SIZE;

  let userIds: string[];

  if (tab === "friends") {
    // Get accepted friend IDs
    const { data: friendships } = await (supabase as any)
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    const friendIds = ((friendships ?? []) as any[]).map((f: any) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    );
    userIds = [user.id, ...friendIds];
  } else {
    userIds = [user.id];
  }

  // Fetch one extra to determine hasMore
  const { data: sessions, error } = await (supabase as any)
    .from("sessions")
    .select(SESSION_SELECT)
    .in("user_id", userIds)
    .eq("share_to_feed", true)
    .eq("is_active", false)
    .order("started_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allSessions = (sessions ?? []) as any[];
  const hasMore = allSessions.length > PAGE_SIZE;
  const pageSessions = hasMore ? allSessions.slice(0, PAGE_SIZE) : allSessions;

  // Batch-fetch reaction counts, user reactions, and comment counts
  const sessionIds = pageSessions.map((s: any) => s.id).filter(Boolean);

  let reactionCounts: Record<string, Record<string, number>> = {};
  let userReactions: Record<string, string[]> = {};
  let commentCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const [countsRes, userReactionsRes, commentsRes] = await Promise.all([
      (supabase as any)
        .from("reactions")
        .select("session_id, type")
        .in("session_id", sessionIds),
      (supabase as any)
        .from("reactions")
        .select("session_id, type")
        .eq("user_id", user.id)
        .in("session_id", sessionIds),
      (supabase as any)
        .from("session_comments")
        .select("session_id")
        .in("session_id", sessionIds),
    ]);

    for (const r of (countsRes.data ?? []) as any[]) {
      if (!reactionCounts[r.session_id]) reactionCounts[r.session_id] = {};
      reactionCounts[r.session_id][r.type] =
        (reactionCounts[r.session_id][r.type] ?? 0) + 1;
    }

    for (const r of (userReactionsRes.data ?? []) as any[]) {
      if (!userReactions[r.session_id]) userReactions[r.session_id] = [];
      userReactions[r.session_id].push(r.type);
    }

    for (const c of (commentsRes.data ?? []) as any[]) {
      commentCounts[c.session_id] = (commentCounts[c.session_id] ?? 0) + 1;
    }
  }

  return NextResponse.json({
    sessions: pageSessions,
    reactionCounts,
    userReactions,
    commentCounts,
    hasMore,
  });
}
