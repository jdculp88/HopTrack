# Sprint 39 — HopRoute: Phase 1

**Theme:** Build the core route generation experience. Input → AI → Route Card.
**Status:** Planned
**Date:** TBD
**Sprint Lead:** Morgan

---

## Context

HopRoute is the feature that turns HopTrack from a beer logger into a night-out platform. Sprint 39 delivers Phase 1: the full route generation flow, end-to-end. No sponsored stops, no live mode — just the core magic: you tell it where you are and when you want to go, it builds your night.

Morgan's brief from the HopRoute_Concept_Brief_v1.docx is the source of truth for this sprint.

---

## Tickets

### P0 — HopRoute Generation API
**Owner:** Avery (Jordan reviews) · **Est:** 1.5 sessions

Route: `POST /api/hop-route/generate`

**Input schema:**
```json
{
  "location": { "lat": float, "lng": float, "city": string },
  "time_window": { "start": ISO, "end": ISO },
  "stop_count": 3-5,
  "group_size": "solo|couple|small|large",
  "vibe": ["chill", "outdoor", "food", "dog-friendly", "lively"],
  "transport": "walking|rideshare|driving"
}
```

**What it does:**
1. Fetches breweries within radius (PostGIS or haversine — use existing `haversineDistance` from `lib/geo.ts`)
2. Fetches user's Taste DNA (style preferences from `beer_logs`)
3. Fetches social graph: where friends have checked in in last 90 days
4. Calls Claude API (claude-sonnet-4-6) with structured output
5. Returns ordered stops array with reasoning text, recommended beers, travel info

**Output schema per stop:**
```json
{
  "brewery_id": string,
  "stop_order": int,
  "arrival_time": ISO,
  "departure_time": ISO,
  "travel_to_next_minutes": int,
  "recommended_beers": [{ "beer_id": string, "name": string, "reason": string }],
  "reasoning_text": string,
  "social_context": string | null,
  "is_sponsored": false
}
```

**Store generated routes:** `hop_routes` table (migration 040)

---

### P0 — Migration 040: hop_routes + hop_route_stops
**Owner:** Quinn · **Est:** 30 min

```sql
hop_routes(id, user_id, title, location_city, created_at, status 'draft|active|completed')
hop_route_stops(id, route_id, brewery_id, stop_order, arrival_time, departure_time, reasoning_text, social_context, is_sponsored)
hop_route_stop_beers(id, stop_id, beer_id, reason_text)
```

---

### P0 — HopRoute Input Screen
**Owner:** Alex + Avery · **Est:** 1 session

Route: `app/(app)/hop-route/new/page.tsx`

Three-step compact form:
1. Location (GPS "Use my location" or city search) + time window (smart defaults: "This afternoon" / "Tonight")
2. Quick preferences: stop count slider (2–5), group size selector, vibe chips
3. Taste DNA auto-loaded, editable. "Generate Route" CTA with personality loading state ("Asking the locals..." / "Optimizing your route...")

---

### P0 — HopRoute Route Card
**Owner:** Alex + Avery · **Est:** 1 session

Route: `app/(app)/hop-route/[routeId]/page.tsx`

- Vertical card stack (frosted glass, matches app visual language)
- Each stop: brewery name + photo, vibe tags, AI reasoning text ("Since you love stouts..."), recommended beers, travel time to next
- Social context line if available ("Drew visited here 3 times last month")
- Map toggle: full-screen map with numbered pins + route line
- Share button (generates share card)

---

### P1 — Discover Tab CTA
**Owner:** Avery · **Est:** 30 min

Add "Plan a HopRoute →" hero card near top of Discover tab. Links to `/hop-route/new`.

---

### P1 — HopRoute Share Card
**Owner:** Avery · **Est:** 30 min

Generate a shareable PNG card (same pattern as SessionShareCard / html2canvas):
- Route name, brewery stops listed, mini-map placeholder
- "Join this HopRoute" link
- HopMark watermark

---

### P2 — Brewery Profile Entry Point
**Owner:** Avery · **Est:** 15 min

Add "Start a HopRoute from here" button on brewery detail page.
Pre-fills starting location with this brewery.

---

## Key Architectural Changes
- `POST /api/hop-route/generate` — Claude claude-sonnet-4-6 structured output
- `lib/hop-route.ts` — AI prompt builder, context assembly, output parser
- `GET /api/hop-route/[routeId]` — fetch saved route with stops
- Migration 040: `hop_routes`, `hop_route_stops`, `hop_route_stop_beers`
- Discover tab: "Plan a HopRoute" hero CTA

## Open Questions (Morgan tracking)
- Which AI model? Starting with claude-sonnet-4-6 — evaluate quality and cost
- Minimum brewery count per city to enable HopRoute?
- Tap list freshness strategy?
