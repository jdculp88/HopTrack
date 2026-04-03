import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimitResponse } from "@/lib/rate-limit";

// POST /api/superadmin/barback/trigger — manually trigger a Barback crawl
export async function POST(req: Request) {
  // Rate limit: 1 per 5 minutes
  const limited = rateLimitResponse(req, "barback-trigger", {
    limit: 1,
    windowMs: 5 * 60 * 1000,
  });
  if (limited) return limited;

  // Verify superadmin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single() as any;

  if (!profile?.is_superadmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const maxSources = Math.min(body.maxSources ?? 50, 100);

  const service = createServiceClient();

  try {
    // Fetch enabled crawl sources
    const { data: sources } = await service
      .from("crawl_sources")
      .select("id, brewery_id, url")
      .eq("enabled", true)
      .order("last_crawled_at", { ascending: true, nullsFirst: true })
      .limit(maxSources) as any;

    if (!sources?.length) {
      return NextResponse.json({
        data: { sourcesProcessed: 0, beersFound: 0, message: "No enabled crawl sources" },
        meta: {},
        error: null,
      });
    }

    // Create a crawl job record
    const { data: job } = await service
      .from("crawl_jobs")
      .insert({
        status: "running",
        sources_queued: sources.length,
        started_at: new Date().toISOString(),
      } as any)
      .select("id")
      .single() as any;

    // Note: The actual crawl logic lives in scripts/barback-crawl.mjs
    // This trigger creates the job and marks sources for processing.
    // For MVP, we update the job to "queued" status — the crawl script
    // picks it up on its next run, or we can invoke it via child_process.
    // This avoids duplicating 200+ lines of crawl logic in TS.

    await service
      .from("crawl_jobs")
      .update({ status: "queued" } as any)
      .eq("id", job.id) as any;

    return NextResponse.json({
      data: {
        jobId: job.id,
        sourcesQueued: sources.length,
        status: "queued",
        message: `Crawl queued for ${sources.length} sources. Run scripts/barback-crawl.mjs to process.`,
      },
      meta: {},
      error: null,
    });
  } catch (err: any) {
    console.error("[barback-trigger] Failed:", err.message);
    return NextResponse.json(
      { data: null, meta: {}, error: { message: "Failed to trigger crawl", code: "TRIGGER_FAILED", status: 500 } },
      { status: 500 }
    );
  }
}
