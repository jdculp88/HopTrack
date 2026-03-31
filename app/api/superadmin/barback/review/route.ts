import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * PATCH — Approve or reject a single crawled beer
 * Body: { id: string, action: 'approve' | 'reject', reason?: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify superadmin
    const { data: profile } = (await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .single()) as any;

    if (!profile?.is_superadmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, action, reason } = body as {
      id: string;
      action: string;
      reason?: string;
    };

    if (!id || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "id and action (approve | reject) are required" },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS on barback tables
    const service = createServiceClient();

    // Fetch the crawled beer
    const { data: crawledBeer, error: fetchError } = (await service
      .from("crawled_beers")
      .select("*")
      .eq("id", id)
      .single()) as any;

    if (fetchError || !crawledBeer) {
      return NextResponse.json({ error: "Crawled beer not found" }, { status: 404 });
    }

    if (crawledBeer.status !== "pending") {
      return NextResponse.json(
        { error: `Beer is already ${crawledBeer.status}` },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    // ── REJECT ──
    if (action === "reject") {
      const { error: rejectError } = await service
        .from("crawled_beers")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: now,
          rejection_reason: reason || null,
        })
        .eq("id", id);

      if (rejectError) {
        return NextResponse.json(
          { error: `Failed to reject: ${rejectError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: "reject" });
    }

    // ── APPROVE ──

    // 1. Mark as approved
    const { error: approveError } = await service
      .from("crawled_beers")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: now,
      })
      .eq("id", id);

    if (approveError) {
      return NextResponse.json(
        { error: `Failed to approve: ${approveError.message}` },
        { status: 500 }
      );
    }

    // 2. Check for existing beer match (brewery_id + name case-insensitive)
    const { data: existingBeers } = (await service
      .from("beers")
      .select("id")
      .eq("brewery_id", crawledBeer.brewery_id)
      .ilike("name", crawledBeer.name)) as any;

    let beerId: string | null = null;

    if (existingBeers && existingBeers.length > 0) {
      // Match found — update last_verified_at
      beerId = existingBeers[0].id;
      await service
        .from("beers")
        .update({ last_verified_at: now })
        .eq("id", beerId);
    } else {
      // New beer — insert
      const { data: newBeer, error: insertError } = (await service
        .from("beers")
        .insert({
          brewery_id: crawledBeer.brewery_id,
          name: crawledBeer.name,
          style: crawledBeer.mapped_style || crawledBeer.style || null,
          abv: crawledBeer.abv,
          ibu: crawledBeer.ibu,
          description: crawledBeer.description,
          source: "crawled",
          is_on_tap: true,
          last_verified_at: now,
        })
        .select("id")
        .single()) as any;

      if (insertError) {
        console.error("Failed to insert promoted beer:", insertError.message);
      } else {
        beerId = newBeer?.id ?? null;
      }
    }

    // 3. Mark as promoted
    await service
      .from("crawled_beers")
      .update({
        status: "promoted",
        promoted_at: now,
        matched_beer_id: beerId,
      })
      .eq("id", id);

    // 4. Increment brewery crawl_beer_count
    const { data: brewery } = (await service
      .from("breweries")
      .select("crawl_beer_count")
      .eq("id", crawledBeer.brewery_id)
      .single()) as any;

    if (brewery) {
      await service
        .from("breweries")
        .update({
          crawl_beer_count: (brewery.crawl_beer_count ?? 0) + 1,
        })
        .eq("id", crawledBeer.brewery_id);
    }

    return NextResponse.json({
      success: true,
      action: "approve",
      beerId,
    });
  } catch (err) {
    console.error("/api/superadmin/barback/review PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST — Batch approve high-confidence beers
 * Body: { action: 'approve_high_confidence', threshold?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify superadmin
    const { data: profile } = (await supabase
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .single()) as any;

    if (!profile?.is_superadmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, threshold = 0.85 } = body as {
      action: string;
      threshold?: number;
    };

    if (action !== "approve_high_confidence") {
      return NextResponse.json(
        { error: "Invalid action. Expected: approve_high_confidence" },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const now = new Date().toISOString();

    // Fetch all pending beers above threshold
    const { data: pendingBeers, error: fetchError } = (await service
      .from("crawled_beers")
      .select("*")
      .eq("status", "pending")
      .gte("confidence", threshold)) as any;

    if (fetchError) {
      return NextResponse.json(
        { error: `Failed to fetch pending beers: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!pendingBeers || pendingBeers.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let promotedCount = 0;

    for (const crawledBeer of pendingBeers) {
      // Mark approved
      await service
        .from("crawled_beers")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: now,
        })
        .eq("id", crawledBeer.id);

      // Check for existing match
      const { data: existingBeers } = (await service
        .from("beers")
        .select("id")
        .eq("brewery_id", crawledBeer.brewery_id)
        .ilike("name", crawledBeer.name)) as any;

      let beerId: string | null = null;

      if (existingBeers && existingBeers.length > 0) {
        beerId = existingBeers[0].id;
        await service
          .from("beers")
          .update({ last_verified_at: now })
          .eq("id", beerId);
      } else {
        const { data: newBeer } = (await service
          .from("beers")
          .insert({
            brewery_id: crawledBeer.brewery_id,
            name: crawledBeer.name,
            style: crawledBeer.mapped_style || crawledBeer.style || null,
            abv: crawledBeer.abv,
            ibu: crawledBeer.ibu,
            description: crawledBeer.description,
            source: "crawled",
            is_on_tap: true,
            last_verified_at: now,
          })
          .select("id")
          .single()) as any;

        beerId = newBeer?.id ?? null;
      }

      // Mark promoted
      await service
        .from("crawled_beers")
        .update({
          status: "promoted",
          promoted_at: now,
          matched_beer_id: beerId,
        })
        .eq("id", crawledBeer.id);

      // Increment brewery crawl_beer_count
      const { data: brewery } = (await service
        .from("breweries")
        .select("crawl_beer_count")
        .eq("id", crawledBeer.brewery_id)
        .single()) as any;

      if (brewery) {
        await service
          .from("breweries")
          .update({
            crawl_beer_count: (brewery.crawl_beer_count ?? 0) + 1,
          })
          .eq("id", crawledBeer.brewery_id);
      }

      promotedCount++;
    }

    return NextResponse.json({ success: true, count: promotedCount });
  } catch (err) {
    console.error("/api/superadmin/barback/review POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
