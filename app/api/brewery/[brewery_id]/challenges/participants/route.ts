import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/brewery/[brewery_id]/challenges/participants — participant stats for all challenges
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: account } = await (supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single() as any);
  if (!account) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const challenge_id = url.searchParams.get("challenge_id");

  let query = supabase
    .from("challenge_participants")
    .select(`
      *,
      profile:profiles(id, display_name, username, avatar_url),
      challenge:challenges(id, name, target_value, challenge_type)
    `)
    .order("joined_at", { ascending: false }) as any;

  if (challenge_id) {
    query = query.eq("challenge_id", challenge_id);
  } else {
    // All participants for this brewery's challenges
    const { data: challengeIds } = await (supabase
      .from("challenges")
      .select("id")
      .eq("brewery_id", brewery_id) as any);
    const ids = (challengeIds ?? []).map((c: any) => c.id);
    if (ids.length === 0) return NextResponse.json([]);
    query = query.in("challenge_id", ids);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });

  return NextResponse.json(data ?? []);
}
