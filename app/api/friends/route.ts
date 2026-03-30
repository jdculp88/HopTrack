import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("friendships")
    .select(`
      id, requester_id, addressee_id, status, created_at,
      requester:profiles!requester_id(id, username, display_name, avatar_url),
      addressee:profiles!addressee_id(id, username, display_name, avatar_url)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

  // Normalize: always expose `profile` as the OTHER person (not the current user)
  const friendships = (data ?? []).map((f: any) => {
    const profile = f.requester_id === user.id ? f.addressee : f.requester;
    const { requester, addressee, ...rest } = f;
    return { ...rest, profile };
  });

  return NextResponse.json({ friendships });
}

export async function POST(request: Request) {
  const rl = rateLimitResponse(request, "friends", { limit: 30, windowMs: 60_000 });
  if (rl) return rl;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { addressee_id } = await request.json();
  if (!addressee_id) return NextResponse.json({ error: "addressee_id required" }, { status: 400 });
  if (addressee_id === user.id) return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });

  // Check existing
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(`requester_id.eq.${user.id}.and.addressee_id.eq.${addressee_id},requester_id.eq.${addressee_id}.and.addressee_id.eq.${user.id}`)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Friendship already exists", existing }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("friendships")
    .insert({ requester_id: user.id, addressee_id, status: "pending" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the addressee
  const { data: requesterProfile } = await supabase
    .from("profiles").select("display_name, username").eq("id", user.id).single() as any;
  const name = requesterProfile?.display_name || requesterProfile?.username || "Someone";
  await (supabase as any).from("notifications").insert({
    user_id: addressee_id,
    type: "friend_request",
    title: "Friend request",
    body: `${name} sent you a friend request`,
    data: { friendship_id: data.id, requester_id: user.id },
  });

  return NextResponse.json({ friendship: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await request.json();
  if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
  if (!["accepted", "blocked"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { data, error } = await supabase
    .from("friendships")
    .update({ status })
    .eq("id", id)
    .eq("addressee_id", user.id) // only addressee can accept
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ friendship: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
