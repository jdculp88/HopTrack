import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { requireAuth, requireBreweryAdmin } from "@/lib/api-helpers";
import { apiUnauthorized, apiForbidden, apiSuccess, apiServerError, apiNotFound } from "@/lib/api-response";

// ── GET /api/brewery/[brewery_id]/beers/[beer_id]/pour-sizes ─────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; beer_id: string }> }
) {
  const { brewery_id, beer_id } = await params;
  const supabase = await createClient();

  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  const { data, error } = await supabase
    .from("beer_pour_sizes")
    .select("*")
    .eq("beer_id", beer_id)
    .order("display_order", { ascending: true });

  if (error) return apiServerError(error.message);
  return apiSuccess(data ?? []);
}

// ── POST /api/brewery/[brewery_id]/beers/[beer_id]/pour-sizes ────────────────
// Replaces ALL pour sizes for a beer (delete + re-insert).
// Body: Array<{ label: string; oz: number | null; price: number; display_order: number }>
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ brewery_id: string; beer_id: string }> }
) {
  const { brewery_id, beer_id } = await params;
  const supabase = await createClient();

  const user = await requireAuth(supabase);
  if (!user) return apiUnauthorized();

  const account = await requireBreweryAdmin(supabase, user.id, brewery_id);
  if (!account) return apiForbidden();

  // Verify beer belongs to this brewery
  const { data: beer } = await supabase
    .from("beers").select("id").eq("id", beer_id).eq("brewery_id", brewery_id).single();
  if (!beer) return apiNotFound("Beer");

  const sizes = await req.json() as Array<{
    label: string;
    oz: number | null;
    price: number;
    display_order: number;
  }>;

  // Delete existing, then insert new
  await supabase.from("beer_pour_sizes").delete().eq("beer_id", beer_id);

  if (sizes.length > 0) {
    const rows = sizes.map((s, i) => ({
      beer_id,
      label: s.label.trim(),
      oz: s.oz ?? null,
      price: s.price,
      display_order: i,
    }));
    const { error } = await supabase.from("beer_pour_sizes").insert(rows);
    if (error) return apiServerError(error.message);
  }

  // Return updated list
  const { data } = await supabase
    .from("beer_pour_sizes")
    .select("*")
    .eq("beer_id", beer_id)
    .order("display_order", { ascending: true });

  return apiSuccess(data ?? []);
}
