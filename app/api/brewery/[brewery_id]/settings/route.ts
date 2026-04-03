import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiUnauthorized, apiForbidden, apiBadRequest, apiServerError } from "@/lib/api-response";
import { normalizePhone, normalizeWebsiteUrl, isValidSocialUrl } from "@/lib/brewery-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const rl = rateLimitResponse(request, "brewery-settings", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return apiUnauthorized();
  }

  // Verify the user belongs to this brewery (owner or manager only)
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single();

  if (!account) {
    return apiForbidden();
  }

  const body = await request.json();
  const {
    name, street, city, state, website_url, phone, description,
    cover_image_url, menu_image_url,
    instagram_url, facebook_url, twitter_url, untappd_url,
  } = body;

  if (!name?.trim() || !city?.trim()) {
    return apiBadRequest("Name and city are required");
  }

  // Validate social URLs if provided
  const socialFields = [
    { value: instagram_url, platform: "instagram" as const, label: "Instagram" },
    { value: facebook_url, platform: "facebook" as const, label: "Facebook" },
    { value: twitter_url, platform: "twitter" as const, label: "X / Twitter" },
    { value: untappd_url, platform: "untappd" as const, label: "Untappd" },
  ];
  for (const { value, platform, label } of socialFields) {
    if (value?.trim() && !isValidSocialUrl(value.trim(), platform)) {
      return apiBadRequest(`Invalid ${label} URL`);
    }
  }

  const { error } = await supabase
    .from("breweries")
    .update({
      name: name.trim(),
      street: street?.trim() || null,
      city: city.trim(),
      state: state?.trim() || null,
      website_url: normalizeWebsiteUrl(website_url),
      phone: normalizePhone(phone),
      description: description?.trim() || null,
      ...(cover_image_url !== undefined && { cover_image_url: cover_image_url?.trim() || null }),
      ...(menu_image_url !== undefined && { menu_image_url: menu_image_url?.trim() || null }),
      instagram_url: instagram_url?.trim() || null,
      facebook_url: facebook_url?.trim() || null,
      twitter_url: twitter_url?.trim() || null,
      untappd_url: untappd_url?.trim() || null,
    })
    .eq("id", brewery_id);

  if (error) {
    return apiServerError("brewery settings PATCH");
  }

  return NextResponse.json({ success: true });
}
