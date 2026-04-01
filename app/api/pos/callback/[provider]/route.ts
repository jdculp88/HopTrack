// POS OAuth Callback — Exchange auth code for tokens
// Sprint 86 — The Connector
// GET /api/pos/callback/[provider]?code=xxx&state=xxx

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptToken, isPosEncryptionConfigured } from "@/lib/pos-crypto";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (provider !== "toast" && provider !== "square") {
    return redirectWithError("Unsupported provider");
  }

  if (!isPosEncryptionConfigured()) {
    return redirectWithError("POS encryption not configured");
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return redirectWithError(`Authorization denied: ${error}`);
  }

  if (!code || !state) {
    return redirectWithError("Missing authorization code or state");
  }

  // Verify state (CSRF protection)
  const cookieStore = await cookies();
  const storedState = cookieStore.get("pos_oauth_state")?.value;
  const breweryId = cookieStore.get("pos_brewery_id")?.value;

  if (!storedState || storedState !== state) {
    return redirectWithError("Invalid OAuth state. Please try connecting again.");
  }

  if (!breweryId) {
    return redirectWithError("Missing brewery context. Please try connecting again.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirectWithError("Not authenticated");

  // Exchange code for tokens
  // NOTE: This is stubbed until partner API access is granted.
  // When real provider access arrives, replace with actual token exchange.
  let accessToken: string;
  let refreshToken: string;
  let expiresAt: string;
  let locationId: string | null = null;
  let merchantId: string | null = null;

  try {
    if (provider === "toast") {
      // STUB: Toast token exchange
      // Real implementation: POST to Toast token endpoint with code + client_secret
      const tokenResponse = await exchangeToastToken(code);
      accessToken = tokenResponse.accessToken;
      refreshToken = tokenResponse.refreshToken;
      expiresAt = tokenResponse.expiresAt;
      locationId = tokenResponse.restaurantGuid;
    } else {
      // STUB: Square token exchange
      // Real implementation: POST to Square token endpoint with code + client_secret
      const tokenResponse = await exchangeSquareToken(code);
      accessToken = tokenResponse.accessToken;
      refreshToken = tokenResponse.refreshToken;
      expiresAt = tokenResponse.expiresAt;
      merchantId = tokenResponse.merchantId;
      locationId = tokenResponse.locationId;
    }
  } catch (err) {
    console.error(`[POS] Token exchange failed for ${provider}:`, err);
    return redirectWithError("Failed to complete authorization. Please try again.");
  }

  // Encrypt tokens before storage
  const encryptedAccess = encryptToken(accessToken);
  const encryptedRefresh = encryptToken(refreshToken);

  // Upsert pos_connections (handles reconnection after disconnect)
  const { error: dbError } = await (supabase as any)
    .from("pos_connections")
    .upsert({
      brewery_id: breweryId,
      provider,
      access_token_encrypted: encryptedAccess,
      refresh_token_encrypted: encryptedRefresh,
      token_expires_at: expiresAt,
      provider_location_id: locationId,
      provider_merchant_id: merchantId,
      status: "active",
      connected_at: new Date().toISOString(),
    }, { onConflict: "brewery_id,provider" });

  if (dbError) {
    console.error("[POS] Failed to save connection:", dbError);
    return redirectWithError("Failed to save connection. Please try again.");
  }

  // Update brewery summary columns
  await (supabase as any)
    .from("breweries")
    .update({ pos_provider: provider, pos_connected: true })
    .eq("id", breweryId);

  // Clear OAuth cookies
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUrl = `${siteUrl}/brewery-admin/${breweryId}/settings?pos_connected=${provider}`;
  const response = Response.redirect(redirectUrl);
  response.headers.set("Set-Cookie", "pos_oauth_state=; Path=/; Max-Age=0");
  response.headers.append("Set-Cookie", "pos_brewery_id=; Path=/; Max-Age=0");
  return response;
}

function redirectWithError(message: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return Response.redirect(`${siteUrl}/brewery-admin?pos_error=${encodeURIComponent(message)}`);
}

// ─── Stub Token Exchanges ────────────────────────────────────────────────────
// Replace with real API calls when partner access is granted

async function exchangeToastToken(_code: string) {
  // TODO (Sprint 87): Replace with real Toast Partner API token exchange
  // POST https://ws-api.toasttab.com/usermgmt/v1/oauth/token
  // { grant_type: "authorization_code", code, client_id, client_secret, redirect_uri }
  return {
    accessToken: "toast_stub_access_token",
    refreshToken: "toast_stub_refresh_token",
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
    restaurantGuid: null as string | null,
  };
}

async function exchangeSquareToken(_code: string) {
  // TODO (Sprint 87): Replace with real Square API token exchange
  // POST https://connect.squareup.com/oauth2/token
  // { grant_type: "authorization_code", code, client_id, client_secret, redirect_uri }
  return {
    accessToken: "square_stub_access_token",
    refreshToken: "square_stub_refresh_token",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    merchantId: null as string | null,
    locationId: null as string | null,
  };
}
