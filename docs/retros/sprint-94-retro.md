# Sprint 94 Retro — The Club 🍻

**Facilitator:** Morgan 🗂️
**Arc:** The Flywheel (Sprint 4 of 6)
**Date:** 2026-04-01

---

## What Shipped

| Goal | Owner | Status |
|------|-------|--------|
| Digital Mug Clubs — F-020 (schema, API, admin UI, consumer UI) | Avery + Quinn + Alex | ✅ |
| Ad feed wiring (BreweryAdFeedCard live in feed) | Avery | ✅ |
| Security: RLS on `_archive_checkins` | Riley + Quinn | ✅ |
| BL-005: Menu upload PGRST204 resolved | Riley | ✅ |
| BL-004: Lint 223 errors → 0 errors | Avery | ✅ |
| Unit tests: 149 → 206 (+57) | Reese | ✅ |
| Test data: tier diversity (barrel/cask/tap/free) | Quinn | ✅ |

---

## The Retro

**Morgan 🗂️:** We shipped everything. Let me say that clearly — every goal on the board, plus a security fix that came in mid-sprint, plus a Supabase alert we hadn't even planned for. The team didn't flinch. Mug clubs are live, the ad engine is finally wired into the feed, and we're heading into Sprint 95 with zero open issues and 206 passing tests. That's The Flywheel turning. Everyone — floor's yours.

**Jordan 🏛️:** I want to talk about what Avery built with the mug clubs. The tier-gating pattern is clean — same architecture as sponsored challenges and ad campaigns. We now have a consistent contract: Cask/Barrel gate → upgrade CTA for Tap → hidden for Free. Three features, one pattern, no drift. That's architectural discipline. Also: the `_` prefix ESLint rule was the right call. Should've been in the config from day one. I'm not going to say I had to take a walk — but I thought about it.

**Avery 💻:** Already shipped. Mug clubs end-to-end: migration 063, 6 API routes, admin UI with perks builder and member search, consumer section on brewery pages. Also fixed the ad feed that had been sitting unconnected since Sprint 93 — `useFeedAd` hook, wired into both Discover and Friends tabs. The `state_province` bug in the ad API was a quiet one — would've made all brewery city/state labels show as null on ad cards. Caught it during the wiring. Zero drama on the lint pass — 223 errors down to zero.

**Quinn ⚙️:** Let me check the migration state first... 062 through 065, all clean. The tier data migration (062) was simple but the testing impact was real — we finally have all four tiers represented in our test breweries. Migration 063 has solid RLS: brewery admins manage their own clubs, members can read their own membership, superadmin full access. The unique constraint on `(mug_club_id, user_id)` means no accidental duplicate memberships — the API returns a clean 409 if someone tries.

**Riley ⚙️:** The Supabase Security Advisor alert was legitimate. `_archive_checkins` has been sitting there since migration 015 — Sprint 15 — with no RLS. That's over 79 sprints of a publicly accessible backup table. Migration 064 locked it down: RLS enabled, no policies, service-role-only access. The alert cleared immediately. Migration 065 forced the PostgREST schema cache reload, which resolves BL-005. Joshua, your menu upload should save cleanly now.

**Casey 🔍:** Zero errors in Security Advisor. Zero P0 bugs. Zero lint errors. 206 tests passing. We shipped a full membership feature in one sprint with no regressions. I'm watching the numbers and they are clean. The tier diversity in test data was overdue — we literally could not properly QA Cask vs Barrel vs Tap differences before this sprint. That gap is closed now.

**Reese 🧪:** Covered. 57 new tests — `pint-rewind`, `roi`, and `wrapped` were the action item from Sprint 93 retro and they're done. The pint-rewind tests use a mock Supabase client to test the aggregation pipeline end-to-end: empty data, top style identification, archetype mapping, signature beer, brewery loyalty, rating averages. The ROI tests cover all four tier costs plus edge cases. The wrapped tests hit all 7 rating buckets, the Renaissance Drinker override, the adventurer score cap. Nothing is flaky. Covered.

**Sam 📊:** From a business continuity standpoint, mug clubs are the feature I've been most excited about since the roadmap research. Every brewery owner I've ever talked to manages their mug club on a spreadsheet or a whiteboard. We just replaced that. The "contact brewery to join" stub is the right call — we're building the management layer first, payment integration comes later. Users see the value, owners see their members in one place. That's a clean V1.

**Alex 🎨:** The mug club UI is exactly right. The perks builder with gold pill tags, the Crown icon, the `card-bg-stats` wrapper on the consumer side — it feels premium. The "You're a member" badge with the expiry date is a small touch that makes members feel recognized. The tier-gate upgrade CTA with the gold Arrow Up Right button — that's not a dead end, that's a sales moment. It already FEELS like a feature that costs money.

**Drew 🍻:** Mug clubs are the most brewery-native thing we've shipped. Every real brewery has one. The fact that it's Cask/Barrel gated is exactly right — this is the feature that makes a brewery owner pull out their credit card. I've been saying since Sprint 10 that the paper punch card replacement is the pitch. This IS that. Also — seeing my ad show up in the feed for the first time was genuinely exciting. Joshua, when you allow location access you'll see it. I felt that in a good way. I always say that but I really mean it this time.

**Taylor 💰:** Three Flywheel sprints in, and we now have: sponsored challenges, ad campaigns, AND mug clubs all live and tier-gated. The upgrade path from Tap to Cask just got a lot more compelling. A brewery owner on Tap sees "Mug Clubs — Cask/Barrel only" and they do the math: $149/mo for Cask vs losing their 30-member mug club management tool. That's an easy sell. We're going to be rich. 📈

**Jamie 🎨:** The ad card in the feed is clean — "Sponsored" badge in mono font, gold CTA button, brewery logo fallback to a gold initial badge. The mug club section on the brewery page has the right hierarchy — Crown icon, price displayed prominently, perks as a checklist. Visually it communicates "this is a premium thing." Chef's kiss. 🤌

**Sage 📋:** I've got the notes. Sprint 94 shipped 7 goals with zero carryover. Mug clubs (F-020) are complete end-to-end. The ad engine that shipped in Sprint 93 is now live in the feed. Security Advisor cleared. BL-004 and BL-005 both resolved. Tests grew from 149 to 206. Lint from 223 errors to zero. Migrations 062–065 all applied. The Flywheel arc is 4 of 6 complete. Sprint 95 is next — Promotion Hub, multi-location, and keg tracking are on deck.

---

## Roasts 🔥

**Jordan on the `_archive_checkins` table:** "That table has been unlocked since Sprint 15. Sprint FIFTEEN. I'm not mad, I'm just going to need a moment."

**Riley on Jordan:** "He said he wasn't mad. He was absolutely mad."

**Avery on the ad feed bug:** "The `state_province` column has never existed in this schema. Whoever wrote that had a moment of aspirational naming. I fixed it silently and said nothing."

**Jordan on Avery:** "Fixed a column name bug, wired an entire ad system, built mug clubs, and cleaned 223 lint errors. All in one sprint. I asked if she sleeps. She said 'not during sprints.' I believe her."

**Casey on 79 sprints of unsecured archive table:** "I ran 83 API routes and 40+ pages in the Sprint 91 audit. Nobody checked the archive table. Nobody. Including me. We don't talk about this."

**Drew on Taylor:** "Sprint 94, Taylor said 'we're going to be rich.' I checked. He said it in sprints 1 through 93 too. At this point it's just how he greets people."

**Sam on mug clubs:** "We built a feature that brewery owners have literally been asking for since craft beer existed. We built it in one sprint. From a business continuity standpoint, I need a beer."

**Taylor on Drew:** "'I felt that in a good way' count for Sprint 94: 2. Drew is a man of consistent emotional range."

**Reese on the test action item:** "The Sprint 93 retro action item said 'add pint-rewind tests in Sprint 94.' Done. I have never been more on time for anything in my life. Covered."

**Quinn on the unique constraint:** "I put a `UNIQUE(mug_club_id, user_id)` constraint on mug_club_members. Someone will try to add the same member twice. The database will say no. I will feel nothing but satisfaction."

**Morgan on Joshua:** "Mid-sprint, a Supabase security email arrives. Joshua sends a screenshot. No panic, just 'need to fix this stat what do i do.' That's a founder who trusts his team. We had it in five minutes. That's the whole relationship right there."

---

## Stats
- **7 goals shipped**, 0 carryover
- **206 tests** passing (+57 from 149)
- **0 lint errors** (from 223)
- **4 migrations** deployed (062–065)
- **6 new API endpoints** (mug clubs)
- **1 security alert** resolved
- **2 backlog items** closed (BL-004, BL-005)
- **4 arc sprints complete** — The Flywheel (4/6)

---

*Mug clubs are live. The ad engine is wired. The security advisor is clear. The tests are green. Sprint 95 is next — and The Flywheel keeps turning. — Morgan* 🍺
