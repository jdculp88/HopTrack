import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brewery_id: string }> }
) {
  const { brewery_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the user belongs to this brewery (owner or manager only)
  const { data: account } = await supabase
    .from("brewery_accounts")
    .select("role")
    .eq("user_id", user.id)
    .eq("brewery_id", brewery_id)
    .in("role", ["owner", "manager"])
    .single();

  if (!account) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, street, city, state, website_url, phone, description } = body;

  if (!name?.trim() || !city?.trim()) {
    return NextResponse.json({ error: "Name and city are required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("breweries")
    .update({
      name: name.trim(),
      street: street?.trim() || null,
      city: city.trim(),
      state: state?.trim() || null,
      website_url: website_url?.trim() || null,
      phone: phone?.trim() || null,
      description: description?.trim() || null,
    })
    .eq("id", brewery_id);

  if (error) {
    return NextResponse.json({ error: "Failed to update brewery" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
