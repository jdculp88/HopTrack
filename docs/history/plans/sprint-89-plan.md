# Sprint 89 — The Rolodex 📇
**PM:** Morgan | **Date:** 2026-04-01
**Arc:** Open the Pipes (Sprint 5 of 6)
**Theme:** Know your customers — brewery CRM & intelligence

---

## Why This Sprint

The #1 pain point from brewery owner research: "I have no idea who my regulars are." HopTrack already has all the data — sessions, loyalty cards, beer logs, follows — we just need to surface it in a way that's actionable. This is the feature that makes Cask tier indispensable.

Secondary goal: barcode scanning has been on the consumer wishlist since the roadmap research. Scan a can, check it in. Simple.

---

## Goals

### Goal 1: Customer Profiles (F-018 Phase 1)
**Owner:** Avery (build) · Alex (design) · Sam (requirements)

Individual customer detail page at `/brewery-admin/[id]/customers/[user_id]`. Shows:
- Visit timeline (last 20 sessions with beers logged)
- Loyalty status (stamps earned, rewards redeemed)
- Taste profile (top 3 styles from their beer logs at this brewery)
- Engagement stats: total visits, beers logged, avg rating, first visit, last visit
- Engagement score (0-100, computed from recency + frequency + loyalty)
- Segment badge (VIP / Power / Regular / New)

Data source: existing `sessions`, `beer_logs`, `loyalty_cards`, `profiles` tables. No new migration needed.

### Goal 2: Customer Segments
**Owner:** Avery (build) · Jordan (architecture review)

Auto-computed segments based on visit count at this brewery:
- **VIP** (gold) — 10+ visits
- **Power** (purple) — 5-9 visits
- **Regular** (blue) — 2-4 visits
- **New** (green) — 1 visit

Implementation:
- `lib/crm.ts` — `computeSegment()`, `computeEngagementScore()`, `getCustomerProfile()`, segment constants
- Customers page: segment count cards at top, filter pills (All / VIP / Power / Regular / New), segment badge on each row
- Customer rows become clickable → navigate to profile page

### Goal 3: Segmented Messaging
**Owner:** Avery (build) · Drew (validation)

Upgrade Messages page to support segment targeting:
- Segment picker dropdown when composing (All / VIP / Power / Regular / New)
- Recipient count preview ("Will send to 12 VIP customers")
- Messages API updated to filter by segment before sending
- Push notification delivery (already wired from Sprint 74)

No email campaigns yet — push + in-app notifications only.

### Goal 4: Barcode Scanning (F-008 Pilot)
**Owner:** Avery (build) · Casey + Reese (testing) · Jordan (lib choice)

Camera-based beer lookup in the consumer session flow:
- Scan button in the beer search/picker UI
- Opens device camera, reads UPC/EAN barcode
- Looks up barcode against our beer database
- Pre-fills beer picker on match, graceful "not found" on miss
- Library: `@AztecProtocol/barcode-detector` or native BarcodeDetector API with polyfill
- New column on `beers` table: `barcode` (text, nullable) — **migration 059**
- API endpoint: `GET /api/beers/barcode/[code]` for lookup

This is pilot scope — works when we have barcode data, graceful fallback when we don't. Barcode data population is a future sprint (Barback crawler or manual entry).

---

## What We're NOT Doing
- No custom segment builder (auto-segments first)
- No email campaigns (push + in-app only)
- No multi-location (Sprint 90+)
- No spending/revenue data (we don't track $$ yet)
- No export/CSV of customer data (future)

---

## Technical Notes

### No Migration Needed (Goals 1-3)
CRM is computed from existing data. All segment logic is application-layer.

### Migration 059 (Goal 4 only)
```sql
ALTER TABLE beers ADD COLUMN IF NOT EXISTS barcode text;
CREATE INDEX IF NOT EXISTS idx_beers_barcode ON beers (barcode) WHERE barcode IS NOT NULL;
```

### New Files
- `lib/crm.ts` — segment logic, engagement scoring, customer profile builder
- `app/(brewery-admin)/brewery-admin/[brewery_id]/customers/[user_id]/page.tsx` — customer profile server page
- `app/(brewery-admin)/brewery-admin/[brewery_id]/customers/[user_id]/CustomerProfileClient.tsx` — profile UI
- `components/session/BarcodeScanner.tsx` — camera barcode reader component
- `app/api/beers/barcode/[code]/route.ts` — barcode lookup endpoint
- `lib/__tests__/crm.test.ts` — segment + scoring tests
- `supabase/migrations/059_beer_barcode.sql` — barcode column

### Modified Files
- `app/(brewery-admin)/brewery-admin/[brewery_id]/customers/` — segment pills, clickable rows, segment counts
- `app/(brewery-admin)/brewery-admin/[brewery_id]/messages/` — segment picker in compose UI
- `app/api/brewery/[brewery_id]/messages/route.ts` — segment filter on send
- `types/database.ts` — barcode field on Beer interface

---

## Team Assignments

| Who | What |
|-----|------|
| **Sam** 📊 | Write REQ-063 (CRM segments, scoring, privacy) |
| **Alex** 🎨 | Customer profile page design, segment badges |
| **Jordan** 🏛️ | Architecture review: scoring model, barcode lib |
| **Avery** 💻 | Build all 4 goals |
| **Casey** 🔍 | QA: segment accuracy, edge cases, barcode scanning |
| **Reese** 🧪 | Vitest coverage for CRM logic |
| **Drew** 🍻 | Validate: "Does this help on a Friday night?" |
| **Riley + Quinn** ⚙️ | Migration 059, query performance review |
| **Taylor** 💰 | Sales angle: CRM as Cask tier differentiator |
| **Jamie** 🎨 | Brand alignment on segment colors/badges |

---

## Definition of Done
- [ ] Customer profile page loads with real data
- [ ] Segment badges show on Customers list
- [ ] Segment filter pills work correctly
- [ ] Messages can target a specific segment
- [ ] Barcode scanner opens camera and reads codes
- [ ] Barcode lookup returns matched beer or "not found"
- [ ] `lib/__tests__/crm.test.ts` passes (15+ tests)
- [ ] Drew says it would actually help
- [ ] No new P0 bugs introduced
