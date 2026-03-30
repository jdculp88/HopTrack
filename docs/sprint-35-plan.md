# Sprint 35 — The Social Layer

**Theme:** Make HopTrack viral enough that users recruit other users. Deepen the consumer experience.
**Status:** Not started
**Sprint Lead:** Morgan

---

## Context

After Sprint 34 makes the brewery dashboard worth paying for, Sprint 35 makes the consumer experience worth sharing. The gap identified in research: **HopTrack has no viral loop.** Users check in, earn XP, but there's no mechanism that pulls friends in or gets HopTrack into someone's Instagram story.

Sprint 35 fixes that.

---

## Tickets

### P1 — Beer Lists / Collections
**Owner:** Avery · **Est:** 1.5 sessions

Users curate shareable lists: "My Top 10 Stouts", "Asheville Must-Tries", "Beers to Try Before I Die".

**What to build:**
- `beer_lists` table: id, user_id, title, description, is_public, created_at
- `beer_list_items` table: list_id, beer_id, note, position
- Migration 038
- `/profile/[username]/lists` — public list view
- Create/edit list UI in profile → "My Lists" section
- Beer detail page: "Add to list" button
- Share URL generates OG meta tags

**Why it matters:** Jamie: "chef's kiss" — this is the Instagram-able content format for craft beer.

---

### P1 — 9:16 Vertical Share Card
**Owner:** Alex (design) + Avery (build) · **Est:** 1 session

The current horizontal share card is correct but nobody posts horizontal on mobile. Need a 9:16 story format.

**What to build:**
- New `SessionShareCard` variant: `format="story"` — 9:16 aspect ratio
- Layout: HopMark top, session title + brewery + date mid, beer list bottom, cream/gold aesthetic
- `html2canvas` capture same as existing horizontal card
- "Share to Story" button alongside existing "Share" in recap actions

---

### P1 — Session Note on TapWall
**Owner:** Avery · **Est:** half session

Let users add a note to the whole session before they close it: "date night", "bachelor party", "solo Friday".

**What to build:**
- Optional text input in TapWallSheet footer area (collapsed, tap to expand)
- Persists to `sessions.note` (field already exists)
- Shows on feed cards (already rendered in `SessionCard` if note present)

---

### P1 — Tasting Notes Persist
**Owner:** Avery · **Est:** half session

Recap already has textarea for tasting notes on each beer. They need to actually save.

**What to build:**
- PATCH `sessions/[id]/beers/[logId]` already supports `comment` field — just pass `beerNotes[log.id]` on blur or Done button
- Wire `beerNotes` state to PATCH call in `SessionRecapSheet`
- Show tasting note on beer detail page "Activity" section

---

### P2 — Beer Wishlist → Visit Planner
**Owner:** Avery · **Est:** 1 session

**What to build:**
- On Explore page, if user has wishlist beers at a brewery currently on tap: show "X beers on your list here" badge
- Wishlist × tap list intersection query: JOIN `wishlist` ON `beer_id` with `beers` WHERE `brewery_id` matches
- "Plan a visit" CTA on brewery detail page when intersection > 0

---

### P2 — Streak Recovery Grace Period
**Owner:** Avery · **Est:** half session

**What to build:**
- `profiles.streak_grace_used_at` — timestamp of last grace period use
- If user's streak would break AND no grace used in last 30 days: 24hr extension window shown as banner
- Toast on first session after break: "Streak saved! Grace period used."
- Migration 039

---

## Deferred / Carry
- @ mentions in comments (Sprint 36)
- Group sessions (Sprint 36, complex)
- Dark mode recap option (backlog)

---

## Team Notes
- **Jamie:** 9:16 share card is the most important thing in this sprint. Every story posted = free billboard.
- **Alex:** Lists UI should feel like a Pinterest board, not a spreadsheet.
- **Sam:** Wishlist visit planner is the killer engagement loop. User plans visits, visits generate check-ins, check-ins generate brewery revenue.
- **Jordan:** `beer_lists` + `beer_list_items` schema should follow the existing `wishlist` table pattern.
