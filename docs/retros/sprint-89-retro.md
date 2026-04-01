# Sprint 89 Retro — The Rolodex 📇
**Facilitator:** Drew 🍻
**Date:** 2026-04-01
**Sprint:** 89 — The Rolodex
**Arc:** Open the Pipes (Sprint 5 of 6)

---

## What Shipped

| Goal | Owner | Status |
|------|-------|--------|
| Customer Profiles (F-018 Phase 1) | Avery | ✅ |
| Unified Customer Segments | Avery + Jordan | ✅ |
| Segmented Messaging | Avery | ✅ |
| Barcode Scanning Pilot (F-008) | Avery | ✅ |
| Settings Bug Fix | Morgan (triage) + Avery | ✅ |
| POS Integration Guide (Resources) | Avery | ✅ |

**Tests:** 133/133 (22 new CRM tests)
**Migration:** 059 (beer barcode column)
**New files:** 8 | **Modified files:** 10

---

## Retro: The Conversation

**Drew 🍻:** Alright, I'm running this one. And I have opinions. Let's go.

**Drew 🍻:** First — the CRM. I've been asking for this since Sprint 40-something. "Who are my regulars?" That's the question every brewery owner asks every single night. Now we have an answer. Customer profiles with engagement scores, taste profiles, visit timelines. I can look at a customer and know: this person has been here 12 times, they drink IPAs, their last visit was 3 days ago, they have a loyalty card with 7 stamps, and they follow us. That's *power*. That's the kind of thing that makes a brewery owner go "I'm never leaving this platform."

**Taylor 💰:** And that's the sales pitch, right there. "Do you know who your VIPs are? We do." Toast Loyalty can't show you that. Neither can Untappd. We're the only platform that connects check-in behavior to brewery intelligence. $149/mo for CRM + tap list + loyalty + analytics + events? That's a steal.

**Jordan 🏛️:** I want to call out the architecture win here. The old code had three different threshold systems — Customers page used 5/15/30 visits, Messages used 2/5/10, and the export CSV used yet another. Now it's one file: `lib/crm.ts`. Four segments. One `computeSegment()` function. Every page, every API, one source of truth. I had to take a walk — a *happy* walk for once.

**Sam 📊:** From a business continuity standpoint, the engagement scoring model is solid. Five weighted factors — frequency (35pts), recency (30pts), depth (15pts), loyalty (10pts), connection (10pts). The recency decay over 90 days is smart. A customer who came 20 times but hasn't been back in 3 months gets a lower score than someone with 8 visits who was here last week. That maps to real-world retention risk perfectly.

**Morgan 🗂️:** The Settings bug was a good catch. `subscription_tier` was being queried from `brewery_accounts` where it doesn't exist — it lives on `breweries`. Supabase silently returned null, and the redirect fired. Classic silent-failure pattern. We also caught the same bug in two POS API routes before they could bite us.

**Alex 🎨:** The segment colors are *chef's kiss*. Gold for VIP, purple for Power, blue for Regular, green for New. They carry across the Customers list, the profile page, and the Messages composer. Consistent, readable, and they FEEL right on both dark and light themes.

**Casey 🔍:** Zero P0 bugs open right now. ZERO. I tested the segment boundaries hard — 1 visit, 2 visits, 4 visits, 5 visits, 9 visits, 10 visits. Every edge correctly. The engagement score stays bounded 0-100 in all cases, even with randomized inputs. Reese wrote a property-based test for that. 22 new tests, all green.

**Reese 🧪:** Covered. The profile builder test with empty data was important — zero sessions, zero beer logs, null loyalty card. Everything degrades gracefully. No crashes, just "New Face" with 0/100 engagement. That's what empty states should look like.

**Drew 🍻:** OK, the barcode scanner. I love the concept. You scan a can, it finds the beer, you check it in. That's *fast*. That said — we have basically zero barcode data right now. The scanner is built and ready, but it won't find anything until we populate that column. Which is fine. The infrastructure is in place. When Barback starts crawling barcode databases or we let brewery owners enter barcodes in the tap list, it'll light up.

**Quinn ⚙️:** Migration 059 is clean — one nullable column, one partial index. No data changes, no risk. The barcode column is just sitting there waiting for data. If we want, The Barback could start harvesting barcodes from product databases in a future sprint.

**Riley ⚙️:** No pipeline issues this sprint. Migration was trivial. The CRM logic is all application-layer — no schema changes needed for goals 1-3. That's the kind of sprint infrastructure loves. I took a nap.

**Jamie 🎨:** The POS Integration Guide in Resources is a nice touch. Four sections: how sync works (visual flow), supported providers with feature lists, 4-step setup guide, and troubleshooting. Brewery owners can self-serve. That's brand-consistent and reduces support tickets before we even have support tickets.

**Sage 📋:** I've got the notes. Sprint 89 delivered 4 goals, 1 bug fix, 1 resources addition, 22 tests, 1 migration. No carryover. The Open the Pipes arc is 5/6 sprints done. One more sprint to close the arc.

---

## What Went Well

- **Single source of truth** — `lib/crm.ts` killed three inconsistent segment definitions in one shot
- **Engagement scoring** — weighted model with recency decay is genuinely useful, not just a vanity metric
- **Bug discovery** — Settings redirect bug was found and fixed with root cause analysis, not a band-aid
- **Clean scope** — 4 goals, all delivered, no scope creep
- **Test coverage** — 22 new tests with edge cases, property-based boundary testing

## What Could Be Better

- **Barcode data gap** — Scanner is built but useless without barcode data in the DB. Need a plan for population (Barback, manual entry, or external DB)
- **Customer export** — The CSV export still uses old tier thresholds (5/15/30). Should be updated to use `lib/crm.ts` segments
- **No loading skeleton** — Customer profile page doesn't have a `loading.tsx` skeleton yet

## Action Items

- [ ] Populate barcode data — Barback or manual entry (future sprint)
- [ ] Update customer export CSV to use CRM segments
- [ ] Add `loading.tsx` for customer profile page

---

## Roast Corner 🔥

**Drew on Jordan:** "Jordan took a *happy* walk this sprint. I didn't know that was possible. Somebody check on him."

**Casey on Riley:** "Riley said he took a nap. During a sprint. I want his job."

**Jordan on Drew:** "Drew finally got his CRM. Took 50 sprints. He's going to be insufferable about it."

**Taylor on Everyone:** "89 sprints and we're still not rich. But we're getting dangerously close."

**Morgan on the founder:** "Joshua asked where to see all the stuff we built. 89 sprints of work. 'Where is it?' Joshua. It's... it's everywhere. It's the whole thing." *Morgan smiles. Jordan notices.*

---

**Next up:** Sprint 90 — Final sprint of the Open the Pipes arc. API polish, multi-location research, arc close-out.

*This is a living document.* 🍺
