import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { fetchWrappedStats } from "@/lib/wrapped";

export async function GET(request: NextRequest) {
  const limited = rateLimitResponse(request, "wrapped", { limit: 10, windowMs: 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const yearParam = request.nextUrl.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : null;

  try {
    const wrapped = await fetchWrappedStats(supabase, user.id, year);
    return NextResponse.json(wrapped);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to fetch wrapped stats" }, { status: 500 });
  }
}
