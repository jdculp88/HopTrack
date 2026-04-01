import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// POST /api/ads/impression — track ad impression
export async function POST(req: NextRequest) {
  const rl = rateLimitResponse(req, "ads-impression", { limit: 60, windowMs: 60_000 });
  if (rl) return rl;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ad_id } = await req.json();
  if (!ad_id) return NextResponse.json({ error: "ad_id required" }, { status: 400 });

  await (supabase as any).rpc("increment_ad_impressions", { ad_id_param: ad_id });

  return NextResponse.json({ ok: true });
}
