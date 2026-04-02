# Deferred Sprint Options — Backlog

**Owner:** Morgan (PM)
**Convention:** Every sprint kickoff presents 3 options. The 2 unselected options are captured here with full descriptions. These are NOT dead — they're deferred. Joshua or Morgan can pull any of these into a future sprint.

> This is a living document. Updated every sprint kickoff.

---

## Status Legend
- **OPEN** — Available for a future sprint
- **BUILT** — Shipped in a later sprint (noted which)
- **PARTIAL** — Partially addressed (noted which sprint)

---

## Sprint 117 — Selected: The Dashboard (brand analytics + consumer map)

- **Per-Location Billing Add-On** — `$29-49/location` Stripe pricing model. One invoice per brand. *(PARTIAL — Sprint 121 built brand billing with per-location add-ons at $39/location)*
- **Brand-Level Messaging & CRM** — Send messages to customers across all locations, cross-location customer segments. **OPEN**
- **Location Transfer / Merge** — Let brand owners absorb existing brewery listings into their brand. Critical for real multi-location operators claiming unclaimed listings. **OPEN**

---

## Sprint 118 — Selected: The Tap Network (brand tap list management)

*(Drew noted: "The man asked for 3 options and picked the first one. Every time.")*

Options were not fully recorded, but the deferred items from Sprint 117 carried forward:
- **Per-Location Billing** *(see S117 — later PARTIAL in S121)*
- **Shared Beer Catalog** *(BUILT — Sprint 119, The Inventory)*

---

## Sprint 119 — Selected: The Inventory (brand beer catalog)

- **"The Pulse" — Brand Notifications + Activity Feed** — Cross-location activity feed on brand dashboard. Real-time view of what's happening at all locations. Brand-level notifications (new reviews, loyalty milestones, session spikes). "Command center" feel. *(PARTIAL — Sprint 124 built KPI analytics but not the real-time feed)* **OPEN** for real-time feed
- **"The Rollout" — Brand Promotions + Challenges** — Brand-wide promotions and challenges spanning all locations. "Visit 3 of our locations this month." Brand-wide happy hours, cross-location loyalty bonuses. THE revenue feature for Barrel tier upgrades. **OPEN**

---

## Sprint 120 — Selected: The Lens (brand reports + exports)

*(Options not explicitly recorded in kickoff, but retro references Sprint 121 "The Ledger" and Sprint 122 "The Staff Room" as the known next items — suggesting they were the unselected options)*

- **The Ledger — Brand Billing** *(BUILT — Sprint 121)*
- **The Staff Room — Brand Team Management** *(BUILT — Sprint 122, as "The Crew")*

---

## Sprint 121 — Selected: The Ledger (brand billing & subscriptions)

Morgan confirmed "scoped 3 options, plan approved." The deferred options were:

- **The Staff Room / The Crew — Brand Team Management** — Full team management with roles, permissions, activity log. *(BUILT — Sprint 122)*
- **The Consumer Bridge — Cross-Location Consumer Experience** — Cross-location loyalty (earn anywhere/redeem anywhere), brand-level wishlist aggregation, "visit all locations" auto-challenge, consumer brand page upgrade, location-aware "nearest location" with distance. *(PARTIAL — loyalty BUILT in S125, nearest location in S126)* **OPEN** for wishlist aggregation + auto-challenges

---

## Sprint 122 — Selected: The Crew (brand team management)

Joshua "picked it specifically for security."

- **The Loyalty Network — Brand-Level Loyalty** — Unified loyalty programs across all locations. Earn stamps at Location A, redeem at Location B. Brand owners configure one program that propagates. Drew: "This is the one that makes brewery groups switch from paper cards." *(BUILT — Sprint 125, The Passport)*
- **The Megaphone — Brand-Level Promotions & Challenges** — Run challenges and promotions across all brand locations. Cross-location challenges (visit N locations, try beers at different spots). Brand promotion dashboard. Taylor: clear Barrel-tier differentiator. **OPEN**

---

## Sprint 123 — Selected: The Fix (brand hardening / RLS recursion fix)

*(P0 bug forced this sprint — RLS recursion on brand_accounts found by Joshua)*

- **The Rollout — Brand Onboarding & Permissions** — Brand onboarding wizard, regional manager scope enforcement in UI, brand notifications for propagated changes, team activity dashboard improvements. **OPEN**
- **The Pivot — Consumer & Revenue** — Pause brand work, focus on first revenue: PWA/App Store prep (Alex waiting since S8), Taylor's warm intro playbook, brewery claim funnel optimization (7,177 listings, zero claimed beyond test data). **OPEN**

---

## Sprint 124 — Selected: The Pulse (enhanced KPIs & analytics, REQ-069)

- **"The Stage" — Brand Events & Cross-Location Promotions** — Brand-wide event management (tap takeovers, happy hours, beer releases spanning all locations). Event creation at brand level, auto-push to locations, consumer-facing event discovery. Cross-location challenges. Brand event calendar. **OPEN**
- **"The Menu" — Menu Uploads & Gallery (REQ-070)** — Full menu image system (food, cocktails, wine, NA, seasonal, kids, brunch, happy hour — 8 categories, up to 3 images each). `brewery_menus` table, Supabase Storage bucket, Settings UI, consumer gallery. Taylor: "Every brewery I pitch serves food." **OPEN**

---

## Sprint 125 — Selected: The Passport (brand-wide loyalty)

- **"The Stage" — Brand Events** — Multi-location event management. Brand creates event once, shows on all/selected locations. Consumer event discovery with location picker. Event feed cards. Drew: "Tap takeovers, trivia nights, beer releases — they run these across locations ALL the time." **OPEN**
- **"The Menu" — Menu Uploads (REQ-070)** — Non-beer menu uploads: 8 categories, up to 3 images each. New `brewery_menus` table, Supabase Storage, Settings UI, consumer-facing gallery. Taylor: "'Can they see our food menu?' is literally the second question." **OPEN**

---

## Sprint 126 — Selected: The Geo (brand location proximity)

- **"The Transfer" — Cross-Location Customer Tools** — Full customer history across all brand locations. Transfer/merge duplicate profiles. "Regulars at your other locations" insight card. Cross-location customer journey visualization. **BUILT — Sprint 129**
- **"The Polish" — Brand Hardening** — Migration tracking gap fix, brand E2E tests, tier gate audit, slug consistency, brand onboarding wizard, UI integration tests for tier mismatches (the Pint & Pixel bug). **OPEN**

---

## Sprint 128 — Selected: The Menu (menu uploads & food presence, REQ-070)

- **"The Stage" — Brand Events & Cross-Location Experiences** — Multi-location event management (tap takeovers, trivia nights, beer releases). Brand creates event once, pushes to all/selected locations. Consumer event discovery with proximity. Event feed cards. Deferred 3x now (S124, S125, S128) — strong team consensus, Drew keeps asking. **OPEN**
- **"The Megaphone" — Brand-Level Promotions & Challenges** — Cross-location challenges ("Visit 3 Pint & Pixel locations this month"), brand-wide happy hours, cross-location loyalty bonuses. Barrel tier differentiator. Taylor: clear upsell path. Deferred 3x (S119, S122, S128). **OPEN**

---

## Recurring Themes (appeared in multiple sprints)

These ideas keep coming back — they're clearly high-value:

| Theme | Appeared In | Status |
|-------|------------|--------|
| **Brand Events / The Stage** | S124, S125, S128 | **OPEN** — 3x deferred, strong team consensus, Drew keeps asking |
| **Menu Uploads / The Menu (REQ-070)** | S124, S125 | **BUILT — Sprint 128** |
| **Brand Promotions / The Megaphone / The Rollout** | S119, S122, S128 | **OPEN** — 3x deferred, cross-location challenges, Barrel differentiator |
| **Consumer Bridge / Cross-Location Experience** | S121 | **PARTIAL** — loyalty done, wishlist + auto-challenges still open |
| **Brand Onboarding Wizard** | S123, S126 | **OPEN** — keeps getting deferred for higher-priority items |
| **Location Transfer / Merge** | S117 | **OPEN** — critical for real operators claiming listings |
| **App Store / PWA Push** | S123 | **OPEN** — Alex waiting since Sprint 8 |
| **Tier Gate Testing** | S126 | **OPEN** — Joshua's request after the Pint & Pixel bug |

---

## Standing Ideas (Not Yet Sprint Options)

- **Cross-Location Leaderboard** — Gamified comparison across brand locations
- **Brand-Level Wishlist Aggregation** — See wishlisted beers across all locations
- **"Visit All Locations" Auto-Challenge** — Automatically generated brand challenge
- **Real-Time Brand Activity Feed** — Live cross-location dashboard
- **Claim Funnel Optimization** — 7,177 listings, need conversion
