import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBrandLoyaltyProgram, getBrandLoyaltyCard } from "@/lib/brand-loyalty";
import { apiSuccess, apiUnauthorized } from "@/lib/api-response";

// ─── GET /api/brand/[brand_id]/loyalty/card ────────────────────────────────
// Consumer: fetch current user's brand loyalty card + program info
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  const { brand_id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const program = await getBrandLoyaltyProgram(supabase, brand_id);
  if (!program) return apiSuccess({ program: null, card: null });

  const card = await getBrandLoyaltyCard(supabase, user.id, brand_id);

  return apiSuccess({ program, card });
}
