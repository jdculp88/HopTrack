# Arc: "Ship Shape" (Sprints 98-103)
**PM:** Morgan | **Date:** 2026-04-01
**Theme:** Clean house, modernize, prove quality, then push forward
**Mandate from Joshua:** BLs closed, visual polish, code modernized, REQs at 100% parity, QA bulletproof, F-017 scoped, F-019 shipped.

---

## Arc Overview

| Sprint | Name | Theme | Key Deliverables |
|--------|------|-------|-----------------|
| **98** | The Sweep | Data quality + quick fixes | BL-001, BL-003, BL-005, S96 action items, close shipped BLs |
| **99** | The Feature Gap | Missing consumer UX | BL-002 (memorial), BL-006 (event RSVP), BL-009 (mug club consumer), BL-012 (screenshots) |
| **100** | The Polish | Visual consistency | Shared Pill component, Card wrapper, spacing standards, color cleanup, inline style reduction |
| **101** | The Modern | Code quality + a11y | Split monoliths, Suspense boundaries, TypeScript cleanup, accessibility pass |
| **102** | Smart Push | F-019 notifications | Wishlist-on-tap, friend sessions, loyalty nudges, preference controls |
| **103** | The Proof | QA + docs + REQs | 11 missing REQs, 24 API docs, ~100 new tests, critical path coverage, arc retro |

---

## Sprint 98 — The Sweep
**Owner:** Riley (infra) + Avery (wiring)

### Goals
1. **BL-001: Deduplication constraints** — Migration: unique constraint on `(brewery_id, LOWER(name))` for beers, `(LOWER(name), city, state)` for breweries
2. **BL-003: Incomplete beer data handling** — Badge component for suspect data (0.1% ABV, missing fields), "Brewery needs to add details" indicator
3. **BL-005: Menu upload PGRST fix** — Resolve PostgREST schema cache issue with `menu_image_url` column. Try `NOTIFY pgrst, 'reload schema';` or investigate alternative.
4. **S96 action: Wire LoyaltyStampCard** — Import and render on brewery detail page
5. **S96 action: Add decrement_checkins RPC** — Migration for accurate checkin counts after session cancellation
6. **Close shipped BLs** — Mark BL-007, BL-008, BL-010 (Phase 1), BL-011 as SHIPPED in roadmap

### Exit Criteria
- Zero data integrity issues at DB level
- Menu upload save works
- LoyaltyStampCard visible on brewery detail
- Roadmap backlog accurate

---

## Sprint 99 — The Feature Gap
**Owner:** Avery (features) + Alex (design) + Drew (validation)

### Goals
1. **BL-002: Closed brewery memorial mode** — Closed breweries visible with history, marked closed, edits restricted. "Remember what they offered."
2. **BL-006: Event ticketing / RSVP** — RSVP tracking, capacity limits on existing Events system. Consumer can "Going" / "Interested". Brewery sees headcount.
3. **BL-009: Mug club consumer experience** — Mug clubs visible on brewery profiles, member badges on customer lists, club memberships on user profiles
4. **BL-012: Homepage screenshot refresh** — Jamie captures fresh screenshots from current app for `/for-breweries` + landing

### Exit Criteria
- All 7 original BL items closed (BL-001 through BL-012)
- Mug clubs have a complete consumer story
- Events have RSVP functionality
- Marketing pages show current product

---

## Sprint 100 — The Polish
**Owner:** Alex (design system) + Avery (implementation) + Jordan (review)

### Goals
1. **Shared Pill/Badge component** — `components/ui/Pill.tsx` with size variants (xs/sm/md), color variants (gold/muted/style-colored/status), replacing all inline `rounded-full px-2 py-0.5` patterns
2. **Card wrapper component** — `components/ui/Card.tsx` with consistent `rounded-2xl`, standard padding scale, optional header/footer slots
3. **Spacing standards** — Define and document a spacing scale. Audit and standardize gap/padding across:
   - Feed cards
   - Brewery detail sections
   - Profile sections
   - Admin dashboard cards
   - Pill groups (consistent gap-2 between pills)
   - Text-to-pill spacing (consistent gap-1.5 or gap-2)
4. **Hardcoded color cleanup** — Replace remaining hardcoded hex values with CSS vars (except allowed #0F0E0C and #D4A843)
5. **Landing page color consolidation** — Single shared constants file for marketing page colors
6. **Inline style reduction** — Convert static inline styles to Tailwind classes (target: reduce from ~1,360 to under 400)

### Exit Criteria
- Pill component used everywhere (0 inline pill patterns)
- Card wrapper used in new/refactored cards
- Consistent 4px spacing scale documented and applied
- Hardcoded colors reduced to minimum
- Visual consistency across all pages

---

## Sprint 101 — The Modern
**Owner:** Jordan (architecture) + Avery (implementation)

### Goals
1. **Split monolithic components:**
   - TapListClient (1,359 lines) → TapListHeader, TapListGrid, TapListBulkActions, TapListFilters
   - SessionRecapSheet (964 lines) → RecapHeader, RecapBeerList, RecapRatings, RecapShare
   - TapWallSheet (943 lines) → TapWallSearch, TapWallGrid, TapWallActions
   - ClaimBreweryClient (964 lines) → ClaimSteps, ClaimVerification, ClaimConfirmation
   - Target: No component over 400 lines
2. **Suspense boundaries** — Add `<Suspense>` with skeleton fallbacks on all data-heavy pages
3. **TypeScript cleanup** — Reduce `as any` from 30 → under 10 (with `// supabase join shape` comments for unavoidable ones)
4. **Accessibility pass:**
   - Add aria-labels to all interactive elements
   - Replace clickable divs with buttons
   - Add keyboard navigation to star ratings, carousels
   - Ensure focus management in all modals/drawers
5. **useEffect cleanup** — Replace client-side data fetching patterns with server components or React patterns where possible

### Exit Criteria
- No component over 400 lines
- `as any` under 10
- WCAG AA compliance on critical paths
- All interactive elements keyboard-navigable

---

## Sprint 102 — Smart Push (F-019)
**Owner:** Avery (implementation) + Sam (trigger specs) + Drew (validation)

### Goals
1. **Wishlist-on-tap trigger** — When a brewery adds a beer to their tap list that matches any user's wishlist, fire push notification: "Your wishlist beer [X] just tapped at [Brewery Y]!" Check `wishlist` table against `beers` on tap list update.
2. **Friend session trigger** — When a friend starts a session, notify: "Your friend [Z] just started a session at [Brewery]!" Use existing `friends_live` data.
3. **Loyalty nudge trigger** — When user is within 1-2 stamps of a reward: "You're 1 visit away from your loyalty reward at [Brewery]!" Check on session end.
4. **Notification preference controls** — New section in Settings: toggle each trigger type on/off. Migration for `notification_preferences` column or table.
5. **Frequency caps** — Max 3 smart notifications per user per day. Prevent duplicate triggers (same beer/brewery within 24h).

### Exit Criteria
- 3 smart trigger types live
- User can control which triggers they receive
- Frequency caps prevent spam
- Drew validates real-world scenarios

---

## Sprint 103 — The Proof
**Owner:** Sam (REQs) + Casey (QA) + Sage (docs) + Reese (test automation)

### Goals
1. **Sam: Write all missing REQ documents (11 features):**
   - REQ-074: Brewery Challenges (S81)
   - REQ-075: Sponsored Challenges (S91)
   - REQ-076: Brewery CRM (S89)
   - REQ-077: Ad Engine (S93)
   - REQ-078: Digital Mug Clubs (S94)
   - REQ-079: Promotion Hub (S95)
   - REQ-080: Fraud Prevention (S96)
   - REQ-081: Session Drawer Overhaul (S96)
   - REQ-082: Tier Feature Matrix (S96)
   - REQ-083: Public API v1 (S85)
   - REQ-084: Beverage Category Colors (S83)

2. **Sam: Update API-REFERENCE.md** — Add 24 undocumented endpoints:
   - POS Integration (9 endpoints)
   - Ads/Ad Engine (5 endpoints)
   - Mug Clubs (3 endpoints)
   - Redemptions (2 endpoints)
   - Promotions detail (2 endpoints)
   - Wrapped, Cron, Auth (3 endpoints)

3. **Casey + Reese: Critical path tests (~100 new tests):**
   - Session flow end-to-end (15-20 tests)
   - Redemption code flow (12-15 tests)
   - Brewery claim flow (10-12 tests)
   - Feed pagination (10-15 tests)
   - Beer logging + rating (10-15 tests)
   - Fraud prevention (8-10 tests)
   - Rate limiting (8-10 tests)

4. **Roadmap update** — Requirements index at 100% parity, backlog cleared, arc documented

### Exit Criteria
- 100% REQ parity (every shipped feature has a formal document)
- API-REFERENCE.md covers all endpoints
- 700+ total tests (from 615)
- Critical path coverage: session, redemption, claims, feed all tested
- Zero undocumented features

---

## Future Arcs (Post-103)

### Arc 7: "Multi-Location" (Sprints 104-109)
**Theme:** Enable Barrel tier with multi-location brewery support (F-017)
**REQ:** REQ-072 (documented, audited)

| Sprint | Focus |
|--------|-------|
| 104 | Schema + migration: `brewery_brands`, `brand_accounts`, location model |
| 105 | Location management CRUD: add/edit/remove locations, staff assignment |
| 106 | Location switcher UI: brewery admin can toggle between locations |
| 107 | Per-location features: independent tap lists, analytics, loyalty per location |
| 108 | Aggregate dashboards: cross-location analytics, unified customer view |
| 109 | Barrel billing: $149 base + $29-49/location pricing in Stripe, polish + retro |

### Arc 8: "Launch Day" (Sprints 110-115)
**Theme:** Get to first paid brewery, App Store, real users

| Sprint | Focus |
|--------|-------|
| 110 | Launch checklist final burndown (target 100%) |
| 111 | Apple Developer account + TestFlight submission |
| 112 | Sales demo mode + Drew's warm intro package |
| 113 | First brewery onboarding (Asheville target) |
| 114 | Post-launch monitoring, bug fixes, user feedback |
| 115 | First 5 breweries, retention metrics, arc retro |

### Arc 9: "Sticky" (Sprints 116-121)
**Theme:** Retention loops, engagement, prove the flywheel

| Sprint | Focus |
|--------|-------|
| 116 | Smart push v2 (additional trigger types based on data) |
| 117 | Referral system v2 (brewery-to-brewery, consumer viral loops) |
| 118 | Social features enhancement (activity feed richness, reactions v2) |
| 119 | Consumer engagement analytics (DAU/MAU, session frequency, retention curves) |
| 120 | Brewery success metrics (churn indicators, health scores) |
| 121 | Retention review, feature prioritization based on real data, arc retro |

### Arc 10: "Scale" (Sprints 122-127)
**Theme:** Enterprise features, advanced integrations, growth

| Sprint | Focus |
|--------|-------|
| 122-123 | POS Phase 2 — keg tracking (F-014), inventory sync |
| 124 | Advanced CRM — predictive churn, automated win-back campaigns |
| 125 | Performance at scale — query optimization, CDN, edge functions |
| 126 | Enterprise features — SSO, audit logs, SLA monitoring |
| 127 | Scale review, 50-brewery milestone push, arc retro |

---

## October 2026+ (Parked)
These features are explicitly deferred per Joshua's direction:
- F-008: Barcode scanning
- F-013: AI recommendations v2
- F-014: POS keg tracking (moved to Arc 10)
- F-021: Brewery website builder
- F-022: Beer journal / tasting notes
- F-026: Consumer subscription
- F-027: AI beer sommelier

---

*Morgan: "Six sprints, zero excuses. By Sprint 103, every BL is closed, every feature has a REQ, every critical path has tests, and the app looks and feels modern. Then we go get customers."*

*Sage: "I've got the notes. Sprint plans are ready for execution."*
