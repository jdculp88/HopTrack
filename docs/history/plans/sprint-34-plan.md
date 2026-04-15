# Sprint 34 — Own Your Data

**Theme:** Give breweries the tools that make HopTrack worth $149/mo. The killer counter to Untappd's data-hostage model.
**Status:** Complete
**Date:** 2026-03-30
**Sprint Lead:** Morgan

---

## Context

Research from Sprint 33 confirmed that craft brewery owners have three core frustrations with existing tools:
1. **Untappd for Business** charges $899–$1,199/yr, locks basic features behind paywalls, and owns the customer data
2. **Loyalty programs** fail because businesses can't identify their superfans (top 20% drive 80% of revenue)
3. **Tap list analytics** are nonexistent — breweries make production decisions on gut, not data

Sprint 34 directly attacks all three. Taylor's pitch headline: **"You own your guests."**

---

## Delivered (Session 1)

### S34-001: Customer Data Export ✅
**Owner:** Avery · **Priority:** P0

Add CSV export to the Customers page (`/brewery-admin/[id]/customers`).

**What to build:**
- "Export CSV" button on customers page header
- Server-side query aggregating: display_name, username, visit_count, total_time_minutes, last_visit, favorite_beer, tier (Regular/Power/VIP)
- Streamed CSV download via Response with `Content-Disposition: attachment`
- No new migration needed — all data from existing `sessions` + `beer_logs` tables

**Why it matters:** Breweries need to own their customer list. This is the conversation-starter that closes deals. Untappd can't say "you own your data."

---

### S34-002: Superfans Highlight on Customers Page ✅
**Owner:** Avery · **Priority:** P0

Surface the top 10–20% of visitors by visit frequency on the Customers page.

**What to build:**
- "Your Superfans" section at top of CustomersClient — automatically pulls top 5 visitors
- VIP badge treatment (gold gradient, crown icon)
- Stat callout: "These 5 guests account for X% of your sessions"
- Drew's quote: "I'd give these people a free beer if I knew who they were."

---

### S34-003: Tap List Performance Analytics ✅
**Owner:** Avery · **Priority:** P1

Add a new analytics section: which beers are actually driving engagement.

**What to build:**
- New "Beer Performance" card in analytics dashboard
- Per-beer metrics: check-in count, avg rating (HopTrack community), days on tap, trending direction (↑↓)
- Sort by: most checked-in, highest rated, newest
- Useful for production decisions — "this IPA gets 3x more check-ins than the amber, brew more"

**Migration:** None — pulls from `beer_logs` JOIN `beers`

---

### S34-004: E2E Test Coverage ✅ (Casey's sit-in ends here)
**Owner:** Reese (build) · Casey (sign-off)

Playwright scaffolded since Sprint 31. We need actual passing test coverage before first paid brewery.

**Minimum coverage:**
- `smoke.spec.ts`: home page loads, nav renders, no JS errors
- `core-flows.spec.ts`: login → home feed → explore → brewery page
- `brewery-admin.spec.ts`: brewery admin login → tap list loads → analytics loads
- Auth helpers already exist at `e2e/helpers/auth.ts`

---

## Key Architectural Changes

- `GET /api/brewery/[brewery_id]/customers/export` — CSV download endpoint with auth + brewery admin check
- "Export CSV" button on Customers page header (gold-accented `<a download>`)
- "Your Superfans" section: top 5 visitors by visit count (min 5 visits), gold gradient card, crown badge on #1, "X% of all sessions" callout
- "Beer Performance" section in Analytics: per-beer table with pours, avg rating, days on tap, trending direction (↑↓→), sortable by pours/rating/newest
- `AnalyticsClient` now uses `useState` for beer perf sort toggle
- E2E tests hardened: `smoke.spec.ts` (8 tests — public pages + auth pages + QR landing), `core-flows.spec.ts` (8 tests — feed tabs, explore, friends, profile, notifications, settings, session drawer), `brewery-admin.spec.ts` (8 tests — overview, tap list, analytics, customers, events, loyalty, sessions, billing)
- Zero new migrations — all features use existing `sessions` + `beer_logs` tables
- TypeScript clean: `npx tsc --noEmit` passes with zero errors

---

## Deferred / Carry
- Email/promo to customer segments (Sprint 35)
- Review response from brewery dashboard (Sprint 35)
- Rate limiting on public APIs (Sprint 36)
- TestFlight (still blocked on Apple Developer account)

---

## Team Notes
- **Taylor:** "Customer export closes deals. This is Sprint 34's headline feature."
- **Drew:** "Superfans section — yes. Put it first on the page. Operators want to see faces, not numbers."
- **Jordan:** Tap list analytics should reuse existing analytics query pattern from `analytics/page.tsx`
- **Casey:** I have been waiting for E2E since Sprint 21. Reese, you're up.
