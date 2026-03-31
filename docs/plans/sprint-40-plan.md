# Sprint 40 — HopRoute: Live + The Close

**Theme:** Live Mode, social proof, sponsored stop infrastructure, retro-ready.
**Status:** Planned
**Date:** TBD
**Sprint Lead:** Morgan

---

## Context

Sprint 40 is the last sprint before the retro. By end of Sprint 40:
- HopRoute Live Mode is functional (guided experience once a route is active)
- Social proof is in the Friends feed (completed routes are visible)
- Sponsored stop infrastructure is built (breweries can pay to be included)
- The entire product is retro-ready, demo-ready, and close-ready

**Taylor's target:** First paid brewery closed before the retro. Let's give her everything she needs.

---

## Tickets

### P0 — HopRoute Live Mode
**Owner:** Avery (Alex UX) · **Est:** 1.5 sessions

Once a route is started, the app enters guided mode:
- Persistent bottom sheet (matches `ActiveSessionBanner` pattern)
- Current stop highlighted with "You're here"
- Next stop: countdown + travel estimate
- One-tap check-in at current stop (pre-filled with brewery + recommended beer)
- Route progress indicator (stop 2 of 4)
- "HopRoute Complete!" celebration when all stops done

**State:** `hop_routes.status` changes `draft → active → completed`

---

### P0 — HopRoute Complete Achievement
**Owner:** Avery · **Est:** 30 min

- New achievement: `first_hop_route` (bronze, +100 XP) — "Complete your first HopRoute"
- `route_master` (gold, +250 XP) — "Complete 5 HopRoutes"
- Triggered at route completion in the live mode handler

---

### P0 — Sponsored Stop Infrastructure
**Owner:** Avery + Riley · **Est:** 1 session

**Brewery dashboard:**
- New "Promotions" tab in brewery admin nav
- Simple toggle: "Eligible for HopRoute placement" (maps to `breweries.hopRoute_eligible` column)
- Optional: "Active offer for HopRoute visitors" text field (e.g., "First pint free!")

**Route generation:**
- Sponsored breweries weighted slightly higher in the AI context payload
- Max 1 sponsored stop per route (enforced in `lib/hop-route.ts`)
- `is_sponsored: true` flag in the stop card triggers subtle "Sponsored" badge

**Migration 040 (addition):** `breweries.hop_route_eligible bool`, `breweries.hop_route_offer text`

---

### P1 — HopRoute in Friends Feed
**Owner:** Avery · **Est:** 1 session

When a user completes a HopRoute, post to the Friends feed:
- New feed card type: `HopRouteFeedCard`
- Shows: user avatar, "completed a HopRoute in [City]", list of breweries
- "Clone this route" CTA — starts a new HopRoute with same parameters
- Reaction bar (Cheers + Comments)

---

### P1 — Route History on You Tab
**Owner:** Avery · **Est:** 30 min

Add "Past HopRoutes" section to You tab. Shows last 3 completed routes with a "Re-run" button.

---

### P1 — Brewery Vibe Tags
**Owner:** Quinn · **Est:** 30 min

Migration 041: Add `vibe_tags TEXT[]` to breweries table.
Seed 5–7 vibe tags for all demo breweries (Mountain Ridge: "rooftop", "dog-friendly", "live music" etc.).

---

### P2 — Pre-Sprint 40 Retro Prep
**Owner:** Sage · **Est:** docs only

- Write Sprint 38–40 retro agenda
- Draft `docs/retros/sprint-38-40-retro.md` template
- Compile product metrics snapshot (sessions, users, breweries, achievements unlocked)
- Flag any open P0 bugs from S38–40

---

## Deferred to Sprint 41+
- Real-time route swap (brewery unexpectedly closed)
- Group HopRoute (multiple users join same route)
- Push notification: "You're at [Brewery]. Want to plan your next stops?"
- TestFlight (Apple Developer account still pending)

---

## Key Architectural Changes
- `hop_routes.status` state machine: `draft → active → completed`
- `ActiveHopRouteBanner` — persistent sheet matching ActiveSessionBanner pattern
- `HopRouteFeedCard` at `components/social/HopRouteFeedCard.tsx`
- `FeedItem` union type extended: `hop_route_completed`
- Migration 041: `breweries.hop_route_eligible`, `breweries.hop_route_offer`, `breweries.vibe_tags[]`
- New achievements: `first_hop_route`, `route_master`

---

## Team Notes
- **Taylor:** "Sponsored stops IS the pitch. Give me the dashboard toggle and the 'Sponsored' badge and I can close breweries on that story alone."
- **Drew:** "Vibe tags are how you get a rooftop into the right routes. That data is everything."
- **Jordan:** "The Live Mode should reuse as much of the session/ActiveSessionBanner infrastructure as possible. Don't reinvent the guided-experience wheel."
- **Morgan:** "This is a living document. After Sprint 40, we retro, we celebrate, and we build Sprint 41 together."
