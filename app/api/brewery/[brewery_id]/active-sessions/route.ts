import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count, error } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("brewery_id", brewery_id)
    .eq("is_active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: count ?? 0 });
}
