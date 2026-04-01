// Beer Barcode Lookup — Scan a barcode, find the beer
// Sprint 89 — The Rolodex (F-008)
// GET /api/beers/barcode/[code]

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ data: null, error: { message: "Unauthorized" } }, { status: 401 });

  if (!code || code.length < 8 || code.length > 14) {
    return Response.json(
      { data: null, error: { message: "Invalid barcode. Expected 8-14 digit UPC/EAN." } },
      { status: 400 }
    );
  }

  // Look up beer by barcode
  const { data: beer, error } = await supabase
    .from("beers")
    .select("id, name, style, abv, ibu, description, item_type, brewery_id, brewery:breweries(name, city, state)")
    .eq("barcode", code)
    .maybeSingle() as any;

  if (error) {
    return Response.json(
      { data: null, error: { message: "Lookup failed" } },
      { status: 500 }
    );
  }

  if (!beer) {
    return Response.json(
      { data: null, found: false, error: { message: "No beer found for this barcode" } },
      { status: 404 }
    );
  }

  return Response.json({
    data: beer,
    found: true,
    error: null,
  });
}
