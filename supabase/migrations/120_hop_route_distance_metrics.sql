-- Migration 120: HopRoute distance metrics
-- Sprint 178 — Smart Concierge upgrade
--
-- Adds distance/walk-time columns to hop_route_stops and route-level summaries
-- to hop_routes. All nullable for backward compatibility with existing routes.

ALTER TABLE hop_route_stops
  ADD COLUMN IF NOT EXISTS distance_to_next_miles DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS walk_minutes_to_next INTEGER;

ALTER TABLE hop_routes
  ADD COLUMN IF NOT EXISTS total_distance_miles DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS avg_stop_distance_miles DOUBLE PRECISION;
