# Sprint 91 — The Spotlight 🎯
**PM:** Morgan | **Arc:** The Flywheel (Sprint 1 of 6)
**Date:** 2026-04-01

> The Flywheel starts here. Brewery-sponsored challenges that reach beyond a brewery's own followers — the first B2C-to-B2B revenue feature.

---

## Arc Overview: The Flywheel (Sprints 91-96)
| Sprint | Name | Focus |
|--------|------|-------|
| **91** | **The Spotlight** | Sponsored challenges foundation — schema, visibility, discovery |
| 92 | TBD | Sponsored challenge analytics + promotion hub |
| 93 | TBD | Ad engine + feed cards |
| 94 | TBD | Digital mug clubs (F-020) |
| 95-96 | TBD | Multi-location + keg tracking |

**Arc exit criteria (from roadmap research):**
- Brewery-sponsored challenges generating revenue (or ready to)
- Mug club pilot with 3+ breweries
- Multi-location schema ready

---

## What We're Building (Sprint 91)

### The Concept
Today, brewery challenges are only visible to users who visit that brewery's page. **Sponsored challenges** break that wall — they appear in the Discover feed, in Explore, and in nearby challenge discovery, reaching users who haven't visited the brewery yet.

This is the flywheel: breweries PAY to reach new customers → consumers DISCOVER new breweries → more foot traffic → brewery sees ROI → brewery keeps paying.

### What Changes from Sprint 81's Challenge System
| Aspect | Current (Sprint 81) | Sponsored (Sprint 91) |
|--------|---------------------|----------------------|
| Visibility | Only on brewery detail page | Discover feed, Explore, nearby challenges |
| Audience | Users who already visit the brewery | All users within radius |
| Cost | Free (included in all tiers) | Cask/Barrel tier feature (included in subscription) |
| Analytics | Participant count + completions | + impressions, joins from discovery, new visits |
| Creation | Basic form | Enhanced with cover image, featured badge, geo radius |

---

## Sprint 91 Goals

### Goal 1: Sponsored Challenge Schema
**Owner:** Quinn (Infra Engineer) | **Reviewer:** Riley (Infra)

Migration 060: Add sponsored challenge columns to existing `challenges` table.

**New columns on `challenges`:**
- `is_sponsored` boolean NOT NULL DEFAULT false — sponsored visibility flag
- `cover_image_url` text — optional cover image for sponsored card
- `geo_radius_km` integer DEFAULT 50 — discovery radius in km from brewery
- `impressions` integer NOT NULL DEFAULT 0 — track how many times shown in discovery
- `joins_from_discovery` integer NOT NULL DEFAULT 0 — users who joined from Discover/Explore (not brewery page)

**New RLS:**
- Sponsored challenges: anyone can read (even across breweries) when `is_sponsored = true AND is_active = true`
- Non-sponsored: existing brewery-page-only visibility (no change)

**New index:**
- `challenges_sponsored_active_idx` on `(is_sponsored, is_active)` WHERE both true

### Goal 2: Sponsored Challenge Creation UI
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

Upgrade the existing ChallengesClient in brewery admin:

1. **"Make it Sponsored" toggle** — appears after basic challenge form is filled. Only available for Cask/Barrel tier breweries. Tap tier sees locked state with upgrade CTA.
2. **Cover image upload** — optional, uses existing ImageUpload component. Stored in brewery-covers bucket. Shown in Discover feed card.
3. **Geo radius selector** — dropdown: 10km, 25km, 50km (default), 100km. How far from the brewery the challenge appears.
4. **Preview card** — shows how the sponsored challenge will look in the Discover feed before publishing.

**UI notes (Alex):**
- Sponsored section slides in with AnimatePresence when toggle is on
- Cover image preview with gold "SPONSORED" badge overlay
- Radius shown on a small static map illustration (decorative, not interactive)

### Goal 3: Sponsored Challenge Discovery
**Owner:** Avery (Dev Lead) | **Reviewer:** Jordan (Architecture)

Three new ways users discover sponsored challenges:

1. **Discover tab — "Challenges Near You" section** — New section in DiscoverTabContent. Fetches active sponsored challenges within user's approximate location. Shows horizontally scrollable cards with cover image, brewery name, challenge name, progress (if joined), participant count. Tapping opens the brewery detail page with challenge section scrolled into view.

2. **Explore page — Challenge filter pill** — Add "Challenges" filter pill to Explore page. When active, shows breweries that have active sponsored challenges. Challenge badge on brewery card.

3. **API: `GET /api/challenges/nearby`** — New endpoint. Takes `lat`, `lng`, optional `radius_km` (default 50). Returns active sponsored challenges within radius, ordered by distance. Uses Supabase `breweries.latitude/longitude` for geo math. Rate limited (20/min). If no location provided, returns top sponsored challenges by participant count (fallback).

### Goal 4: Sponsored Challenge Analytics
**Owner:** Avery (Dev Lead)

Track the effectiveness of sponsored challenges:

1. **Impression tracking** — When a sponsored challenge card renders in Discover/Explore, fire a lightweight `POST /api/challenges/[id]/impression` (debounced, batched client-side per page load). Increments `impressions` counter.

2. **Discovery source tracking** — When a user joins a challenge, pass `source: "discovery" | "brewery_page"` to the join API. If `source === "discovery"`, increment `joins_from_discovery`.

3. **Challenge analytics in admin** — On the Challenges page, sponsored challenges show additional stats: impressions, joins from discovery, conversion rate (joins/impressions). Simple inline stats, no new page needed.

---

## What's NOT in Sprint 91
- No payment/billing for sponsored challenges (included in Cask/Barrel tier for now)
- No feed ad cards (that's Sprint 93)
- No promotion hub (that's Sprint 92-93)
- No budget/spend system (future — when we decouple from subscription tiers)
- No push notifications for nearby challenges (future enhancement)

---

## Team Assignments
| Who | What |
|-----|------|
| **Quinn** | Migration 060, RLS, indexes |
| **Avery** | All 4 goals — UI + API + analytics |
| **Jordan** | Architecture review, code quality |
| **Alex** | Sponsored card design direction, cover image treatment |
| **Casey** | QA — sponsored challenge flow end-to-end |
| **Reese** | Vitest tests for nearby API, impression tracking, source tracking |
| **Sam** | Validate geo radius UX, acceptance criteria |
| **Drew** | Validate brewery owner experience — "would you use this?" |
| **Taylor** | Validate revenue angle — how does this sell Cask/Barrel? |
| **Morgan** | Coordination, sprint plan, retro |
| **Sage** | Sprint notes, documentation |

---

## Test Plan
- [ ] `npm run build` passes clean
- [ ] New migration applies without errors
- [ ] Existing challenge CRUD still works (regression)
- [ ] Sponsored toggle only available for Cask/Barrel tiers
- [ ] Cover image uploads and displays correctly
- [ ] Geo radius selector persists value
- [ ] `/api/challenges/nearby` returns challenges within radius
- [ ] `/api/challenges/nearby` fallback works without location
- [ ] Discover tab shows "Challenges Near You" section
- [ ] Explore page "Challenges" filter pill works
- [ ] Impression tracking fires and increments
- [ ] Join source tracking distinguishes discovery vs. brewery page
- [ ] Sponsored challenge analytics display in admin
- [ ] Existing Vitest tests pass (`npm run test`)
- [ ] New tests for nearby API, impression, source tracking

---

## Dependencies
- Existing `challenges` + `challenge_participants` tables (Migration 054, Sprint 81)
- Existing `brewery-covers` storage bucket (Migration 056, Sprint 84)
- Existing `ImageUpload` component
- Brewery `latitude`/`longitude` columns (Migration 048, Sprint 78 — 5,513 breweries with GPS)

---

## Success Metrics (Taylor's lens)
- A brewery owner can create a sponsored challenge in < 3 minutes
- Sponsored challenges appear to users who haven't visited that brewery
- At least one clear conversion path: see challenge → join → visit brewery
- The feature feels like a natural Cask/Barrel tier value-add, not a bolt-on

---

*This is a living document.* 🍺
