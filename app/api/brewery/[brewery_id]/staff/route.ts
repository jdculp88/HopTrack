import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

const VALID_ROLES = ["business", "marketing", "staff"] as const;
type StaffRole = (typeof VALID_ROLES)[number];

/** Check if user is owner or manager of the brewery */
async function getCallerRole(
  supabase: any,
  userId: string,
  breweryId: string
): Promise<"owner" | "business" | "marketing" | "staff" | null> {
  // Check brewery_accounts first
  const { data: account } = await (supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", userId)
    .eq("brewery_id", breweryId)
    .single() as any);

  if (account?.role) return account.role;

  // Fallback: check if user is the brewery owner via breweries.owner_id
  const { data: brewery } = await (supabase
    .from("breweries")
    .select("owner_id")
    .eq("id", breweryId)
    .single() as any);

  if (brewery?.owner_id === userId) return "owner";

  return null;
}

function isOwnerOrManager(role: string | null): boolean {
  return role === "owner" || role === "business";
}

// ─── GET /api/brewery/[brewery_id]/staff ─────────────────────────────────────
// List all staff for a brewery (owner/manager only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callerRole = await getCallerRole(supabase, user.id, brewery_id);
  if (!isOwnerOrManager(callerRole))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: staff, error } = await (supabase
    .from("brewery_accounts")
    .select(
      `
      id,
      user_id,
      role,
      created_at,
      propagated_from_brand,
      profile:profiles!brewery_accounts_user_id_fkey(
        display_name,
        username,
        avatar_url
      )
    `
    )
    .eq("brewery_id", brewery_id)
    .order("created_at", { ascending: true }) as any);

  if (error) {
    console.error("[staff:GET] Failed to fetch staff:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }

  // Flatten the profile join
  const formatted = (staff ?? []).map((s: any) => ({
    id: s.id,
    user_id: s.user_id,
    role: s.role,
    created_at: s.created_at,
    propagated_from_brand: s.propagated_from_brand ?? false,
    display_name: s.profile?.display_name ?? null,
    username: s.profile?.username ?? null,
    avatar_url: s.profile?.avatar_url ?? null,
  }));

  return NextResponse.json(formatted, {
    headers: { "Cache-Control": "no-store" },
  });
}

// ─── POST /api/brewery/[brewery_id]/staff ────────────────────────────────────
// Add a new staff member by email or username (owner/manager only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const limited = rateLimitResponse(request, "brewery-staff-add", {
    limit: 10,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { brewery_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callerRole = await getCallerRole(supabase, user.id, brewery_id);
  if (!isOwnerOrManager(callerRole))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email_or_username, role } = (await request.json()) as {
    email_or_username: string;
    role: string;
  };

  if (!email_or_username?.trim()) {
    return NextResponse.json(
      { error: "email_or_username is required" },
      { status: 400 }
    );
  }

  if (!VALID_ROLES.includes(role as StaffRole)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  // Look up user in profiles by username or email
  const input = email_or_username.trim().toLowerCase();
  const isEmail = input.includes("@");

  let profile: any = null;
  if (isEmail) {
    const { data } = await (supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url, email")
      .eq("email", input)
      .single() as any);
    profile = data;
  } else {
    const { data } = await (supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url, email")
      .eq("username", input)
      .single() as any);
    profile = data;
  }

  if (!profile) {
    return NextResponse.json(
      { error: "User not found. They must have a HopTrack account first." },
      { status: 404 }
    );
  }

  // Check if already a staff member
  const { data: existing } = await (supabase
    .from("brewery_accounts")
    .select("id, role")
    .eq("user_id", profile.id)
    .eq("brewery_id", brewery_id)
    .single() as any);

  if (existing) {
    return NextResponse.json(
      {
        error: `This user is already a ${existing.role} for this brewery`,
      },
      { status: 409 }
    );
  }

  // Insert new staff member
  const { data: newAccount, error } = await (supabase
    .from("brewery_accounts")
    .insert({
      user_id: profile.id,
      brewery_id,
      role,
    })
    .select("id, user_id, role, created_at")
    .single() as any);

  if (error) {
    console.error("[staff:POST] Failed to add staff:", error.message);
    return NextResponse.json(
      { error: "Failed to add staff member" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ...newAccount,
      display_name: profile.display_name,
      username: profile.username,
      avatar_url: profile.avatar_url,
    },
    { status: 201 }
  );
}

// ─── PATCH /api/brewery/[brewery_id]/staff ───────────────────────────────────
// Change a staff member's role (owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callerRole = await getCallerRole(supabase, user.id, brewery_id);
  if (callerRole !== "owner") {
    return NextResponse.json(
      { error: "Only the owner can change staff roles" },
      { status: 403 }
    );
  }

  const { user_id, role } = (await request.json()) as {
    user_id: string;
    role: string;
  };

  if (!user_id?.trim()) {
    return NextResponse.json(
      { error: "user_id is required" },
      { status: 400 }
    );
  }

  if (!VALID_ROLES.includes(role as StaffRole)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  // Verify the target is an existing staff member (not the owner)
  const { data: target } = await (supabase
    .from("brewery_accounts")
    .select("id, role")
    .eq("user_id", user_id)
    .eq("brewery_id", brewery_id)
    .single() as any);

  if (!target) {
    return NextResponse.json(
      { error: "Staff member not found" },
      { status: 404 }
    );
  }

  if (target.role === "owner") {
    return NextResponse.json(
      { error: "Cannot change the owner's role" },
      { status: 400 }
    );
  }

  const { data: updated, error } = await (supabase
    .from("brewery_accounts")
    .update({ role })
    .eq("id", target.id)
    .select("id, user_id, role, created_at")
    .single() as any);

  if (error) {
    console.error("[staff:PATCH] Failed to update role:", error.message);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }

  return NextResponse.json(updated);
}

// ─── DELETE /api/brewery/[brewery_id]/staff ───────────────────────────────────
// Remove a staff member (owner/manager only, cannot remove owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callerRole = await getCallerRole(supabase, user.id, brewery_id);
  if (!isOwnerOrManager(callerRole))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { user_id } = (await request.json()) as { user_id: string };

  if (!user_id?.trim()) {
    return NextResponse.json(
      { error: "user_id is required" },
      { status: 400 }
    );
  }

  // Cannot remove yourself if you are the owner
  if (user_id === user.id && callerRole === "owner") {
    return NextResponse.json(
      { error: "Cannot remove yourself as the owner" },
      { status: 400 }
    );
  }

  // Verify the target exists and is not the owner
  const { data: target } = await (supabase
    .from("brewery_accounts")
    .select("id, role")
    .eq("user_id", user_id)
    .eq("brewery_id", brewery_id)
    .single() as any);

  if (!target) {
    return NextResponse.json(
      { error: "Staff member not found" },
      { status: 404 }
    );
  }

  if (target.role === "owner") {
    return NextResponse.json(
      { error: "Cannot remove the brewery owner" },
      { status: 400 }
    );
  }

  // Business role can't remove other business users — only owner can
  if (callerRole === "business" && target.role === "business") {
    return NextResponse.json(
      { error: "Business users cannot remove other business users" },
      { status: 403 }
    );
  }

  const { error } = await (supabase
    .from("brewery_accounts")
    .delete()
    .eq("id", target.id) as any);

  if (error) {
    console.error("[staff:DELETE] Failed to remove staff:", error.message);
    return NextResponse.json(
      { error: "Failed to remove staff member" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
