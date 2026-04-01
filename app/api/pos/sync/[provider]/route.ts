// POS Manual Sync — Trigger immediate sync from POS
// Sprint 86 — The Connector
// POST /api/pos/sync/[provider] { brewery_id }
// Debounced: max once per 5 minutes

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Get connection
  const { data: connection } = await (supabase as any)
    .from("pos_connections")
    .select("id, status, last_sync_at")
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

  // TODO (Sprint 87): Pull current menu from POS API
  // Toast: GET /menus for restaurant
  // Square: GET /v2/catalog/list?types=ITEM
  // Then diff against current tap list and apply changes

  const startTime = Date.now();

  // STUB: Simulate sync result
  const syncResult = {
    items_added: 0,
    items_updated: 0,
    items_removed: 0,
    items_unmapped: 0,
    status: "success" as const,
  };

  const durationMs = Date.now() - startTime;

  // Update connection
  await (supabase as any)
    .from("pos_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: syncResult.status,
      last_sync_item_count: syncResult.items_added + syncResult.items_updated,
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
      ...syncResult,
      duration_ms: durationMs,
    });

  return Response.json({
    data: {
      synced: true,
      provider,
      ...syncResult,
      duration_ms: durationMs,
    },
    meta: {},
    error: null,
  });
}
