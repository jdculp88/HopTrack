// POS Disconnect — Revoke tokens and remove connection
// Sprint 86 — The Connector
// POST /api/pos/disconnect/[provider] { brewery_id }

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Get existing connection
  const { data: connection } = await (supabase as any)
    .from("pos_connections")
    .select("id, provider, webhook_subscription_id")
    .eq("brewery_id", breweryId)
    .eq("provider", provider)
    .maybeSingle();

  if (!connection) {
    return Response.json({ data: null, meta: {}, error: { message: "No active connection found", code: "not_found", status: 404 } }, { status: 404 });
  }

  // TODO (Sprint 87): Revoke token with provider API
  // Toast: POST revoke endpoint
  // Square: POST /oauth2/revoke { client_id, access_token }

  // TODO (Sprint 87): Remove webhook subscription with provider
  // if (connection.webhook_subscription_id) { ... }

  // Delete the connection row (cascade deletes pos_item_mappings)
  const { error: deleteError } = await (supabase as any)
    .from("pos_connections")
    .delete()
    .eq("id", connection.id);

  if (deleteError) {
    console.error("[POS] Failed to delete connection:", deleteError);
    return Response.json({ data: null, meta: {}, error: { message: "Failed to disconnect", code: "internal", status: 500 } }, { status: 500 });
  }

  // Update brewery summary columns
  await (supabase as any)
    .from("breweries")
    .update({ pos_provider: null, pos_connected: false, pos_last_sync_at: null })
    .eq("id", breweryId);

  // Log the disconnection
  await (supabase as any)
    .from("pos_sync_logs")
    .insert({
      pos_connection_id: connection.id,
      brewery_id: breweryId,
      sync_type: "manual",
      provider,
      items_added: 0,
      items_updated: 0,
      items_removed: 0,
      items_unmapped: 0,
      status: "success",
      duration_ms: 0,
    });

  return Response.json({
    data: { disconnected: true, provider },
    meta: {},
    error: null,
  });
}
