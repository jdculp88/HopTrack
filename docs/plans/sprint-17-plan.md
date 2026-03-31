# Sprint 17 — Polish & Prove It

**Theme:** Fix what's broken, make it beautiful, get it demo-ready
**PM:** Morgan | **Dev Lead:** Jordan | **Sprint:** 17
**Date:** 2026-03-27
**Approach:** This sprint is about quality, not quantity. We have a product. Now we make it something we're proud to put in front of a real brewery owner — and Apple's review team.

---

## Sprint Goals

1. **Zero P0 bugs at close** — BUG-004 (children's photos in seed data) must be gone before this sprint ends
2. **Profile page is beautiful** — all 6 profile bugs resolved, passes Alex's taste test
3. **Navigation is intentional** — "Check In" renamed, nav structure reviewed by Alex + Morgan + Sam
4. **Brewery page is the Chalk Board** — redesigned consumer brewery page that actually sells the product
5. **Demo data is real** — TD-002 seeded, charts show data, loyalty cards show stamps, friends exist
6. **Taylor is ready to pitch** — warm intro conversations started, deck outline reviewed

---

## P0 — Must Ship (Sprint Blockers)

| ID | Title | Owner | Files | Priority |
|----|-------|-------|-------|----------|
| S17-001 | Replace all seed/test avatars — remove children's photos | Riley + Jamie | All seed SQL files, `scripts/supabase-setup.mjs` | **P0 — App Store blocker** |

### S17-001 — Seed Avatar Replacement
**Why P0:** Apple will reject apps with photos of children in drinking-context content. This must be fixed before any TestFlight submission or external demo.

**Action:**
- Audit all seed SQL files (`supabase/migrations/001_*.sql` through `008_*.sql`) for hardcoded avatar URLs
- Replace ALL avatar URLs with DiceBear generated avatars or royalty-free adult stock
  - DiceBear: `https://api.dicebear.com/7.x/avataaars/svg?seed=[username]`
  - Or UIAvatars: `https://ui-avatars.com/api/?name=[name]&background=D4A843&color=0F0E0C`
- Confirm no children's photos remain anywhere in the codebase (grep for old URLs)
- Also covers TD-001

**Done when:** Riley + Jamie have audited and replaced every seed avatar URL. Jordan does a fresh seed and screenshots all profiles. No children in any image.

---

## P1 — Profile Page Bugs

| ID | Bug | Owner | Files |
|----|-----|-------|-------|
| S17-002 | BUG-001: Avatar renders square in circular frame | Jordan | Profile page avatar component, `FriendButton` area |
| S17-003 | BUG-002: Profile hero image full-bleed, no padding/radius | Alex + Jordan | `app/(app)/profile/[username]/page.tsx` |
| S17-004 | BUG-003: Profile name typography off-brand | Alex | `app/(app)/profile/[username]/page.tsx` — hero/name section |
| S17-005 | BUG-005: Beer Passport shows 0 despite real data | Jordan | `app/(app)/profile/[username]/passport/page.tsx` |
| S17-006 | BUG-006: No "Add Friend" button on other users' profiles | Jordan | `app/(app)/profile/[username]/page.tsx`, `components/social/FriendButton.tsx` |
| S17-007 | BUG-007: No friends management page | Jordan + Sam | `app/(app)/friends/page.tsx`, `app/api/friends/route.ts` |

### S17-002 — Avatar Fix
**Fix:** `<Image>` inside avatar container needs `rounded-full` + `object-cover`. Wrapper needs `overflow-hidden`. The border-radius must clip content, not just decorate the border.
```tsx
<div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-[var(--accent-gold)]">
  <Image src={avatar_url} fill className="object-cover rounded-full" alt={display_name} />
</div>
```

### S17-003 — Profile Hero Padding
**Fix:** Add breathing room and border radius to the hero/cover image. Match the card-based design language.
- `mx-4 mt-4 rounded-2xl overflow-hidden` on the hero section wrapper
- Or `rounded-b-3xl` on the top image if it should bleed to top edge

### S17-004 — Profile Name Typography
**Fix:** Name overlay on cover image should use `font-display font-bold` with `drop-shadow-lg` and a background scrim.
- Target treatment: `text-4xl sm:text-5xl font-bold text-white drop-shadow-lg font-display`
- Consider: dark gradient scrim behind name + stats block so text is always readable
- Reference: brewery hero treatment (whatever Jordan already built there)

### S17-005 — Beer Passport Empty
**Root cause:** Query likely uses `auth.getUser()` (current user) instead of profile's `user_id` from URL params.
**Fix:** In `passport/page.tsx`, derive user_id from the profile username param, not from auth session.
```ts
// Wrong:
const { data: { user } } = await supabase.auth.getUser()
// Right:
const { data: profile } = await supabase.from('profiles').select('id').eq('username', params.username).single()
// Then use profile.id for beer_logs query
```

### S17-006 — Add Friend Button Missing
**Root cause:** `FriendButton` either not imported, not receiving correct props, or `currentUserId !== profileUserId` check is wrong.
**Fix:** Verify `FriendButton` is rendered in profile page for non-self users. Check:
1. Is `FriendButton` imported?
2. Is `currentUserId` passed correctly (from `auth.getUser()` server-side)?
3. Is the `currentUserId !== profileUserId` condition correct?
4. Is it possible both are `undefined` and the check passes incorrectly?

### S17-007 — Friends Management Page
**Current state:** Friends page exists but may only show a list without management actions.
**Required:**
1. **Pending incoming** → Accept / Decline buttons (optimistic, AnimatePresence)
2. **Existing friends** → Unfriend option with inline AnimatePresence confirmation (`"Are you sure? [Cancel] [Unfriend]"`)
3. **Outgoing pending** → Cancel request option
4. **Sections:** "Requests (X)" / "Friends (X)" / "Sent"

---

## P1 — Navigation & Shell

| ID | Bug | Owner | Files |
|----|-----|-------|-------|
| S17-008 | BUG-008: "Check In" nav button wrong copy + flow | Jordan + Alex | `app/(app)/AppShell.tsx` or nav component |
| S17-009 | BUG-009: Nav needs full brand/UX review | Alex + Morgan + Sam | `app/(app)/AppShell.tsx`, nav components |

### S17-008 — Nav Button Rename
**Fix:**
- Rename "Check In" → "Start Session" (or "New Visit" — Morgan decides)
- Verify the action it triggers is the session-start flow (not a deprecated checkin modal)
- Update icon if needed (Morgan + Alex decide: CirclePlus, Beer, Zap?)
- Morgan: **confirm copy before Jordan ships** — `"Start Session"` preferred unless overridden

### S17-009 — Nav Brand/UX Review
**This is a design + IA task, not a build task this sprint.**
Alex, Morgan, and Sam each review and submit their notes. Output: a written proposal (doc or quick Figma) before build starts.

**Review checklist:**
- [ ] Every nav item earning its spot?
- [ ] Icons on-brand and consistent? (dark/gold system)
- [ ] Visual treatment — does it feel like HopTrack?
- [ ] Mobile bottom nav vs. desktop sidebar — correct pattern?
- [ ] Should "The Board" have a shortcut for brewery admins? (Drew input needed)
- [ ] Is the hierarchy right with Events + Passport + Sessions all live now?

**Output:** `docs/nav-review-s17.md` or inline in the sprint retro

---

## P1 — The Board Redesign ("Live Chalk Board")

| ID | Title | Owner | Files |
|----|-------|-------|-------|
| S17-010 | The Board TV display redesign — chalk board aesthetic | Jordan + Alex | `app/(brewery-admin)/brewery-admin/[brewery_id]/board/BoardClient.tsx` |

### S17-010 — The Board: Chalk Board Redesign ⭐ HERO FEATURE

**Concept:** The Board is our #1 sales demo feature — it goes on the TV behind the bar. Right now it works but it doesn't *feel* right. It should look like a **real chalk board**: dark background, hand-drawn-esque typography, chalky texture, the kind of thing that makes Drew say "I felt that" and Taylor close a brewery on the spot.

This is primarily a **design pass** on the existing `BoardClient.tsx`. The realtime subscription, auto-scroll, and configurable options all shipped in S16. This sprint we make it beautiful.

**Current state:** Dark background, large text, gold accents, Playfair Display. Functional. Not yet memorable.

**Target state:** Unmistakably a chalk board. When a brewery owner sees this on their TV they should think "that looks like *my* bar."

**Design direction:**

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│   🍺  MOUNTAIN RIDGE BREWING                         │  ← brewery name, Playfair, large, white
│   ─────────────────────────────────────────          │  ← chalk-style divider (border-dashed or SVG)
│                                                      │
│   ON TAP                                             │  ← section header, uppercase, letter-spaced
│                                                      │
│   Hazy Daze IPA .................. 6.8%  $7          │  ← dotted leader line between name and ABV/price
│   New England IPA · Juicy, tropical citrus           │
│                                                      │
│   ★ BEER OF THE WEEK                                 │  ← gold star, highlighted row
│   Founder's Reserve Stout ........ 9.2%  $9          │
│   Imperial Stout · Chocolate, bourbon, vanilla       │
│                                                      │
│   Wheat Street Wit ............... 4.5%  $6          │
│   Belgian Witbier · Coriander, orange peel           │
│                                                      │
│   Lager Days ..................... 4.2%  $5           │
│                                                      │
│   ~~Summit Pale Ale~~  [86'd]                        │  ← strikethrough + 86'd marker, muted
│                                                      │
│   ─────────────────────────────────────────          │
│   📅  Trivia Night — Thursday 7pm                    │  ← upcoming events if any
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Visual treatment:**
- **Background:** Keep `#0F0E0C` (near-black). Optionally add a very subtle noise/grain texture via CSS (`background-image: url("data:image/svg+xml,...")`) to suggest chalk board texture — Alex to decide
- **Beer names:** `font-display` (Playfair Display), `text-2xl` to `text-4xl` depending on font size setting. White.
- **Dotted leader lines:** Between beer name and ABV/price — `border-b border-dotted border-white/20` or CSS `::after` dots. Classic chalk board menu look.
- **Style + description:** Below the beer name, smaller, `text-white/60`. One line max.
- **ABV + Price:** Right-aligned. ABV in `text-white/80`, price in gold if present.
- **Beer of the Week:** Full-width highlighted row with subtle gold background tint (`bg-[var(--accent-gold)]/10`) + `★` prefix in gold. Stands out from the rest.
- **86'd beers:** `line-through` on the name + `text-white/30` + small `[86'd]` chip in red/muted. Authentic — real chalk boards cross things out.
- **Section header:** `ON TAP` in all-caps, letter-spaced, `text-white/50` — like chalk writing that's slightly faded
- **Events row:** If upcoming events exist, show at the bottom in a subtle bar — same chalk-board style, event name + date
- **Brewery name/logo:** Top of the board. Large. `font-display`. The brewery's identity.

**Price field:** The Board should show price if available. This requires migration 022:
```sql
ALTER TABLE beers ADD COLUMN IF NOT EXISTS price_per_pint decimal(5,2);
```
And a price input in the brewery admin tap list. Jordan: add to `TapListClient.tsx` — optional field, shows on The Board only if set. Drew: confirm this is something brewery owners want (they should).

**Configurable options (already exist, just update styling):**
- Font size: M/L/XL — affects `text-2xl` / `text-3xl` / `text-4xl` on beer names
- Show/hide ABV — already in config
- Show/hide description — already in config
- Add: Show/hide price — new toggle

**Files to touch:**
- `app/(brewery-admin)/brewery-admin/[brewery_id]/board/BoardClient.tsx` — visual redesign
- `app/(brewery-admin)/brewery-admin/[brewery_id]/tap-list/TapListClient.tsx` — add price input field
- `supabase/migrations/022_beer_price.sql` — add `price_per_pint` column

**Done when:** Alex + Drew both sign off. Taylor says "I'm showing this in every demo." Jordan hasn't had to take a walk. 🍺

---

## P1 — Test Data

| ID | Title | Owner | Files |
|----|-------|-------|-------|
| S17-011 | TD-002: Full demo-ready test data suite | Riley + Jordan | `supabase/migrations/seed_demo_data.sql` or `scripts/seed-demo.ts` |

### S17-011 — Demo Data Seed

**What we need (from the bug log):**
- 3–5 realistic brewery profiles with cover images (adult stock, not children)
- 10–20 beers per brewery with varied styles, ABVs, ratings, descriptions
- 5–10 consumer profiles with adult avatars, session history, achievements
- Active loyalty cards with varying stamp counts (some at 9/10 = "Ready to redeem!")
- A few upcoming events on each brewery (tap takeovers, trivia nights)
- Realistic session history (30–60 days back) so analytics charts show real data
- Friend connections between test users
- Session comments on recent sessions
- Mix of ratings (3.0–5.0) so analytics have meaningful data
- Session comments and reactions on some sessions

**Output:** `supabase/migrations/seed_demo_data.sql`
**Must:** Use only adult DiceBear avatars and placeholder cover images (e.g., `https://picsum.photos/seed/[brewery]/1200/400`)

**Riley note:** After applying, verify charts show data in the analytics dashboard. Run through the loyalty dashboard — stamp cards should show progress bars. The Board should show beers on tap.

---

## P2 — Stretch (May Slip to Sprint 18)

| ID | Title | Owner | Notes |
|----|-------|-------|-------|
| S17-012 | Casey: Playwright E2E test suite — P1 flows | Casey | Auth, session start, tap list, loyalty stamp |
| S17-013 | Alex/Sam/Casey: Deliver audit docs | Alex, Sam, Casey | Design audit, BA audit, QA regression doc |
| S17-014 | TestFlight submission | Alex + Joshua | Needs Apple Developer account confirmed |
| S17-015 | Fix `BreweryWithStats` TypeScript type | Jordan | Remove `as any[]` hack in ExploreClient, add `has_upcoming_events` to type |
| S17-016 | Confirm `loyalty_redemptions` schema | Riley + Sam | Verify FK join in loyalty page server query |

---

## Taylor — Sales Sprint Goals (Not a Build Sprint)

Taylor doesn't build this sprint. Taylor ships the **readiness** for when Joshua says go.

| ID | Task | Owner | Output |
|----|------|-------|--------|
| T17-001 | Drew: Fill in Wave 1 brewery names (3 warm intros) | Drew + Taylor | Updated `docs/sales/target-breweries.md` |
| T17-002 | Taylor: Research Wave 2 brewery names (Denver, Portland, Burlington) | Taylor | Updated `docs/sales/target-breweries.md` |
| T17-003 | Taylor: Review pitch deck outline + flag any gaps | Taylor | Notes on `docs/sales/pitch-deck-outline.md` |
| T17-004 | Taylor: Confirm `taylor@hoptrack.beer` email is set up | Taylor | Working email, signature with one-liner |
| T17-005 | Taylor: 3 warm intro conversations (no pitch, just listening) | Taylor | Notes doc on learnings from each call |
| T17-006 | Morgan: Decide nav CTA copy — "Start Session" or "New Visit"? | Morgan | Decision confirmed before S17-008 ships |

**Taylor's rule this sprint:** No cold outreach. Not yet. The product has P0 bugs. Close BUG-004 first, get the demo data seeded, get the brewery page beautiful — **then** we get Taylor in front of real breweries.

---

## Implementation Order

**Day 1:**
- S17-001: P0 avatar replacement (Riley + Jamie, immediate — this is the only true blocker)
- S17-011: Demo data seed begins (Riley + Jordan)

**Days 2–3:**
- S17-002/003/004: Profile page visual fixes (Jordan + Alex)
- S17-005/006: Beer Passport + Add Friend button (Jordan)

**Days 4–5:**
- S17-007: Friends management page (Jordan + Sam)
- S17-008: Nav "Start Session" rename (Jordan, pending Morgan copy call)

**Days 6–7:**
- S17-010: The Board Chalk Board redesign (Jordan + Alex — this gets the most time it needs)

**Days 8–9:**
- S17-009: Nav brand review discussion + proposal doc (Alex + Morgan + Sam)
- S17-011: Seed data finalized + verified with analytics/loyalty
- P2 stretch items if time

**Day 10:**
- Casey: Full regression on profile, nav, brewery page, friends flow
- Alex: Visual sign-off on all P1 bug fixes + brewery page
- Drew: Ops sanity check on the Chalk Board

---

## Slip Order (Last = First to Slip)

1. S17-016: TypeScript type cleanup (ExploreClient `as any[]`)
2. S17-015: `loyalty_redemptions` schema confirm
3. S17-014: TestFlight submission
4. S17-013: Audit docs
5. S17-012: E2E tests
6. S17-009: Nav brand/UX proposal (can be async doc, doesn't block build)

**MUST NOT SLIP:** S17-001 (P0 avatars), S17-010 (The Board redesign), S17-011 (demo data), S17-002/003/004 (profile visual bugs)

---

## Key Decisions Needed Before Build

| Decision | Owner | Deadline |
|----------|-------|----------|
| Nav CTA copy: "Start Session" or "New Visit"? | Morgan | Before S17-008 ships |
| Does `beers` table have a price column? Add to 022? | Drew + Riley | Before S17-010 starts |
| Brewery page: Does "Recent Activity" section pull only from this brewery, or nearby? | Morgan | Before S17-010 starts |
| TestFlight: Is Apple Developer account confirmed? | Joshua | Day 1 |
| Drew: Can you fill in 3 warm intro brewery names in Wave 1? | Drew | ASAP |

---

## Bug Log Reference

Full bug details: `docs/sprint-17-bugs.md`

| Bug | P | Description | Owner | Status |
|-----|---|-------------|-------|--------|
| BUG-001 | P1 | Avatar square in circle frame | Jordan | → S17-002 |
| BUG-002 | P1 | Profile hero no padding/radius | Alex + Jordan | → S17-003 |
| BUG-003 | P1 | Profile name typography off-brand | Alex | → S17-004 |
| BUG-004 | **P0** | Seed data has children's photos | Riley + Jamie | → S17-001 |
| BUG-005 | P1 | Beer Passport shows 0 | Jordan | → S17-005 |
| BUG-006 | P1 | No Add Friend button | Jordan | → S17-006 |
| BUG-007 | P1 | No friends management | Jordan + Sam | → S17-007 |
| BUG-008 | P1 | "Check In" wrong copy + flow | Jordan + Alex | → S17-008 |
| BUG-009 | P2 | Nav needs brand/UX review | Alex + Morgan + Sam | → S17-009 |
| BUG-010 | P0 | Tap list crash — ToastProvider | Jordan | ✅ HOTFIXED S16 |
| TD-001 | P0 | Replace seed avatars | Riley + Jamie | → S17-001 |
| TD-002 | P1 | Full demo-ready test data | Riley + Jordan | → S17-011 |

---

## Definition of Done — Sprint 17

- [ ] Zero P0 bugs open at sprint close
- [ ] No children's photos anywhere in seed/test data
- [ ] Profile page: avatar is circular, hero has padding, name is bold and readable
- [ ] Beer Passport shows real data for any user with sessions
- [ ] Add Friend button visible and functional on other users' profiles
- [ ] Friends management: pending, unfriend, cancel outgoing all work
- [ ] Nav CTA says "Start Session" (or agreed copy)
- [ ] The Board redesigned with chalk board aesthetic — passes Alex's taste test, Drew's ops check, Taylor's "I'd demo this" test
- [ ] Demo data seeded — analytics charts show data, loyalty shows stamp cards
- [ ] Taylor has started at least 1 warm intro conversation
- [ ] Casey signs off after full regression

---

*Morgan's note: This sprint is how we go from "impressive prototype" to "thing we show real people." Every item here matters. No slop. 🍺*
