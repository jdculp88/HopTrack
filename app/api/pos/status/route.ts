// POS Connection Status — Current brewery's POS connection health
// Sprint 86 — The Connector
// GET /api/pos/status?brewery_id=xxx

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ data: null, meta: {}, error: { message: "Unauthorized", code: "unauthorized", status: 401 } }, { status: 401 });
  }

  const breweryId = req.nextUrl.searchParams.get("brewery_id");
  if (!breweryId) {
    return Response.json({ data: null, meta: {}, error: { message: "brewery_id is required", code: "bad_request", status: 400 } }, { status: 400 });
  }

  // Verify brewery access
  const { data: account } = await (supabase as any)
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", breweryId)
    .single();

  if (!account) {
    return Response.json({ data: null, meta: {}, error: { message: "Not authorized", code: "forbidden", status: 403 } }, { status: 403 });
  }

  // Get all POS connections for this brewery (excluding encrypted tokens)
  const { data: connections } = await (supabase as any)
    .from("pos_connections")
    .select("id, brewery_id, provider, status, last_sync_at, last_sync_status, last_sync_item_count, provider_location_id, connected_at, created_at")
    .eq("brewery_id", breweryId);

  // Get recent sync logs (last 10)
  const { data: recentSyncs } = await (supabase as any)
    .from("pos_sync_logs")
    .select("id, sync_type, provider, items_added, items_updated, items_removed, items_unmapped, status, error, duration_ms, created_at")
    .eq("brewery_id", breweryId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Compute health indicator for each connection
  const connectionsWithHealth = (connections || []).map((conn: any) => {
    let health: "green" | "yellow" | "red" = "red";
    if (conn.status === "active" && conn.last_sync_at) {
      const age = Date.now() - new Date(conn.last_sync_at).getTime();
      if (age < 5 * 60 * 1000) health = "green";       // < 5 min
      else if (age < 60 * 60 * 1000) health = "yellow"; // < 1 hour
      // else red (> 1 hour or failed)
    }
    if (conn.last_sync_status === "failed") health = "red";
    return { ...conn, health };
  });

  return Response.json({
    data: {
      connections: connectionsWithHealth,
      recent_syncs: recentSyncs || [],
      tier: account.subscription_tier,
      tier_eligible: ["cask", "barrel"].includes(account.subscription_tier),
    },
    meta: {},
    error: null,
  });
}
