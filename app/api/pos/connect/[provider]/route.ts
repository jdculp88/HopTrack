// POS OAuth Connect — Initiate OAuth flow with Toast or Square
// Sprint 86 — The Connector
// GET /api/pos/connect/[provider]?brewery_id=xxx

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

const TOAST_AUTH_URL = "https://ws-api.toasttab.com/usermgmt/v1/oauth/authorize";
const SQUARE_AUTH_URL = "https://connect.squareup.com/oauth2/authorize";

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (provider !== "toast" && provider !== "square") {
    return Response.json({ error: "Unsupported provider. Use 'toast' or 'square'." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const breweryId = req.nextUrl.searchParams.get("brewery_id");
  if (!breweryId) return Response.json({ error: "brewery_id is required" }, { status: 400 });

  // Verify brewery ownership (Cask or Barrel tier)
  const { data: account } = await (supabase as any)
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", breweryId)
    .single();

  if (!account || !["owner", "manager"].includes(account.role)) {
    return Response.json({ error: "Not authorized for this brewery" }, { status: 403 });
  }

  const { data: brewery } = await (supabase as any)
    .from("breweries").select("subscription_tier").eq("id", breweryId).single();
  if (!brewery || !["cask", "barrel"].includes(brewery.subscription_tier)) {
    return Response.json({ error: "POS integration requires Cask or Barrel tier" }, { status: 403 });
  }

  // Check for existing active connection
  const { data: existing } = await (supabase as any)
    .from("pos_connections")
    .select("id, status")
    .eq("brewery_id", breweryId)
    .eq("provider", provider)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return Response.json({ error: `Already connected to ${provider}` }, { status: 409 });
  }

  // Generate OAuth state param (CSRF protection)
  const state = crypto.randomBytes(32).toString("hex");

  // Store state in a short-lived way — we'll use a cookie
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const callbackUrl = `${siteUrl}/api/pos/callback/${provider}`;

  let authUrl: string;

  if (provider === "toast") {
    const clientId = process.env.TOAST_CLIENT_ID;
    if (!clientId) {
      return Response.json({ error: "Toast integration not configured. Partner approval pending." }, { status: 503 });
    }
    authUrl = `${TOAST_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}&scope=menus:read`;
  } else {
    const appId = process.env.SQUARE_APP_ID;
    if (!appId) {
      return Response.json({ error: "Square integration not configured. App review pending." }, { status: 503 });
    }
    authUrl = `${SQUARE_AUTH_URL}?client_id=${appId}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}&scope=ITEMS_READ+MERCHANT_PROFILE_READ&session=false`;
  }

  // Set state cookie for callback verification
  const response = Response.redirect(authUrl);
  response.headers.set(
    "Set-Cookie",
    `pos_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600; brewery_id=${breweryId}`
  );

  // Also store brewery_id in a separate cookie for the callback
  response.headers.append(
    "Set-Cookie",
    `pos_brewery_id=${breweryId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
  );

  return response;
}
