import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiNotFound, apiConflict, apiServerError } from "@/lib/api-response";
import { propagateBrandAccess, removePropagatedAccess } from "@/lib/brand-propagation";

const VALID_BRAND_ROLES = ["owner", "regional_manager"] as const;

async function verifyBrandOwner(supabase: any, userId: string, brandId: string): Promise<boolean> {
  const { data } = await (supabase
    .from("brewery_brands")
    .select("owner_id")
    .eq("id", brandId)
    .single() as any);
  return data?.owner_id === userId;
}

// ─── GET /api/brand/[brand_id]/members ──────────────────────────────────────
// List all brand members with profile info.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Must be a brand member to see members
  const { data: membership } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", user.id)
    .maybeSingle() as any);

  if (!membership) return apiForbidden();

  const { data: members, error } = await (supabase
    .from("brand_accounts")
    .select(`
      id,
      user_id,
      role,
      created_at,
      profile:profiles!brand_accounts_user_id_fkey(
        display_name,
        username,
        avatar_url
      )
    `)
    .eq("brand_id", brand_id)
    .order("created_at", { ascending: true }) as any);

  if (error) return apiServerError("brand members GET");

  return apiSuccess(members ?? []);
}

// ─── POST /api/brand/[brand_id]/members ─────────────────────────────────────
// Add a member to the brand. Brand owner only.
// Body: { email_or_username, role }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-add-member", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const isOwner = await verifyBrandOwner(supabase, user.id, brand_id);
  if (!isOwner) return apiForbidden();

  const body = await request.json();
  const { email_or_username, role } = body;

  if (!email_or_username || !role) {
    return apiBadRequest("email_or_username and role are required");
  }

  if (!VALID_BRAND_ROLES.includes(role)) {
    return apiBadRequest(`Role must be one of: ${VALID_BRAND_ROLES.join(", ")}`, "role");
  }

  // Find user by email or username
  const isEmail = email_or_username.includes("@");
  let targetUserId: string | null = null;

  if (isEmail) {
    const { data: profile } = await (supabase
      .from("profiles")
      .select("id")
      .ilike("email", email_or_username)
      .maybeSingle() as any);
    targetUserId = profile?.id ?? null;
  } else {
    const { data: profile } = await (supabase
      .from("profiles")
      .select("id")
      .ilike("username", email_or_username)
      .maybeSingle() as any);
    targetUserId = profile?.id ?? null;
  }

  if (!targetUserId) return apiNotFound("User");

  // Check if already a member
  const { data: existing } = await (supabase
    .from("brand_accounts")
    .select("id")
    .eq("brand_id", brand_id)
    .eq("user_id", targetUserId)
    .maybeSingle() as any);

  if (existing) return apiConflict("User is already a brand member");

  // Create brand_account
  const { data: account, error } = await (supabase
    .from("brand_accounts")
    .insert({
      brand_id: brand_id,
      user_id: targetUserId,
      role,
    })
    .select(`
      id,
      user_id,
      role,
      created_at,
      profile:profiles!brand_accounts_user_id_fkey(
        display_name,
        username,
        avatar_url
      )
    `)
    .single() as any);

  if (error) return apiServerError("brand member add");

  // Propagate to all brand locations
  await propagateBrandAccess(supabase as any, brand_id, { userId: targetUserId });

  return apiSuccess(account, 201);
}

// ─── DELETE /api/brand/[brand_id]/members ───────────────────────────────────
// Remove a member from the brand. Brand owner only.
// Body: { user_id }
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-remove-member", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const isOwner = await verifyBrandOwner(supabase, user.id, brand_id);
  if (!isOwner) return apiForbidden();

  const body = await request.json();
  const { user_id: targetUserId } = body;

  if (!targetUserId) return apiBadRequest("user_id is required");

  // Can't remove yourself (the owner)
  if (targetUserId === user.id) {
    return apiBadRequest("Cannot remove yourself from the brand. Dissolve the brand instead.");
  }

  // Remove propagated brewery_accounts first
  await removePropagatedAccess(supabase as any, brand_id, { userId: targetUserId });

  // Remove brand_account
  const { error } = await (supabase
    .from("brand_accounts")
    .delete()
    .eq("brand_id", brand_id)
    .eq("user_id", targetUserId) as any);

  if (error) return apiServerError("brand member remove");

  return apiSuccess({ removed: true });
}
