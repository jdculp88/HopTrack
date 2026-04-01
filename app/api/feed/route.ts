import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

const PAGE_SIZE = 20;

const SESSION_SELECT = `
  *,
  profile:profiles!sessions_user_id_fkey(id, username, display_name, avatar_url, current_streak),
  brewery:breweries!brewery_id(id, name, city, state),
  beer_logs(id, beer_id, rating, flavor_tags, serving_style, comment, photo_url, logged_at, quantity, beer:beers(id, name, style, glass_type))
`;

export async function GET(request: NextRequest) {
  const limited = rateLimitResponse(request, "feed", { limit: 30, windowMs: 60 * 1000 });
  if (limited) return limited;

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

  type FriendshipRow = { requester_id: string; addressee_id: string };
  type ReactionRow = { session_id: string; type: string };
  type CommentRow = { session_id: string };

  if (tab === "friends") {
    // Get accepted friend IDs
    const { data: friendships } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted");

    const friendIds = ((friendships ?? []) as unknown as FriendshipRow[]).map((f) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    );
    userIds = [user.id, ...friendIds];
  } else {
    userIds = [user.id];
  }

  // Fetch one extra to determine hasMore
  const { data: sessions, error } = await supabase
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

  const allSessions = (sessions ?? []) as unknown[];
  const hasMore = allSessions.length > PAGE_SIZE;
  const pageSessions = hasMore ? allSessions.slice(0, PAGE_SIZE) : allSessions;

  // Batch-fetch reaction counts, user reactions, and comment counts
  const sessionIds = (pageSessions as Array<{ id: string }>).map((s) => s.id).filter(Boolean);

  const reactionCounts: Record<string, Record<string, number>> = {};
  const userReactions: Record<string, string[]> = {};
  const commentCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const [countsRes, userReactionsRes, commentsRes] = await Promise.all([
      supabase
        .from("reactions")
        .select("session_id, type")
        .in("session_id", sessionIds),
      supabase
        .from("reactions")
        .select("session_id, type")
        .eq("user_id", user.id)
        .in("session_id", sessionIds),
      supabase
        .from("session_comments")
        .select("session_id")
        .in("session_id", sessionIds),
    ]);

    for (const r of (countsRes.data ?? []) as unknown as ReactionRow[]) {
      if (!reactionCounts[r.session_id]) reactionCounts[r.session_id] = {};
      reactionCounts[r.session_id][r.type] =
        (reactionCounts[r.session_id][r.type] ?? 0) + 1;
    }

    for (const r of (userReactionsRes.data ?? []) as unknown as ReactionRow[]) {
      if (!userReactions[r.session_id]) userReactions[r.session_id] = [];
      userReactions[r.session_id].push(r.type);
    }

    for (const c of (commentsRes.data ?? []) as unknown as CommentRow[]) {
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
