import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimitResponse } from "@/lib/rate-limit";
import { apiSuccess, apiUnauthorized, apiForbidden, apiBadRequest, apiNotFound, apiConflict, apiServerError } from "@/lib/api-response";
import { propagateBrandAccess, removePropagatedAccess, recalculateScopedAccess } from "@/lib/brand-propagation";
import { logTeamActivity } from "@/lib/brand-team-activity";
import { verifyBrandAccess } from "@/lib/brand-auth";

const VALID_BRAND_ROLES = ["owner", "brand_manager", "regional_manager"] as const;

function canManageTeam(role: string | null): boolean {
  return role === "owner" || role === "brand_manager";
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
  const callerRole = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!callerRole) return apiForbidden();

  // Use service client to bypass RLS recursion on brand_accounts
  const serviceClient = createServiceClient();
  const { data: rawMembers, error } = await (serviceClient
    .from("brand_accounts")
    .select("id, user_id, role, created_at, invited_at, invited_by, location_scope")
    .eq("brand_id", brand_id)
    .order("created_at", { ascending: true }) as any);

  if (error) return apiServerError("brand members GET");

  // Hydrate profiles separately (brand_accounts FK points to auth.users, not profiles)
  const memberList = rawMembers ?? [];
  if (memberList.length > 0) {
    const userIds = memberList.map((m: any) => m.user_id).filter(Boolean);
    const inviterIds = memberList.map((m: any) => m.invited_by).filter(Boolean);
    const allIds = [...new Set([...userIds, ...inviterIds])];

    const { data: profiles } = await (serviceClient
      .from("profiles")
      .select("id, display_name, username, avatar_url")
      .in("id", allIds) as any);

    const profileMap: Record<string, any> = {};
    (profiles ?? []).forEach((p: any) => { profileMap[p.id] = p; });

    memberList.forEach((m: any) => {
      m.profile = profileMap[m.user_id] ? {
        display_name: profileMap[m.user_id].display_name,
        username: profileMap[m.user_id].username,
        avatar_url: profileMap[m.user_id].avatar_url,
      } : null;
      m.inviter = m.invited_by && profileMap[m.invited_by] ? {
        display_name: profileMap[m.invited_by].display_name,
        username: profileMap[m.invited_by].username,
      } : null;
    });
  }

  return apiSuccess(memberList);
}

// ─── POST /api/brand/[brand_id]/members ─────────────────────────────────────
// Add a member to the brand. Owner or brand_manager (no owner role assignment for managers).
// Body: { email_or_username, role, location_scope? }
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

  const callerRole = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!canManageTeam(callerRole)) return apiForbidden();

  const body = await request.json();
  const { email_or_username, role, location_scope } = body;

  if (!email_or_username || !role) {
    return apiBadRequest("email_or_username and role are required");
  }

  if (!VALID_BRAND_ROLES.includes(role)) {
    return apiBadRequest(`Role must be one of: ${VALID_BRAND_ROLES.join(", ")}`, "role");
  }

  // brand_manager cannot assign owner role
  if (callerRole === "brand_manager" && role === "owner") {
    return apiForbidden();
  }

  // Validate location_scope if provided
  if (location_scope && Array.isArray(location_scope) && location_scope.length > 0) {
    const { data: brandLocations } = await (supabase
      .from("breweries")
      .select("id")
      .eq("brand_id", brand_id) as any);
    const validIds = (brandLocations ?? []).map((l: any) => l.id);
    const invalid = location_scope.filter((id: string) => !validIds.includes(id));
    if (invalid.length > 0) {
      return apiBadRequest("Some location IDs do not belong to this brand");
    }
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
  const insertData: any = {
    brand_id: brand_id,
    user_id: targetUserId,
    role,
    invited_at: new Date().toISOString(),
    invited_by: user.id,
  };

  if (location_scope && Array.isArray(location_scope) && location_scope.length > 0) {
    insertData.location_scope = location_scope;
  }

  const { data: account, error } = await (supabase
    .from("brand_accounts")
    .insert(insertData)
    .select(`
      id,
      user_id,
      role,
      created_at,
      invited_at,
      invited_by,
      location_scope,
      profile:profiles!brand_accounts_user_id_fkey(
        display_name,
        username,
        avatar_url
      ),
      inviter:profiles!brand_accounts_invited_by_fkey(
        display_name,
        username
      )
    `)
    .single() as any);

  if (error) return apiServerError("brand member add");

  // Propagate to brand locations (respects location_scope automatically)
  await propagateBrandAccess(supabase as any, brand_id, { userId: targetUserId });

  // Log activity
  await logTeamActivity(supabase as any, brand_id, user.id, targetUserId, "added", null, role);

  return apiSuccess(account, 201);
}

// ─── PATCH /api/brand/[brand_id]/members ────────────────────────────────────
// Update a member's role and/or location_scope.
// Body: { user_id, role?, location_scope? }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const rl = rateLimitResponse(request, "brand-update-member", { limit: 10, windowMs: 60_000 });
  if (rl) return rl;

  const { brand_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const callerRole = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!canManageTeam(callerRole)) return apiForbidden();

  const body = await request.json();
  const { user_id: targetUserId, role: newRole, location_scope: newScope } = body;

  if (!targetUserId) return apiBadRequest("user_id is required");
  if (!newRole && newScope === undefined) return apiBadRequest("role or location_scope is required");

  // Get current member data
  const { data: target } = await (supabase
    .from("brand_accounts")
    .select("id, role, location_scope")
    .eq("brand_id", brand_id)
    .eq("user_id", targetUserId)
    .maybeSingle() as any);

  if (!target) return apiNotFound("Brand member");

  // Cannot change an owner's role
  if (target.role === "owner" && newRole && newRole !== "owner") {
    return apiBadRequest("Cannot change the owner's role");
  }

  // Cannot change your own role
  if (targetUserId === user.id && newRole) {
    return apiBadRequest("Cannot change your own role");
  }

  // Only owner can change roles
  if (newRole && callerRole !== "owner") {
    return apiForbidden();
  }

  // Validate new role
  if (newRole && !VALID_BRAND_ROLES.includes(newRole)) {
    return apiBadRequest(`Role must be one of: ${VALID_BRAND_ROLES.join(", ")}`);
  }

  // Validate location_scope if provided
  if (newScope && Array.isArray(newScope) && newScope.length > 0) {
    const { data: brandLocations } = await (supabase
      .from("breweries")
      .select("id")
      .eq("brand_id", brand_id) as any);
    const validIds = (brandLocations ?? []).map((l: any) => l.id);
    const invalid = newScope.filter((id: string) => !validIds.includes(id));
    if (invalid.length > 0) {
      return apiBadRequest("Some location IDs do not belong to this brand");
    }
  }

  const updateData: any = {};
  if (newRole) updateData.role = newRole;
  if (newScope !== undefined) updateData.location_scope = newScope;

  const { error } = await (supabase
    .from("brand_accounts")
    .update(updateData)
    .eq("id", target.id) as any);

  if (error) return apiServerError("brand member update");

  // Handle role change propagation
  if (newRole && newRole !== target.role) {
    // Remove old propagated access and re-propagate with new role
    await removePropagatedAccess(supabase as any, brand_id, { userId: targetUserId });
    await propagateBrandAccess(supabase as any, brand_id, { userId: targetUserId });
    await logTeamActivity(supabase as any, brand_id, user.id, targetUserId, "role_changed", target.role, newRole);
  }

  // Handle scope change propagation
  if (newScope !== undefined) {
    const oldScope = target.location_scope;
    const resolvedNewScope = (newScope === null || (Array.isArray(newScope) && newScope.length === 0)) ? null : newScope;
    await recalculateScopedAccess(supabase as any, brand_id, targetUserId, oldScope, resolvedNewScope);
    const oldLabel = oldScope ? `${oldScope.length} locations` : "all locations";
    const newLabel = resolvedNewScope ? `${resolvedNewScope.length} locations` : "all locations";
    await logTeamActivity(supabase as any, brand_id, user.id, targetUserId, "scope_changed", oldLabel, newLabel);
  }

  return apiSuccess({ updated: true });
}

// ─── DELETE /api/brand/[brand_id]/members ───────────────────────────────────
// Remove a member from the brand. Owner or brand_manager (cannot remove owners unless you are owner).
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

  const callerRole = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!canManageTeam(callerRole)) return apiForbidden();

  const body = await request.json();
  const { user_id: targetUserId } = body;

  if (!targetUserId) return apiBadRequest("user_id is required");

  // Can't remove yourself (the owner)
  if (targetUserId === user.id) {
    return apiBadRequest("Cannot remove yourself from the brand. Dissolve the brand instead.");
  }

  // Get target's role
  const { data: target } = await (supabase
    .from("brand_accounts")
    .select("role")
    .eq("brand_id", brand_id)
    .eq("user_id", targetUserId)
    .maybeSingle() as any);

  // brand_manager cannot remove owners
  if (target?.role === "owner" && callerRole !== "owner") {
    return apiForbidden();
  }

  // Log activity before deletion
  await logTeamActivity(supabase as any, brand_id, user.id, targetUserId, "removed", target?.role ?? null, null);

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
