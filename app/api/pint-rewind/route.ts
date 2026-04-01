import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { fetchPintRewindData } from "@/lib/pint-rewind";

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "pint-rewind", { limit: 10, windowMs: 60 * 1000 });
  if (limited) return limited;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await fetchPintRewindData(supabase, user.id);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to fetch pint rewind data" }, { status: 500 });
  }
}
