// Toast Webhook Receiver — menus.updated events
// Sprint 86 — The Connector
// POST /api/pos/webhook/toast

import { NextRequest } from "next/server";
import crypto from "crypto";

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000; // 5 minutes — replay protection

export async function POST(req: NextRequest) {
  // Verify HMAC-SHA256 signature
  const signature = req.headers.get("toast-signature") || req.headers.get("x-toast-signature");
  const webhookSecret = process.env.TOAST_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[POS Webhook] TOAST_WEBHOOK_SECRET not configured");
    return Response.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();

  if (!signature) {
    console.warn("[POS Webhook] Missing signature header from Toast");
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  // Verify HMAC
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.warn("[POS Webhook] Invalid Toast signature");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Replay protection — check timestamp
  const webhookTimestamp = payload.timestamp || payload.createdAt;
  if (webhookTimestamp) {
    const age = Date.now() - new Date(webhookTimestamp).getTime();
    if (age > MAX_WEBHOOK_AGE_MS) {
      console.warn("[POS Webhook] Stale Toast webhook rejected:", age, "ms old");
      return Response.json({ error: "Webhook too old" }, { status: 400 });
    }
  }

  // TODO (Sprint 87): Process menu changes
  // 1. Look up pos_connections by provider_location_id (Toast restaurant GUID)
  // 2. Decrypt access token
  // 3. Fetch updated menu from Toast API
  // 4. Diff against current HopTrack tap list
  // 5. Apply changes (add new, update existing, deactivate removed)
  // 6. Log to pos_sync_logs
  // 7. Notify brewery owner of unmapped items

  console.log("[POS Webhook] Toast event received:", payload.eventType || "unknown");

  // ACK the webhook immediately
  return Response.json({ received: true });
}
