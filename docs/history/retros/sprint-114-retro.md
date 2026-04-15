# Sprint 114 Retro — The Operator
**Facilitated by:** Morgan
**Date:** 2026-04-01
**Arc:** Multi-Location (Sprint 1 of ~24)

---

## What We Shipped

| Goal | Status | Owner |
|------|--------|-------|
| **Staff redemption system (4 roles + code entry UI)** | ✅ Shipped | Avery |
| **Brewery admin user management (full CRUD)** | ✅ Shipped | Avery |
| **5 bug fixes (wishlist, You tab, spacing, Explore, caching)** | ✅ Shipped | Avery |
| **Smart search (pg_trgm fuzzy + typeahead)** | ✅ Shipped | Avery + Riley |
| **Multi-location schema foundation (072)** | ✅ Shipped | Jordan + Riley |

**Delivery rate:** 100%
**Migrations:** 3 (070, 071, 072)
**Lint errors:** 0
**P0 bugs:** 0

---

## Pulse Check

**Morgan 🗂️**
Five goals, five shipped. That's how we open an arc. Sprint 114 was about two things: making brewery operations real (staff roles, code redemption, user management) and laying the multi-location foundation. We did both. The schema Jordan designed for brands is clean — nullable `brand_id` on breweries means single-location owners don't even know it exists. That's the right design. And Avery closed five bugs while shipping two major features. This team is locked in.

**Jordan 🏛️**
The multi-location schema is the thing I'm proudest of this sprint. `brewery_brands` as the parent, `brand_accounts` for role propagation, nullable `brand_id` on breweries so the entire feature is opt-in. Zero impact on existing data. I spent more time on that migration than anything else — because if the foundation is wrong, the next 20 sprints are fighting the schema instead of building on it. It's right. I can feel it. Also, Avery's `CodeEntry` component is clean. Big input, auto-uppercase, success state with POS reference — bar staff will actually be able to use this on a Friday night. Drew confirmed.

**Avery 💻**
Already on it. Staff roles were the heaviest lift — migration 070 touches `brewery_accounts` to add the `puncher` role, the staff API is full CRUD with role validation, and the `StaffManager` component has inline add, role dropdown, and remove confirmation all in one panel. The code entry page is my favorite thing I built this sprint though. Big chunky input, HT-XXXX format POS reference, success state that shows the customer name and reward. Drew said a bartender could use it one-handed. That's the bar. The five bug fixes were real — the You tab one was the nastiest. It was mixing friend sessions into the user's own activity. Dedicated `fetchUserSessions()` query fixed it clean.

**Riley ⚙️**
Three migrations in one sprint. 070 for staff roles and promo codes, 071 for pg_trgm smart search (three PostgreSQL functions — `search_beers_fuzzy`, `search_breweries_fuzzy`, `search_all`), 072 for the multi-location schema. Quinn reviewed all three. The pg_trgm extension is doing real work — similarity threshold at 0.15 with ILIKE fallback means typos actually return results now. The migration pipeline is real now.

**Quinn ⚙️**
Let me check the migration state first. 070 through 072 all applied clean. RLS on `brewery_brands` and `brand_accounts` is tight — brand owners can manage their own brands, superadmin can see everything, regular users get read access on brands (for the future consumer brand page). The staff role hierarchy in 070 is enforced at the API level, not just RLS — you can't promote someone above your own role. That was Jordan's call and it's the right one.

**Casey 🔍**
Five bugs opened, five bugs closed, zero new regressions. The wishlist filter fix was overdue — `filter=wishlist` in the Explore URL just works now. The `staleTimes.static = 0` change for caching is aggressive but correct — stale pages were causing real confusion. I'm watching the smart search closely. Fuzzy matching at 0.15 similarity is permissive — if we get garbage results, we tighten. But for now, it feels right. Zero P0 bugs open right now. ZERO. 👀

**Reese 🧪**
Covered. The `SearchTypeahead` component has full keyboard navigation and ARIA — `aria-activedescendant`, `role="listbox"`, the works. I want integration tests on the search API next sprint. The fuzzy matching logic is complex enough that we need regression coverage. Adding it to my list.

**Alex 🎨**
The `CodeEntry` component is the UI win of this sprint. Big input field, clear visual feedback, auto-uppercase so bar staff don't have to think about caps lock. The success state with the gold checkmark and customer name — that FEELS like a confirmation. No `confirm()` dialog, no alert. Just clean inline feedback. The `StaffManager` fits naturally in Settings — role pills are color-coded, remove confirmation is AnimatePresence slide-down. It already FEELS like an app.

**Sam 📊**
From a business continuity standpoint, the staff system is the feature that unlocks real brewery operations. Before this sprint, only the owner could confirm loyalty redemptions. Now you can have a puncher role — the bartender taps a code, sees the reward, hands it over. That's a real workflow. The smart search matters too — users were typing "hasy" looking for "hazy" and getting nothing. Now they get results. That's retention.

**Drew 🍻**
The code entry page — I felt that one. On a busy Friday night, the bartender needs to punch a code with one hand while pouring with the other. Big input, auto-uppercase, clear success state with the POS reference they can match to their register? That's how it actually works at the bar. The four-role hierarchy (owner → manager → staff → puncher) maps to real brewery org charts. I've seen shops where the taproom manager handles everything except billing — that's the Manager role exactly. Good sprint.

**Taylor 💰**
The multi-location schema is the money move. We just built the foundation for Barrel-tier pricing. 50 multi-location brands at $300/month average — that's $15K MRR from one feature arc. The staff system is the other sell: "Your whole team can use HopTrack, with the right permissions." That's an enterprise pitch. We're going to be rich. 📈

**Jamie 🎨**
The SearchTypeahead dropdown is clean — grouped sections for beers and breweries, keyboard nav, the whole thing feels native. And the CodeEntry success state with the gold accent? Chef's kiss. 🤌

**Sage 📋**
I've got the notes. Sprint 114 delivered 100% across 5 goals, 3 migrations, 8 new files. The Multi-Location arc is officially underway with the schema in place. I've prepped the Sprint 115 brief for Morgan.

---

## The Roast 🍺

**Morgan on Avery:** Five goals, one sprint, zero complaints. I'm starting to wonder if you sleep. "Already on it" isn't a catchphrase — it's a medical condition.

**Casey on Jordan:** You spent more time on migration 072 than most people spend on entire features. Three tables and a nullable column. We get it, the schema is beautiful. You can stop staring at it.

**Drew on Alex:** "It already FEELS like an app" — you know it IS an app, right? You've been saying that for 80 sprints.

**Jordan on Riley:** Three migrations in one sprint and you didn't even break a sweat. Remember when you were traumatized by the SQL editor? Growth.

**Taylor on Drew:** "I felt that physically" — Drew, you say that about everything. A migration, a UI change, a slightly misaligned button. You FEEL things.

**Avery on Casey:** "Zero P0 bugs. ZERO." You say it every retro like it's a surprise. At this point, if we had a P0, you'd retire.

---

*Retro saved 2026-04-01. The Operator delivered. Multi-Location arc: underway.* 🍺
