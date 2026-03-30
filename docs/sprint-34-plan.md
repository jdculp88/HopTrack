# Sprint 34 — Own Your Data

**Theme:** Give breweries the tools that make HopTrack worth $149/mo. The killer counter to Untappd's data-hostage model.
**Status:** Not started
**Sprint Lead:** Morgan

---

## Context

Research from Sprint 33 confirmed that craft brewery owners have three core frustrations with existing tools:
1. **Untappd for Business** charges $899–$1,199/yr, locks basic features behind paywalls, and owns the customer data
2. **Loyalty programs** fail because businesses can't identify their superfans (top 20% drive 80% of revenue)
3. **Tap list analytics** are nonexistent — breweries make production decisions on gut, not data

Sprint 34 directly attacks all three. Taylor's pitch headline: **"You own your guests."**

---

## Tickets

### P0 — Customer Data Export
**Owner:** Avery · **Est:** 1 session

Add CSV export to the Customers page (`/brewery-admin/[id]/customers`).

**What to build:**
- "Export CSV" button on customers page header
- Server-side query aggregating: display_name, username, visit_count, total_time_minutes, last_visit, favorite_beer, tier (Regular/Power/VIP)
- Streamed CSV download via Response with `Content-Disposition: attachment`
- No new migration needed — all data from existing `sessions` + `beer_logs` tables

**Why it matters:** Breweries need to own their customer list. This is the conversation-starter that closes deals. Untappd can't say "you own your data."

---

### P0 — Superfans Highlight on Customers Page
**Owner:** Avery · **Est:** half session

Surface the top 10–20% of visitors by visit frequency on the Customers page.

**What to build:**
- "Your Superfans" section at top of CustomersClient — automatically pulls top 5 visitors
- VIP badge treatment (gold gradient, crown icon)
- Stat callout: "These 5 guests account for X% of your sessions"
- Drew's quote: "I'd give these people a free beer if I knew who they were."

---

### P1 — Tap List Performance Analytics
**Owner:** Avery · **Est:** 1 session

Add a new analytics section: which beers are actually driving engagement.

**What to build:**
- New "Beer Performance" card in analytics dashboard
- Per-beer metrics: check-in count, avg rating (HopTrack community), days on tap, trending direction (↑↓)
- Sort by: most checked-in, highest rated, newest
- Useful for production decisions — "this IPA gets 3x more check-ins than the amber, brew more"

**Migration:** None — pulls from `beer_logs` JOIN `beers`

---

### P0 — E2E Test Coverage (Casey's sit-in ends here)
**Owner:** Reese (build) · Casey (sign-off) · **Est:** 1 session

Playwright scaffolded since Sprint 31. We need actual passing test coverage before first paid brewery.

**Minimum coverage:**
- `smoke.spec.ts`: home page loads, nav renders, no JS errors
- `core-flows.spec.ts`: login → home feed → explore → brewery page
- `brewery-admin.spec.ts`: brewery admin login → tap list loads → analytics loads
- Auth helpers already exist at `e2e/helpers/auth.ts`

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
