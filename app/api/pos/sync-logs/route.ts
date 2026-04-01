import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { message: "Unauthorized", status: 401 } }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const breweryId = searchParams.get("brewery_id");
  if (!breweryId) {
    return NextResponse.json({ error: { message: "brewery_id required", status: 400 } }, { status: 400 });
  }

  // Verify access
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", breweryId)
    .maybeSingle() as any;

  if (!account || !["owner", "manager"].includes(account.role)) {
    return NextResponse.json({ error: { message: "Forbidden", status: 403 } }, { status: 403 });
  }

  // Parse filters
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;
  const status = searchParams.get("status"); // success, partial, failed
  const provider = searchParams.get("provider"); // toast, square
  const syncType = searchParams.get("sync_type"); // webhook, manual, scheduled

  // Build query
  let query = supabase
    .from("pos_sync_logs")
    .select("*", { count: "exact" })
    .eq("brewery_id", breweryId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1) as any;

  if (status) query = query.eq("status", status);
  if (provider) query = query.eq("provider", provider);
  if (syncType) query = query.eq("sync_type", syncType);

  const { data: logs, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: { message: error.message, status: 500 } }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      logs: logs ?? [],
      total: count ?? 0,
      page,
      limit,
      total_pages: Math.ceil((count ?? 0) / limit),
    },
  });
}
