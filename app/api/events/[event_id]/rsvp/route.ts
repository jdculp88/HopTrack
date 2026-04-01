import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

// GET — check user's RSVP status + total counts for an event
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: myRsvp }, { count: goingCount }, { count: interestedCount }] = await Promise.all([
    supabase
      .from("event_rsvps")
      .select("id, status")
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .single() as any,
    supabase
      .from("event_rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event_id)
      .eq("status", "going") as any,
    supabase
      .from("event_rsvps")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event_id)
      .eq("status", "interested") as any,
  ]);

  return NextResponse.json({
    my_status: myRsvp?.status ?? null,
    going: goingCount ?? 0,
    interested: interestedCount ?? 0,
  });
}

// POST — RSVP to an event (going/interested)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  const limited = rateLimitResponse(req, 'event-rsvp', { limit: 20, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  if (!status || !["going", "interested"].includes(status)) {
    return NextResponse.json({ error: "Status must be 'going' or 'interested'" }, { status: 400 });
  }

  // Check event exists and is in the future
  const { data: event } = await (supabase
    .from("brewery_events")
    .select("id, event_date, capacity, rsvp_count")
    .eq("id", event_id)
    .eq("is_active", true)
    .single() as any);

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Check capacity for 'going' status
  if (status === "going" && event.capacity && event.rsvp_count >= event.capacity) {
    return NextResponse.json({ error: "Event is at capacity" }, { status: 409 });
  }

  // Upsert RSVP
  const { error } = await (supabase
    .from("event_rsvps")
    .upsert(
      { event_id, user_id: user.id, status },
      { onConflict: "event_id,user_id" }
    ) as any);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status });
}

// DELETE — remove RSVP
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ event_id: string }> }
) {
  const { event_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await (supabase
    .from("event_rsvps")
    .delete()
    .eq("event_id", event_id)
    .eq("user_id", user.id) as any);

  return NextResponse.json({ status: null });
}
