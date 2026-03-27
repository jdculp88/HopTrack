# Sprint 17 — Bug Log
**Filed:** 2026-03-27 · **Source:** Joshua visual review of profile + nav
**Priority legend:** P0 = ship blocker · P1 = fix this sprint · P2 = schedule

---

## Profile Page Bugs

### BUG-001 · P1 — Friend profile avatar renders square image in circular frame
**Screen:** `/profile/[username]` (other user's profile)
**Symptom:** The avatar image is displaying as a square clipped inside a circular border. The image itself isn't being clipped to a circle — the border is round but the image overflows as a square. Looks broken.
**Fix:** Ensure the `<Image>` inside the avatar container has `rounded-full` and `object-cover` applied, and the wrapper has `overflow-hidden`. The border-radius needs to clip the content, not just decorate the border.
**Owner:** Jordan
**Files to check:** Profile page avatar component, `FriendButton` area, profile header

---

### BUG-002 · P1 — Profile header image has no padding/margin — full bleed to edges
**Screen:** `/profile/[username]`
**Symptom:** The cover/hero image at the top of the profile page goes completely edge-to-edge with zero padding or border radius. Looks unfinished — not consistent with the card-based design language elsewhere.
**Fix:** Add `rounded-b-3xl` or similar on the hero section, or apply `mx-4 mt-4 rounded-2xl` to give it breathing room. Match the pattern used on the brewery hero.
**Owner:** Alex + Jordan
**Files to check:** `app/(app)/profile/[username]/page.tsx`

---

### BUG-003 · P1 — Profile name typography doesn't meet brand standards
**Screen:** `/profile/[username]`
**Symptom:** The display name ("Alex Chen") overlays on the cover image but the contrast, font weight, and treatment feel off. Doesn't use `font-display` (Playfair Display) correctly. Blends into the background too much. Should command attention like brewery names do on their page.
**Fix:** Apply `font-display font-bold` with a proper `drop-shadow-lg` or background scrim behind the name. Match the typographic treatment from the brewery hero (`text-4xl sm:text-5xl font-bold text-white drop-shadow-lg`).
**Owner:** Alex
**Files to check:** `app/(app)/profile/[username]/page.tsx` — hero/name section

---

### BUG-004 · P0 — Seed/test data uses photos of children — must remove
**Screen:** Profile avatar (seed user "Alex Chen" and others)
**Symptom:** Test/seed accounts are using photos that include children. This is inappropriate for an app where users share drinking content. Must be replaced before any public TestFlight or App Store submission.
**Fix:** Replace ALL seed account avatar images with adult stock photos or generated avatars (e.g. DiceBear, UIAvatars, or royalty-free adult stock). Audit all seed scripts (`supabase/migrations/008_*.sql` or similar) and any hardcoded avatar URLs.
**Severity:** This is a P0 for App Store submission. Apple will reject apps with potentially problematic content. Fix before TestFlight.
**Owner:** Riley + Jamie
**Files to check:** All seed migration files, `scripts/supabase-setup.mjs`

---

### BUG-005 · P1 — Beer Passport shows 0 beers despite banner showing 18 unique beers
**Screen:** `/profile/[username]` → Beer Passport section
**Symptom:** The profile stat card says "18 unique beers collected" but tapping Beer Passport navigates to a page that shows nothing / 0 beers. Data exists but isn't rendering.
**Fix:** Investigate `/profile/[username]/passport/page.tsx` — likely the query is using the wrong user ID (self vs. other user), or the `beer_logs` → `beers` join is failing silently. Check that the page correctly uses the profile's `user_id` from the URL param, not `auth.getUser()`.
**Owner:** Jordan
**Files to check:** `app/(app)/profile/[username]/passport/page.tsx`

---

### BUG-006 · P1 — No "Add Friend" button visible on other users' profiles
**Screen:** `/profile/[username]` (viewing another user)
**Symptom:** There is no Add Friend / Pending / Friends button visible when viewing another user's profile. `FriendButton` component exists (`components/social/FriendButton.tsx`) but either isn't rendering or isn't being passed the correct props.
**Fix:** Verify `FriendButton` is being imported and rendered in the profile page for non-self profiles. Check that `currentUserId !== profileUserId` condition is correct and the component is actually mounted.
**Owner:** Jordan
**Files to check:** `app/(app)/profile/[username]/page.tsx`, `components/social/FriendButton.tsx`

---

### BUG-007 · P1 — No friends management page (accept/decline/unfriend)
**Screen:** `/friends` or profile
**Symptom:** Users have no centralized place to manage their friends — see pending requests, accept/decline, or remove existing friends. The friends list page exists but may be missing management actions for established friendships.
**Fix:** Audit `app/(app)/friends/page.tsx` and ensure:
  1. Pending incoming requests show Accept/Decline
  2. Existing friends show an Unfriend option (inline confirmation, AnimatePresence)
  3. Outgoing pending requests show a Cancel option
**Owner:** Jordan + Sam
**Files to check:** `app/(app)/friends/page.tsx`, `app/api/friends/route.ts`

---

## Navigation / Shell Bugs

### BUG-008 · P1 — "Check In" button still in nav — should be "Start Session"
**Screen:** Left sidebar nav / mobile bottom nav
**Symptom:** The primary CTA in the nav still reads "Check In" with the old terminology. We migrated all copy to "session/visit/pour" in Sprint 15 but the nav button and its flow weren't updated.
**Fix:**
  - Rename button label to "Start Session" (or "New Visit" — Morgan to decide copy)
  - Verify the flow it triggers is the session-start flow, not the deprecated checkin modal
  - Update the icon if needed (the `CirclePlus` / beer glass icon may need revisiting)
**Owner:** Jordan + Alex (copy: Morgan)
**Files to check:** `app/(app)/AppShell.tsx` or equivalent nav component

---

### BUG-009 · P2 — App nav needs brand/UX review
**Screen:** Left sidebar + mobile bottom nav
**Symptom:** The overall navigation structure and visual treatment needs a review pass. The current nav items, iconography, and visual hierarchy don't fully reflect the brand or the product's current feature set. With events, passport, sessions, and social all shipping, the nav IA may need restructuring.
**Requested review:**
  - Is every nav item earning its spot?
  - Are the icons on-brand and consistent?
  - Does the visual treatment match the dark/gold system?
  - Mobile bottom nav vs. desktop sidebar — is the pattern right?
  - Should "The Board" have a shortcut for brewery admins?
**Owner:** Alex (design lead) + Morgan (IA) + Sam (user journeys)
**Output:** Nav redesign proposal as a doc or Figma before S17 build starts

---

---

## Tap List Bugs

### BUG-010 · P0 — Tap list crashes for all brewery admins ✅ HOTFIXED S16
**Screen:** `/brewery-admin/[brewery_id]/tap-list`
**Symptom:** Page throws `"useToast must be used within a ToastProvider"` — entire tap list page is down with an error boundary.
**Root cause:** `TapListClient` added `useToast()` (for 86'd toggle toast) in Sprint 16, but `ToastProvider` only lives in `AppShell` (consumer app). The brewery-admin layout had no `ToastProvider` wrapping it.
**Fix applied:** Added `<ToastProvider>` to `app/(brewery-admin)/layout.tsx` — wraps all brewery admin routes. `toggle86d` toasts now work throughout the dashboard.
**Owner:** Jordan ✅ Done — hotfix applied 2026-03-27
**Files fixed:** `app/(brewery-admin)/layout.tsx`

> **Note for S17:** Audit all brewery-admin client components that call `useToast()` to confirm they're covered. Any future dashboard features using toasts are now safe.

---

## Test Data Request (S17)

### TD-001 — Replace all seed data avatars with adult-only photos
Linked to BUG-004. Part of the same seed data pass.

### TD-002 — Full realistic test data suite for S17 QA
**Requested by:** Joshua
**Goal:** A seed script or migration that creates a realistic, photogenic, demo-ready dataset for QA, TestFlight screenshots, and sales demos.

**What we need:**
- 3–5 realistic brewery profiles with cover images (adult stock photos, not children)
- 10–20 beers per brewery with varied styles, ABVs, ratings
- 5–10 consumer profiles with adult avatars, session history, achievements
- Active loyalty cards with varying stamp counts (some at 9/10 = "Ready!")
- A few upcoming events on each brewery (tap takeovers, trivia nights)
- Realistic session history (30–60 days back) so analytics charts show data
- Friend connections between test users
- Session comments on recent sessions
- Mix of ratings so analytics have meaningful data

**Output:** `supabase/migrations/seed_demo_data.sql` or `scripts/seed-demo.ts`
**Owner:** Riley + Jordan
**Priority:** P1 — needed before TestFlight screenshots and sales demo

---

## Summary Table

| Bug | Severity | Description | Owner | Status |
|---|---|---|---|---|
| BUG-001 | P1 | Avatar square in circle frame | Jordan | Open |
| BUG-002 | P1 | Profile hero no padding/radius | Alex + Jordan | Open |
| BUG-003 | P1 | Profile name typography off-brand | Alex | Open |
| BUG-004 | **P0** | Seed data uses children's photos | Riley + Jamie | Open |
| BUG-005 | P1 | Beer Passport shows 0 despite real data | Jordan | Open |
| BUG-006 | P1 | No Add Friend button on profiles | Jordan | Open |
| BUG-007 | P1 | No friends management (accept/unfriend) | Jordan + Sam | Open |
| BUG-008 | P1 | "Check In" nav button — wrong copy + flow | Jordan + Alex | Open |
| BUG-009 | P2 | Nav needs full brand/UX review | Alex + Morgan + Sam | Open |
| BUG-010 | **P0** | Tap list down — missing ToastProvider | Jordan | ✅ **HOTFIXED** |
| TD-001 | P0 | Replace seed avatars (children's photos) | Riley + Jamie | Open |
| TD-002 | P1 | Full demo-ready test data suite | Riley + Jordan | Open |

**P0 count: 2 open** (BUG-004, TD-001) + 1 hotfixed (BUG-010)
**P1 count: 8**
**P2 count: 1**
