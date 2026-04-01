# Sprint 95 — The Hub
**Arc:** The Flywheel (Sprint 5 of 6)
**Theme:** Unified promotion management — one dashboard to rule them all
**PM:** Morgan | **Arch:** Jordan | **Dev:** Avery | **QA:** Casey + Reese | **Design:** Alex

---

## Sprint Goals

### Goal 1: Promotion Hub Dashboard (F-029)
**Owner:** Avery (dev) + Jordan (review) + Alex (design)
**Size:** L

Repurpose the existing `/promotions` page into a unified command center for all three promotional tools (Ad Campaigns, Sponsored Challenges, Mug Clubs). Individual tool pages remain as-is — the hub is the overview.

**What the hub shows:**
1. **Unified KPI Summary** (4-card grid) — Active Promotions, Total Impressions, Total Engagement, Estimated Reach
2. **Per-Tool Quick Cards** (3-card grid) — each shows active count, key metric, and link to detail page. Locked cards for non-eligible tiers show upgrade CTA.
3. **Recent Activity Feed** — last 10 events across all tools
4. **Quick Create Actions** — buttons to create new ad, challenge, or mug club
5. **HopRoute Status** — small card showing eligibility + link to Settings

**Tier gating:**
- Free/Tap: Hub visible with standard challenges; Ads + Mug Clubs show lock + upsell
- Cask/Barrel: Full access

**Files:**
- NEW: `app/(brewery-admin)/.../promotions/PromotionHubClient.tsx`
- NEW: `app/api/brewery/[brewery_id]/promotions/summary/route.ts`
- MODIFY: `app/(brewery-admin)/.../promotions/page.tsx` (server component rewrite)
- MODIFY: `app/(brewery-admin)/.../promotions/loading.tsx` (skeleton update)
- MODIFY: `components/brewery-admin/BreweryAdminNav.tsx` (label/icon)

### Goal 2: HopRoute Config Relocation
**Owner:** Avery
**Size:** S

Move vibe tags + HopRoute eligibility toggle from old `/promotions` page to Settings page as a collapsible "HopRoute & Discovery" section. Same API endpoint, new home.

**Files:**
- MODIFY: `app/(brewery-admin)/.../settings/BrewerySettingsClient.tsx`
- MODIFY: `app/(brewery-admin)/.../settings/page.tsx`

### Goal 3: Empty State Coaching Cards
**Owner:** Alex + Avery
**Size:** S

When a brewery has zero promotions across all tools, show coaching cards explaining each tool with a CTA. Improves activation for Cask/Barrel breweries.

### Goal 4: Backlog Capture
**Owner:** Sage
**Size:** XS

Add BL-006 (Event Ticketing / RSVP) to roadmap backlog.

### Goal 5: Unit Tests
**Owner:** Reese
**Size:** M

~10-15 Vitest tests for promotion hub summary logic, tier gating, and activity feed mapping.

**File:** `lib/__tests__/promotions.test.ts`

---

## No New Migration

All data lives in existing tables: `brewery_ads`, `challenges`, `mug_clubs`, `mug_club_members`.

---

## Acceptance Criteria

- [ ] `/promotions` shows unified hub with KPI cards, tool cards, activity feed
- [ ] Free/Tap tier sees lock overlays on Ads + Mug Clubs cards
- [ ] Cask/Barrel tier sees full access to all sections
- [ ] Quick create buttons link to respective tool pages
- [ ] Vibe tags + HopRoute config accessible from Settings page
- [ ] Empty state coaching cards shown when zero promotions exist
- [ ] BL-006 added to roadmap backlog
- [ ] `npm run test` passes with new tests
- [ ] `npm run build` passes clean
