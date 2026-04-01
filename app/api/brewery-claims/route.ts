import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onBreweryClaim } from "@/lib/email-triggers";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = rateLimitResponse(request, "brewery-claims", { limit: 5, windowMs: 60_000 });
  if (rl) return rl;
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { brewery, businessEmail, role, notes } = body as {
      brewery: {
        id: string;
        name: string;
        brewery_type: string;
        city: string;
        state_province: string;
        country: string;
        address_1: string | null;
        website_url: string | null;
        phone: string | null;
        latitude: string | null;
        longitude: string | null;
      };
      businessEmail: string;
      role: "owner" | "manager";
      notes: string;
    };

    if (!brewery?.id || !brewery?.name) {
      return NextResponse.json(
        { error: "Brewery data is required" },
        { status: 400 }
      );
    }

    // 1. Upsert the brewery using the Open Brewery DB external_id
    const { data: upsertedBrewery, error: breweryError } = (await supabase
      .from("breweries")
      .upsert(
        {
          external_id: brewery.id,
          name: brewery.name,
          brewery_type: brewery.brewery_type ?? null,
          street: brewery.address_1 ?? null,
          city: brewery.city ?? null,
          state: brewery.state_province ?? null,
          country: brewery.country ?? null,
          phone: brewery.phone ?? null,
          website_url: brewery.website_url ?? null,
          latitude: brewery.latitude ? parseFloat(brewery.latitude) : null,
          longitude: brewery.longitude ? parseFloat(brewery.longitude) : null,
        },
        { onConflict: "external_id" }
      )
      .select("id")
      .single()) as any;

    if (breweryError) {
      console.error("Brewery upsert error:", breweryError);
      return NextResponse.json(
        { error: "Failed to save brewery. Please try again." },
        { status: 500 }
      );
    }

    const breweryId = (upsertedBrewery as any).id as string;

    // 2. Check for an existing claim from this user for this brewery
    const { data: existingClaim } = (await supabase
      .from("brewery_claims")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("brewery_id", breweryId)
      .limit(1)) as any;

    if ((existingClaim as any[])?.length > 0) {
      // Already claimed — just return the brewery_id so they can navigate
      return NextResponse.json({ brewery_id: breweryId });
    }

    // 3. Create the brewery_claims record (status: pending)
    const { error: claimError } = (await supabase.from("brewery_claims").insert({
      user_id: user.id,
      brewery_id: breweryId,
      status: "pending",
      business_email: businessEmail ?? null,
      notes: notes ?? null,
    })) as any;

    if (claimError) {
      console.error("Claim insert error:", claimError);
      return NextResponse.json(
        { error: "Failed to submit claim. Please try again." },
        { status: 500 }
      );
    }

    // 4. Create brewery_accounts record (verified: false) so they can see the dashboard
    const { error: accountError } = (await supabase
      .from("brewery_accounts")
      .upsert(
        {
          user_id: user.id,
          brewery_id: breweryId,
          role: role ?? "owner",
          verified: false,
        },
        { onConflict: "user_id,brewery_id" }
      )) as any;

    if (accountError) {
      console.error("Account upsert error:", accountError);
      // Non-fatal: claim was created; account creation failed
      return NextResponse.json(
        { error: "Claim submitted but dashboard setup failed. Contact support." },
        { status: 500 }
      );
    }

    // Fire brewery welcome email (non-blocking)
    onBreweryClaim(breweryId, user.id).catch((err) =>
      console.error("[brewery-claims] Email trigger failed:", err)
    );

    return NextResponse.json({ brewery_id: breweryId }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error in brewery-claims POST:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
