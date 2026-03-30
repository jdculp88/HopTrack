-- Migration 040: HopRoute tables
-- Sprint 39 — HopRoute Phase 1

-- ── hop_routes ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE hop_route_status AS ENUM ('draft', 'active', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS hop_routes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT,
  location_city   TEXT,
  location_lat    DOUBLE PRECISION,
  location_lng    DOUBLE PRECISION,
  stop_count      SMALLINT NOT NULL DEFAULT 3,
  group_size      TEXT NOT NULL DEFAULT 'solo',
  vibe            TEXT[] DEFAULT '{}',
  transport       TEXT NOT NULL DEFAULT 'walking',
  status          hop_route_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS hop_routes_user_idx ON hop_routes(user_id);
CREATE INDEX IF NOT EXISTS hop_routes_status_idx ON hop_routes(status);

ALTER TABLE hop_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own hop routes"
  ON hop_routes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── hop_route_stops ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hop_route_stops (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id              UUID NOT NULL REFERENCES hop_routes(id) ON DELETE CASCADE,
  brewery_id            UUID REFERENCES breweries(id) ON DELETE SET NULL,
  stop_order            SMALLINT NOT NULL,
  arrival_time          TIMESTAMPTZ,
  departure_time        TIMESTAMPTZ,
  travel_to_next_minutes INTEGER,
  reasoning_text        TEXT,
  social_context        TEXT,
  is_sponsored          BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in            BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS hop_route_stops_route_idx ON hop_route_stops(route_id);

ALTER TABLE hop_route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage stops on own routes"
  ON hop_route_stops FOR ALL
  USING (
    auth.uid() IN (SELECT user_id FROM hop_routes WHERE id = route_id)
  )
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM hop_routes WHERE id = route_id)
  );

-- ── hop_route_stop_beers ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hop_route_stop_beers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id     UUID NOT NULL REFERENCES hop_route_stops(id) ON DELETE CASCADE,
  beer_id     UUID REFERENCES beers(id) ON DELETE SET NULL,
  beer_name   TEXT,
  reason_text TEXT
);

CREATE INDEX IF NOT EXISTS hop_route_stop_beers_stop_idx ON hop_route_stop_beers(stop_id);

ALTER TABLE hop_route_stop_beers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage beers on own route stops"
  ON hop_route_stop_beers FOR ALL
  USING (
    auth.uid() IN (
      SELECT hr.user_id FROM hop_routes hr
      JOIN hop_route_stops hrs ON hrs.route_id = hr.id
      WHERE hrs.id = stop_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT hr.user_id FROM hop_routes hr
      JOIN hop_route_stops hrs ON hrs.route_id = hr.id
      WHERE hrs.id = stop_id
    )
  );
