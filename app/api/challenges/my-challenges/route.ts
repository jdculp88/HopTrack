import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/challenges/my-challenges — user's active + completed challenges
// Optional ?brewery_id=xxx to filter by brewery
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const brewery_id = url.searchParams.get("brewery_id");

  let query = supabase
    .from("challenge_participants")
    .select(`
      id,
      current_progress,
      completed_at,
      joined_at,
      challenge:challenges(
        id,
        name,
        description,
        icon,
        challenge_type,
        target_value,
        target_beer_ids,
        reward_description,
        reward_xp,
        reward_loyalty_stamps,
        ends_at,
        brewery_id,
        brewery:breweries(id, name, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false }) as any;

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });

  let result = data ?? [];

  // Filter by brewery if requested
  if (brewery_id) {
    result = result.filter((p: any) => p.challenge?.brewery_id === brewery_id);
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
