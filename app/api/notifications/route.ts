import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/notifications — mark all as read
export async function PATCH() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await (supabase as any)
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return NextResponse.json({ success: true });
}
