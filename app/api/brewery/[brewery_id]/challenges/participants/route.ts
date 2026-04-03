import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError } from "@/lib/api-response";

// GET /api/brewery/[brewery_id]/challenges/participants — participant stats for all challenges
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

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
    if (ids.length === 0) return apiSuccess([]);
    query = query.in("challenge_id", ids);
  }

  const { data, error } = await query;
  if (error) return apiServerError("Failed to fetch participants");

  return apiSuccess(data ?? []);
}
