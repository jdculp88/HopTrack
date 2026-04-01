// Square Webhook Receiver — catalog.version.updated events
// Sprint 86 — The Connector | Sprint 87 — The Sync Engine
// POST /api/pos/webhook/square

import { NextRequest } from "next/server";
import crypto from "crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { decryptToken } from "@/lib/pos-crypto";
import { runSync, fetchPosMenuData } from "@/lib/pos-sync/engine";

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000; // 5 minutes — replay protection

export async function POST(req: NextRequest) {
  // Verify Square signature
  const signature = req.headers.get("x-square-hmacsha256-signature");
  const webhookSecret = process.env.SQUARE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[POS Webhook] SQUARE_WEBHOOK_SECRET not configured");
    return Response.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();

  if (!signature) {
    console.warn("[POS Webhook] Missing signature header from Square");
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  // Square uses the notification URL + body for HMAC
  const notificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://app.hoptrack.beer"}/api/pos/webhook/square`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(notificationUrl + rawBody)
    .digest("base64");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.warn("[POS Webhook] Invalid Square signature");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Replay protection
  const webhookTimestamp = payload.created_at;
  if (webhookTimestamp) {
    const age = Date.now() - new Date(webhookTimestamp).getTime();
    if (age > MAX_WEBHOOK_AGE_MS) {
      console.warn("[POS Webhook] Stale Square webhook rejected:", age, "ms old");
      return Response.json({ error: "Webhook too old" }, { status: 400 });
    }
  }

  console.log("[POS Webhook] Square event received:", payload.type || "unknown");

  // ACK immediately — process async
  // Square webhooks are notifications only — we need to fetch the full catalog
  if (payload.type === "catalog.version.updated") {
    processSquareWebhook(payload).catch(err => {
      console.error("[POS Webhook] Square async processing error:", err);
    });
  }

  return Response.json({ received: true });
}

async function processSquareWebhook(payload: any) {
  const merchantId = payload.merchant_id;
  if (!merchantId) {
    console.warn("[POS Webhook] Square payload missing merchant_id");
    return;
  }

  // Look up connection by provider_merchant_id
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: connection } = await supabase
    .from("pos_connections")
    .select("id, brewery_id, access_token_encrypted, provider_location_id, status")
    .eq("provider", "square")
    .eq("provider_merchant_id", merchantId)
    .eq("status", "active")
    .single();

  if (!connection) {
    console.warn(`[POS Webhook] No active Square connection for merchant ${merchantId}`);
    return;
  }

  // Square webhooks don't include catalog data — fetch it
  const accessToken = decryptToken(connection.access_token_encrypted);
  const menuData = await fetchPosMenuData("square", accessToken, connection.provider_location_id);

  if (!menuData) {
    console.warn(`[POS Webhook] Failed to fetch Square catalog for merchant ${merchantId}`);
    // Log failure
    await supabase.from("pos_sync_logs").insert({
      pos_connection_id: connection.id,
      brewery_id: connection.brewery_id,
      sync_type: "webhook",
      provider: "square",
      items_added: 0, items_updated: 0, items_removed: 0, items_unmapped: 0,
      status: "failed",
      error: "Failed to fetch catalog from Square API",
      duration_ms: 0,
    });
    return;
  }

  // Run sync engine with fetched catalog data (not webhook payload)
  const result = await runSync(
    {
      brewery_id: connection.brewery_id,
      pos_connection_id: connection.id,
      provider: "square",
      sync_type: "webhook",
    },
    menuData
  );

  // Update connection status
  await supabase
    .from("pos_connections")
    .update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: result.status,
      last_sync_item_count: result.items_added + result.items_updated,
    })
    .eq("id", connection.id);

  // Update brewery summary
  await supabase
    .from("breweries")
    .update({ pos_last_sync_at: new Date().toISOString() })
    .eq("id", connection.brewery_id);

  // Log sync
  await supabase
    .from("pos_sync_logs")
    .insert({
      pos_connection_id: connection.id,
      brewery_id: connection.brewery_id,
      sync_type: "webhook",
      provider: "square",
      items_added: result.items_added,
      items_updated: result.items_updated,
      items_removed: result.items_removed,
      items_unmapped: result.items_unmapped,
      status: result.status,
      error: result.error || null,
      duration_ms: result.duration_ms,
    });

  console.log(`[POS Webhook] Square sync complete for brewery ${connection.brewery_id}: +${result.items_added} ~${result.items_updated} -${result.items_removed}`);
}
