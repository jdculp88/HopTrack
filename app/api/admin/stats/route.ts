import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify superadmin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_superadmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use service role client for stats queries — bypasses RLS so counts are accurate
    const service = createServiceClient();

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Service client returns untyped query builders (no codegen schema); cast count
    // responses to a minimal shape rather than `as any`.
    type CountResult = Promise<{ count: number | null; data: null; error: null }>;

    const [
      { count: totalUsers },
      { count: totalBreweries },
      { count: totalSessions },
      { count: totalBeers },
      { count: pendingClaims },
      { count: approvedClaims },
      { count: rejectedClaims },
      { count: verifiedBreweries },
      { count: newUsersThisWeek },
      { count: newUsersThisMonth },
      { count: sessionsThisWeek },
      { count: sessionsThisMonth },
    ] = await Promise.all([
      service.from("profiles").select("id", { count: "exact", head: true }) as unknown as CountResult,
      service.from("breweries").select("id", { count: "exact", head: true }) as unknown as CountResult,
      service.from("sessions").select("id", { count: "exact", head: true }).eq("is_active", false) as unknown as CountResult,
      service.from("beers").select("id", { count: "exact", head: true }) as unknown as CountResult,
      service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "pending") as unknown as CountResult,
      service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "approved") as unknown as CountResult,
      service.from("brewery_claims").select("id", { count: "exact", head: true }).eq("status", "rejected") as unknown as CountResult,
      service.from("brewery_accounts").select("id", { count: "exact", head: true }).eq("verified", true) as unknown as CountResult,
      service.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo) as unknown as CountResult,
      service.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", oneMonthAgo) as unknown as CountResult,
      service.from("sessions").select("id", { count: "exact", head: true }).eq("is_active", false).gte("started_at", oneWeekAgo) as unknown as CountResult,
      service.from("sessions").select("id", { count: "exact", head: true }).eq("is_active", false).gte("started_at", oneMonthAgo) as unknown as CountResult,
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers ?? 0,
        newThisWeek: newUsersThisWeek ?? 0,
        newThisMonth: newUsersThisMonth ?? 0,
      },
      breweries: {
        total: totalBreweries ?? 0,
        verified: verifiedBreweries ?? 0,
      },
      sessions: {
        total: totalSessions ?? 0,
        thisWeek: sessionsThisWeek ?? 0,
        thisMonth: sessionsThisMonth ?? 0,
      },
      beers: {
        total: totalBeers ?? 0,
      },
      claims: {
        pending: pendingClaims ?? 0,
        approved: approvedClaims ?? 0,
        rejected: rejectedClaims ?? 0,
      },
      generatedAt: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (err) {
    console.error("/api/admin/stats GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
