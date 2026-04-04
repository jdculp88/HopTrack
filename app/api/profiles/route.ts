import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiUnauthorized, apiServerError } from "@/lib/api-response";
import { parseRequestBody } from "@/lib/schemas";
import { profileUpdateSchema } from "@/lib/schemas/profiles";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (q) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, level, xp, is_public")
      .ilike("username", `%${q}%`)
      .eq("is_public", true)
      .neq("id", user.id)
      .limit(20);
    return NextResponse.json({ profiles: data ?? [] });
  }

  // Return current user's profile
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ profile: data });
}

export async function PATCH(request: NextRequest) {
  const limited = rateLimitResponse(request, 'profiles-patch', { limit: 10, windowMs: 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const result = await parseRequestBody(request, profileUpdateSchema);
  if (result.error) return result.error;
  const updates = result.data;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return apiServerError("profiles PATCH");
  return NextResponse.json({ profile: data });
}
