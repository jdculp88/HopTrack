DO $$
DECLARE
  u02      uuid := 'cc000000-0000-0000-0000-000000000002';
  brew_mtn uuid := 'dd000001-0000-0000-0000-000000000001';
  brew_riv uuid := 'dd000001-0000-0000-0000-000000000002';
  brew_smk uuid := 'dd000001-0000-0000-0000-000000000003';
  route_id uuid := 'ee000014-0000-0000-0000-000000000001';
BEGIN
  -- Insert/update the hop route
  INSERT INTO hop_routes (id, user_id, title, location_city, stop_count, vibe, transport, status, started_at)
  VALUES (route_id, u02, 'Asheville Craft Crawl', 'Asheville, NC', 3, ARRAY['craft','social'], 'walking', 'active', now() - interval '1 hour 15 minutes')
  ON CONFLICT (id) DO UPDATE SET status = 'active', started_at = EXCLUDED.started_at;

  -- Insert stops (3 stops, first one checked in)
  INSERT INTO hop_route_stops (id, route_id, brewery_id, stop_order, checked_in, checked_in_at)
  VALUES
    ('ee000014-0001-0000-0000-000000000001', route_id, brew_mtn, 1, true,  now() - interval '1 hour'),
    ('ee000014-0002-0000-0000-000000000002', route_id, brew_riv, 2, false, NULL),
    ('ee000014-0003-0000-0000-000000000003', route_id, brew_smk, 3, false, NULL)
  ON CONFLICT (id) DO UPDATE SET checked_in = EXCLUDED.checked_in, checked_in_at = EXCLUDED.checked_in_at;

  RAISE NOTICE 'Seed 014 complete — Marcus has an active HopRoute';
END $$;
