-- Migration 085: Verify brand data integrity (Sprint 127 — The Reckoning)
-- Ensures Pint & Pixel brand locations are properly linked and loyalty is active.

DO $$
DECLARE
  v_brand_id uuid := 'bb000001-0000-4000-8000-000000000001';
  v_asheville uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  v_charlotte uuid := 'dd078001-0000-4000-8000-000000000001';
  v_loc_count int;
  v_loyalty_count int;
BEGIN
  -- Ensure brand_id is set on both P&P locations (idempotent)
  UPDATE breweries SET brand_id = v_brand_id
  WHERE id = v_asheville AND (brand_id IS NULL OR brand_id != v_brand_id);

  UPDATE breweries SET brand_id = v_brand_id
  WHERE id = v_charlotte AND (brand_id IS NULL OR brand_id != v_brand_id);

  -- Verify location count
  SELECT count(*) INTO v_loc_count FROM breweries WHERE brand_id = v_brand_id;
  RAISE NOTICE 'Pint & Pixel brand locations linked: %', v_loc_count;

  -- Verify brand loyalty program is active
  SELECT count(*) INTO v_loyalty_count
  FROM brand_loyalty_programs WHERE brand_id = v_brand_id AND is_active = true;
  RAISE NOTICE 'Active brand loyalty programs: %', v_loyalty_count;

  -- If no active loyalty program exists, the seed from 083 may have failed — log it
  IF v_loyalty_count = 0 THEN
    RAISE NOTICE 'WARNING: No active brand loyalty program found for Pint & Pixel. Check migration 083.';
  END IF;
END $$;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
