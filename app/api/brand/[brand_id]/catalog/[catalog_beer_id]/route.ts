import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  apiSuccess,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
  apiBadRequest,
  apiServerError,
} from "@/lib/api-response";
import { verifyBrandAccess } from "@/lib/brand-auth";

type Params = Promise<{ brand_id: string; catalog_beer_id: string }>;

// ─── GET /api/brand/[brand_id]/catalog/[catalog_beer_id] ────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { brand_id, catalog_beer_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const role = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!role || !["owner", "regional_manager"].includes(role)) return apiForbidden();

  try {
    const { data: catalogBeer } = await (supabase
      .from("brand_catalog_beers")
      .select("*")
      .eq("id", catalog_beer_id)
      .eq("brand_id", brand_id)
      .single() as any);

    if (!catalogBeer) return apiNotFound("Catalog beer");

    // Fetch linked location beers
    const { data: linkedBeers } = await (supabase
      .from("beers")
      .select("id, brewery_id, name, is_on_tap, is_86d, price_per_pint, is_active")
      .eq("brand_catalog_beer_id", catalog_beer_id)
      .eq("is_active", true) as any);

    return apiSuccess({
      ...catalogBeer,
      locations: (linkedBeers ?? []).map((b: any) => ({
        locationId: b.brewery_id,
        beerId: b.id,
        isOnTap: b.is_on_tap ?? false,
        is86d: b.is_86d ?? false,
        pricePerPint: b.price_per_pint,
      })),
    });
  } catch (err) {
    console.error("Catalog beer GET error:", err);
    return apiServerError("catalog beer detail");
  }
}

// ─── PATCH /api/brand/[brand_id]/catalog/[catalog_beer_id] ──────────────────
// Update catalog beer. Optionally propagate canonical fields to linked location beers.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { brand_id, catalog_beer_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  const role = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!role || !["owner", "regional_manager"].includes(role)) return apiForbidden();

  const body = await request.json();
  const { propagate, ...fields } = body;

  // Build update object — only catalog-level fields
  const update: Record<string, any> = {};
  if (fields.name !== undefined) update.name = fields.name.trim();
  if (fields.style !== undefined) update.style = fields.style || null;
  if (fields.abv !== undefined) update.abv = fields.abv ? parseFloat(fields.abv) : null;
  if (fields.ibu !== undefined) update.ibu = fields.ibu ? parseInt(fields.ibu) : null;
  if (fields.description !== undefined) update.description = fields.description?.trim() || null;
  if (fields.itemType !== undefined) update.item_type = fields.itemType;
  if (fields.category !== undefined) update.category = fields.category?.trim() || null;
  if (fields.glassType !== undefined) update.glass_type = fields.glassType || null;
  if (fields.coverImageUrl !== undefined) update.cover_image_url = fields.coverImageUrl || null;
  if (fields.seasonal !== undefined) update.seasonal = fields.seasonal;
  if (fields.isActive !== undefined) update.is_active = fields.isActive;
  // Sprint 176 sensory fields
  if (fields.srm !== undefined) {
    const srmValue = fields.srm === null || fields.srm === ""
      ? null
      : parseInt(fields.srm);
    if (srmValue != null && (Number.isNaN(srmValue) || srmValue < 1 || srmValue > 40)) {
      return apiBadRequest("SRM must be between 1 and 40", "srm");
    }
    update.srm = srmValue;
  }
  if (fields.aromaNotes  !== undefined) update.aroma_notes  = Array.isArray(fields.aromaNotes)  ? fields.aromaNotes  : [];
  if (fields.tasteNotes  !== undefined) update.taste_notes  = Array.isArray(fields.tasteNotes)  ? fields.tasteNotes  : [];
  if (fields.finishNotes !== undefined) update.finish_notes = Array.isArray(fields.finishNotes) ? fields.finishNotes : [];

  if (Object.keys(update).length === 0) return apiBadRequest("No fields to update");

  try {
    const { data: updated, error } = await (supabase
      .from("brand_catalog_beers")
      .update(update)
      .eq("id", catalog_beer_id)
      .eq("brand_id", brand_id)
      .select()
      .single() as any);

    if (error || !updated) {
      console.error("Catalog beer update error:", error);
      return apiNotFound("Catalog beer");
    }

    // Propagate canonical fields to linked location beers
    let propagated = 0;
    if (propagate) {
      const propagateFields: Record<string, any> = {};
      if (update.name) propagateFields.name = update.name;
      if (update.style !== undefined) propagateFields.style = update.style;
      if (update.abv !== undefined) propagateFields.abv = update.abv;
      if (update.ibu !== undefined) propagateFields.ibu = update.ibu;
      if (update.description !== undefined) propagateFields.description = update.description;
      if (update.item_type !== undefined) propagateFields.item_type = update.item_type;
      if (update.category !== undefined) propagateFields.category = update.category;
      if (update.glass_type !== undefined) propagateFields.glass_type = update.glass_type;
      if (update.cover_image_url !== undefined) propagateFields.cover_image_url = update.cover_image_url;
      // Sprint 176 — sensory fields travel with the rest when propagate is true
      if (update.srm !== undefined) propagateFields.srm = update.srm;
      if (update.aroma_notes  !== undefined) propagateFields.aroma_notes  = update.aroma_notes;
      if (update.taste_notes  !== undefined) propagateFields.taste_notes  = update.taste_notes;
      if (update.finish_notes !== undefined) propagateFields.finish_notes = update.finish_notes;

      if (Object.keys(propagateFields).length > 0) {
        const { data: propagatedBeers } = await (supabase
          .from("beers")
          .update(propagateFields)
          .eq("brand_catalog_beer_id", catalog_beer_id)
          .eq("is_active", true)
          .select("id") as any);

        propagated = propagatedBeers?.length ?? 0;
      }
    }

    return apiSuccess({ ...updated, propagated });
  } catch (err) {
    console.error("Catalog beer PATCH error:", err);
    return apiServerError("update catalog beer");
  }
}

// ─── DELETE /api/brand/[brand_id]/catalog/[catalog_beer_id] ─────────────────
// Soft-delete: sets is_active = false. Location beers keep their FK.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const { brand_id, catalog_beer_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiUnauthorized();

  // Delete requires owner role
  const role = await verifyBrandAccess(supabase, brand_id, user.id);
  if (!role || role !== "owner") return apiForbidden();

  try {
    const { data, error } = await (supabase
      .from("brand_catalog_beers")
      .update({ is_active: false })
      .eq("id", catalog_beer_id)
      .eq("brand_id", brand_id)
      .select("id")
      .single() as any);

    if (error || !data) return apiNotFound("Catalog beer");

    return apiSuccess({ id: data.id, retired: true });
  } catch (err) {
    console.error("Catalog beer DELETE error:", err);
    return apiServerError("retire catalog beer");
  }
}
