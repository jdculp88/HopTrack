// POS Manual Sync — Trigger immediate sync from POS
// Sprint 86 — The Connector | Sprint 87 — The Sync Engine
// POST /api/pos/sync/[provider] { brewery_id }
// Debounced: max once per 5 minutes

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptToken } from "@/lib/pos-crypto";
import { runSync, fetchPosMenuData } from "@/lib/pos-sync/engine";

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (provider !== "toast" && provider !== "square") {
    return Response.json({ data: null, meta: {}, error: { message: "Unsupported provider", code: "bad_request", status: 400 } }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ data: null, meta: {}, error: { message: "Unauthorized", code: "unauthorized", status: 401 } }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const breweryId = body.brewery_id;
  if (!breweryId) {
    return Response.json({ data: null, meta: {}, error: { message: "brewery_id is required", code: "bad_request", status: 400 } }, { status: 400 });
  }

  // Verify brewery ownership
  const { data: account } = await (supabase as any)
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", breweryId)
    .single();

  if (!account || !["owner", "manager"].includes(account.role)) {
    return Response.json({ data: null, meta: {}, error: { message: "Not authorized", code: "forbidden", status: 403 } }, { status: 403 });
  }

  // Get connection (including encrypted token for API calls)
  const { data: connection } = await (supabase as any)
    .from("pos_connections")
    .select("id, status, last_sync_at, access_token_encrypted, provider_location_id, provider_merchant_id")
    .eq("brewery_id", breweryId)
    .eq("provider", provider)
    .maybeSingle();

  if (!connection || connection.status !== "active") {
    return Response.json({ data: null, meta: {}, error: { message: `No active ${provider} connection`, code: "not_found", status: 404 } }, { status: 404 });
  }

  // Debounce: check last sync time
  if (connection.last_sync_at) {
    const lastSync = new Date(connection.last_sync_at).getTime();
    const now = Date.now();
    if (now - lastSync < SYNC_COOLDOWN_MS) {
      const waitSec = Math.ceil((SYNC_COOLDOWN_MS - (now - lastSync)) / 1000);
      return Response.json({
        data: null, meta: {},
        error: { message: `Sync cooldown active. Try again in ${waitSec} seconds.`, code: "rate_limited", status: 429 },
      }, { status: 429 });
    }
  }

  // Fetch menu data from POS provider (or mock in POS_MOCK_MODE)
  const accessToken = connection.access_token_encrypted
    ? decryptToken(connection.access_token_encrypted)
    : "";
  const locationId = connection.provider_location_id || connection.provider_merchant_id;

  const menuData = await fetchPosMenuData(provider, accessToken, locationId);
  if (!menuData) {
    return Response.json({
      data: null, meta: {},
      error: { message: `Failed to fetch menu from ${provider}. Check connection status.`, code: "sync_failed", status: 502 },
    }, { status: 502 });
  }

  // Run the sync engine
  const syncResult = await runSync(
    {
      brewery_id: breweryId,
      pos_connection_id: connection.id,
      provider: provider as "toast" | "square",
      sync_type: "manual",
    },
    menuData
  );

  // Update connection
  await (supabase as any)
    .from("pos_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: syncResult.status,
      last_sync_item_count: syncResult.items_added + syncResult.items_updated,
      status: syncResult.status === "failed" ? "error" : "active",
    })
    .eq("id", connection.id);

  // Update brewery summary
  await (supabase as any)
    .from("breweries")
    .update({ pos_last_sync_at: new Date().toISOString() })
    .eq("id", breweryId);

  // Log sync
  await (supabase as any)
    .from("pos_sync_logs")
    .insert({
      pos_connection_id: connection.id,
      brewery_id: breweryId,
      sync_type: "manual",
      provider,
      items_added: syncResult.items_added,
      items_updated: syncResult.items_updated,
      items_removed: syncResult.items_removed,
      items_unmapped: syncResult.items_unmapped,
      status: syncResult.status,
      error: syncResult.error || null,
      duration_ms: syncResult.duration_ms,
    });

  return Response.json({
    data: {
      synced: true,
      provider,
      items_added: syncResult.items_added,
      items_updated: syncResult.items_updated,
      items_removed: syncResult.items_removed,
      items_unmapped: syncResult.items_unmapped,
      status: syncResult.status,
      duration_ms: syncResult.duration_ms,
    },
    meta: {},
    error: syncResult.status === "failed" ? { message: syncResult.error || "Sync failed", code: "sync_failed", status: 500 } : null,
  }, { status: syncResult.status === "failed" ? 500 : 200 });
}
