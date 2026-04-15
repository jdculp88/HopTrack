# Sprint 82 Plan — The Full Menu
**PM:** Morgan | **Date:** 2026-03-31
**Arc:** Stick Around (Sprints 79-84) — Retention
**Theme:** Expand what breweries can showcase + polish the consumer journey

---

## Why This Sprint

We just shipped challenges (Sprint 81) and the retention arc is humming. But here's the truth Drew keeps reminding us: **taprooms aren't just beer anymore.** Hard seltzers, cocktails, NA options, wine, cider, food — the modern taproom is a full-service experience. If our tap list only supports beer, we're leaving money on the table and giving brewery owners a reason to keep their Untappd subscription.

Meanwhile, HopRoute's location input is a plain text field with no autocomplete — a friction point that's been on the list since Sprint 74. Quick win, high impact.

And we've got carry-over from Sprint 81 that deserves closure.

---

## Sprint Goals

### Goal 1: Non-Beer Menu Items — Phase 1 (F-011, REQ-070)
**Owner:** Avery (build) · Jordan (architecture review) · Alex (UX) · Drew (validation)
**Effort:** M (this sprint: schema + admin CRUD only)

Extend the tap list to support non-beer items: cider, wine, cocktails, NA beverages, food/snacks. Phase 1 scope is **brewery admin only** — consumers see the items on the brewery detail page and The Board, but we're not touching session/check-in flows yet (that's Phase 2).

**Deliverables:**
1. **Migration 055:** Add `item_type` enum column to `beers` table (values: `beer`, `cider`, `wine`, `cocktail`, `na_beverage`, `food`). Default `beer` for all existing rows. Add optional `category` text column for grouping (e.g., "Appetizers", "Red Wine").
2. **Tap list admin update:** Item type selector when adding/editing. Conditional fields per type:
   - Beer: style, ABV, IBU (existing)
   - Cider/Wine: ABV only, no IBU
   - Cocktail: ingredients text field, ABV optional
   - NA Beverage: no ABV/IBU
   - Food: description only, no ABV/IBU/style
3. **The Board update:** Group items by type with section headers (Beers, Ciders & Wine, Cocktails, NA, Food). Maintain existing cream aesthetic.
4. **Brewery detail page:** Show non-beer items in a separate section below the tap list, or grouped with headers.
5. **Glassware mapping:** Wine glass, cocktail glass, pint glass defaults per type (leverage existing `lib/glassware.ts`).

**What's NOT in this sprint (Phase 2, future):**
- Session check-ins for non-beer items
- XP/achievements for non-beer
- Beer DNA / taste profile impact
- Style-based color system for non-beer types

**Drew's input:** "Every taproom I know has at least a cider and a seltzer on tap. Most have wine and cocktails too. If The Board can't show the full menu, the brewery has to maintain TWO systems. That's a dealbreaker."

---

### Goal 2: HopRoute Location Autocomplete (F-030)
**Owner:** Avery (build) · Alex (UX)
**Effort:** S (1-2 days)

Replace the plain text city input in HopRoute creation with a debounced autocomplete dropdown. Uses Nominatim (OpenStreetMap) search API — no API key needed, free, no cost.

**Deliverables:**
1. Debounced search (300ms) on city input field
2. Dropdown with top 5 results (city, state, country)
3. Loading spinner in dropdown while fetching
4. Click-to-select populates the input and stores lat/lng
5. Keyboard navigation (arrow keys + enter)
6. Mobile-friendly dropdown (full-width, touch targets)

**No schema changes needed.**

---

### Goal 3: Sprint 81 Carry-Over
**Owner:** Various

1. **Challenge milestone feed cards** (Avery + Alex) — Show friend progress milestones (50%, 75%) in the Friends feed tab. New `ChallengeMilestoneFeedCard` component. Encourages competition.
2. **Challenge dedup constraint** (Quinn) — Add unique constraint `(brewery_id, LOWER(name))` on `challenges` table to prevent duplicate challenge names per brewery.
3. **Challenge join integration tests** (Reese) — Test race conditions on `/api/challenges/join` endpoint. Verify double-join prevention, concurrent join handling.

---

## Technical Notes (Jordan)

### Migration 055 Design
```sql
-- Add item_type to beers table
ALTER TABLE beers ADD COLUMN item_type text NOT NULL DEFAULT 'beer'
  CHECK (item_type IN ('beer', 'cider', 'wine', 'cocktail', 'na_beverage', 'food'));
ALTER TABLE beers ADD COLUMN category text;

-- Index for filtering by type
CREATE INDEX idx_beers_item_type ON beers(brewery_id, item_type);
```

**Why `beers` table and not a new table?** The `beers` table is already wired into tap lists, The Board, pour sizes, reviews, and 15+ API routes. Creating a separate `menu_items` table would require duplicating all that infrastructure. Adding `item_type` with sensible defaults means zero breakage — every existing query that filters by style or ABV still works because those columns remain nullable. New item types simply have NULL for beer-specific fields.

**Jordan's take:** "I reviewed the alternative — a separate `menu_items` table — and it's wrong for this codebase. We'd have to duplicate tap list ordering, Board rendering, pour sizes, and the entire admin CRUD. The `beers` table becomes `menu_items` in spirit. The column name stays `beers` for now (renaming is a future cleanup if we want it, but it's cosmetic). This is the pragmatic call."

### Autocomplete Architecture
- Nominatim API: `https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5&addressdetails=1`
- Rate limit: 1 req/sec (Nominatim policy) — debounce handles this
- No API key, no cost, no vendor lock-in
- Fallback: if Nominatim is down, input works as plain text (existing behavior)

---

## Acceptance Criteria

### F-011 Phase 1
- [ ] Brewery admin can add a non-beer item (cider, wine, cocktail, NA, food) to tap list
- [ ] Item type selector shows in tap list add/edit form
- [ ] Conditional fields render based on item type (no IBU for wine, no ABV for food, etc.)
- [ ] The Board displays non-beer items with type section headers
- [ ] Brewery detail page shows non-beer items
- [ ] Existing beer data is unaffected (all default to `item_type = 'beer'`)
- [ ] Glassware defaults appropriate per item type

### F-030
- [ ] City input shows autocomplete dropdown after 2+ characters typed
- [ ] Dropdown shows top 5 location results with city/state/country
- [ ] Selecting a result populates the input and stores coordinates
- [ ] Keyboard navigation works (arrows + enter + escape)
- [ ] Dropdown dismisses on outside click or escape
- [ ] Loading state shown while fetching
- [ ] Falls back to plain text input if Nominatim is unreachable

### Carry-Over
- [ ] Challenge milestone feed cards appear at 50% and 75% friend progress
- [ ] Duplicate challenge names per brewery are prevented at DB level
- [ ] Integration tests cover concurrent challenge join attempts

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Non-beer items breaking existing beer queries | Low | High | `item_type DEFAULT 'beer'` means all existing queries return same results |
| Nominatim rate limiting | Low | Low | Debounce + graceful fallback to plain text |
| Scope creep into Phase 2 (sessions for non-beer) | Medium | Medium | Strict scope: admin + display only, no session/XP changes |

---

## Team Assignments

| Person | Task | Priority |
|--------|------|----------|
| **Avery** | F-011 schema + admin CRUD + Board update | P0 |
| **Avery** | F-030 autocomplete | P1 |
| **Avery** | Challenge milestone feed cards | P1 |
| **Jordan** | Architecture review on F-011 migration | P0 |
| **Alex** | UX for item type selector, Board sections, autocomplete dropdown | P0 |
| **Quinn** | Migration 055, challenge dedup constraint | P0 |
| **Drew** | Validate non-beer item types cover real taproom menus | P0 |
| **Reese** | Challenge join integration tests | P1 |
| **Casey** | Full regression on tap list, Board, brewery detail after F-011 | P0 |
| **Sam** | Acceptance criteria validation | P1 |

---

## Definition of Done

- [ ] Migration 055 applied and tested
- [ ] Non-beer items visible on tap list, Board, and brewery detail
- [ ] HopRoute autocomplete working with Nominatim
- [ ] Sprint 81 carry-over items closed
- [ ] All existing unit tests pass (29 challenge + 39 existing)
- [ ] New tests added for item type validation
- [ ] `npm run build` passes clean
- [ ] Casey signs off on regression

---

*"The Full Menu" — because a taproom is more than beer, and HopTrack should know that.* 🍺🍷🍹

*This is a living document. — Morgan* 🗂️
