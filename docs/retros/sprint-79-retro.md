# Sprint 79 Retro — Brewery Value + The Barback Pilot
**Facilitated by:** Morgan 🗂️
**Date:** 2026-03-31
**Sprint:** 79 | **Arc:** Stick Around (Sprints 79-84)

---

## The Vibe

This sprint changed the game. We went from a static database to a living, breathing one. The Barback crawled Charlotte breweries, found real beers on real websites, and staged them for review — all for less than a penny. Meanwhile, brewery owners are about to start getting weekly proof that HopTrack is worth every dollar.

And then Joshua looked at Heist Brewery's Untappd embed and said the five most dangerous words in product development: *"We can do better than this."*

Sprint 80 is going to be fun.

---

## What Shipped

| Goal | Feature | Status |
|------|---------|--------|
| Brewery Value | F-007: Weekly Digest Emails | ✅ Shipped |
| Brewery Value | F-010: ROI Dashboard Card | ✅ Shipped |
| Data Enrichment | The Barback — Charlotte NC Pilot | ✅ Shipped + Live |

**24 files changed, 4,375 insertions.** Three goals. One sprint. Zero P0 bugs.

---

## Who Built What

**Morgan 🗂️ (PM):** Sprint planning, priority calls, scope management. Kept three parallel workstreams from colliding. Delegated the Barback research to Sam and Jordan simultaneously — they delivered in parallel. That's how you run a sprint.

**Sage 📋 (PM Assistant):** Sprint plan drafting, requirement coordination, making sure nothing fell through the cracks between the three goals. The sprint plan was clean and everyone knew their lane.

**Sam 📊 (Business Analyst):** Wrote REQ-071 — The Barback requirements document. 500 lines. 16 user stories. Risk matrix. Confidence scoring model. Staleness rules. The claimed/unclaimed boundary section alone should be framed. "From a business continuity standpoint, empty brewery listings are our biggest risk." Correct, Sam. Correct.

**Jordan 🏛️ (Architecture Lead):** Wrote the Barback architecture document. Schema design, pipeline architecture, cost analysis, risk assessment. The claim handoff design — "Claim your brewery, your tap list is already there" — is Taylor's new favorite sentence. Also caught the hallucination risk early and designed the confidence threshold system. Had to take a walk. Came back with a better architecture.

**Avery 💻 (Dev Lead):** Built ALL THREE goals. Digest API + trigger, ROI dashboard card, AND the Barback crawl script + superadmin review page. Shipped the email templates, the ROI calculation engine, the HTML cleaner, the AI extraction pipeline, and the approve/reject UI. Already on it — and then some.

**Quinn ⚙️ (Infrastructure Engineer):** Migration 051 — three new tables, provenance columns, RLS policies, seed data tagging. Fixed the `is_superadmin` vs `role` RLS policy error during the live migration push. Cool under pressure. "Let me check the migration state first."

**Alex 🎨 (UI/UX):** ROI card design direction — gold accent hero, sparkline, stat grid. The card feels premium without being loud. Alex's touch.

**Casey 🔍 (QA):** Build verification, edge case review. Zero P0 bugs at retro. "Zero P0 bugs open right now. ZERO."

**Riley ⚙️ (Infrastructure):** Infra review on the Barback's Supabase load implications. Green light on the pilot scale.

**Taylor 💰 (Sales):** ROI calculation methodology — the $35/visit industry average, the "paid for itself X times" framing. Already rehearsing the pitch: "Claim your brewery, your tap list is already there." Taylor's eyes lit up when Jordan described the claim handoff. "We're going to be rich."

**Drew 🍻 (Brewery Ops):** Charlotte brewery validation. Confirmed several of our seed breweries are real and active. Flagged dead sites (Barking Duck, Eaton Pub). Spot-checked King Canary's 13 beers. "If their tap list is on the website, we should know about it." That's the Barback motto now.

**Jamie 🎨 (Marketing):** Email template copy direction, "sourced from" attribution copy review. The digest email is on-brand — dark bg, gold accents, Playfair headers.

**Reese 🧪 (QA Automation):** Test coverage review for the digest API and ROI calculation functions.

---

## What Went Well

**Sam 📊:** The Barback requirements document was the most thorough REQ I've written. Having Joshua's "claimed vs unclaimed" direction BEFORE we started writing code saved us from at least three wrong architectural decisions. The founder's instinct on data trust was spot on.

**Jordan 🏛️:** The live crawl working on the first real attempt — finding actual beer pages, extracting real beer names, staging them correctly — that was satisfying. The subpage discovery finding King Canary's `/beer-1` page with 13 beers? *Chef's kiss.* Also, the cost. $0.003 for 10 breweries. I estimated $0.015. We came in 5x under budget.

**Avery 💻:** Three goals in one sprint. The parallel agent architecture let us build the digest emails, ROI card, and Barback foundation simultaneously. I was literally building in three places at once. Already on it x3.

**Taylor 💰:** The ROI card is going to close deals. "Your HopTrack subscription paid for itself 3.2x this month" — that's not a feature, that's a retention weapon. And the Barback claim handoff? That's our pitch. Breweries don't have to enter anything — we've already done it for them.

**Drew 🍻:** Watching the script find Eleven Lakes' `/our-beer` page with 12 beers... I felt that physically. Those are REAL beers. On a REAL tap list. That our AI found and cataloged. For free. Untappd charges for this kind of data.

**Quinn ⚙️:** Migration 051 was the biggest schema addition since the original database. Three new tables, five new columns on existing tables, RLS policies, seed tagging — all in one clean migration. Applied on second attempt after the `is_superadmin` fix. Let me check the migration state first... it's clean.

**Morgan 🗂️:** The speed of this sprint. Joshua gave us the Barback idea mid-planning, Sam had requirements in 4 minutes, Jordan had architecture in 4 minutes, and Avery was building before the ink was dry. That's what a good team looks like.

---

## What Could Be Better

**Jordan 🏛️:** The script needed four debugging iterations before it ran clean — model ID wrong, dotenv path, JSON code fences, schema column mismatch, missing crawl_job_id FK. I should have caught these in the architecture doc. The spec-to-implementation gap cost us debugging time. Next time, I'm reviewing the script before it runs.

**Sam 📊:** I specified `source_url` on `crawled_beers` in REQ-071 but Jordan's schema used `source_text`. The disconnect between my requirements doc and the actual migration caused the insert error. We need a single source of truth for column names — either the REQ or the architecture doc, not both.

**Casey 🔍:** The live crawl debugging happened with Joshua watching. That's fine for a pilot, but we can't have schema mismatches in production. Migration 051 should have had a test run against a staging database before the founder was watching it error out.

**Drew 🍻:** Several of our Charlotte breweries are permanently closed or have dead websites. We should pre-validate the crawl pool before adding them to `crawl_sources`. Barking Duck, Eaton Pub — those fetch failures are noise. We should mark them and move on.

**Avery 💻:** The subpage scanner is slow — trying 9+ paths per brewery with 500ms delays adds up. For 50 breweries that's potentially 450 extra requests. We should cache discovered beer page URLs in `crawl_sources.crawl_url` so subsequent runs go straight to the right page.

**Morgan 🗂️:** We shipped three goals AND a live pilot AND debugging in one sprint. That's ambitious even for us. Next sprint I'm scoping tighter — one big feature, done well. The Untappd killer deserves our full attention.

---

## Roast Corner 🔥

**Sam → Jordan:** Your architecture doc said "3 sprints minimum." Avery built it in one. Maybe your estimates need a Barback of their own.

**Jordan → Sam:** Your requirements doc specified a column that doesn't exist in my schema. "From a business continuity standpoint," maybe read the migration before writing the REQ next time.

**Drew → The Team:** You crawled Barking Duck Brewing. They've been closed for TWO YEARS. I could have told you that over a beer. Next time, ask the guy who actually drinks at these places.

**Taylor → Jordan:** "The cost is essentially free." Jordan, you estimated $0.015 per brewery. The actual cost was $0.0003. Your estimate was off by 50x. If I sold subscriptions with that margin of error, we'd be bankrupt.

**Casey → Avery:** Four debugging runs to get the script working. FOUR. I counted. The circuit breaker fired. Crawl sources got disabled. Schema errors in production. If this were a real release, I'd be writing incident reports until next sprint.

**Avery → Casey:** It's a PILOT. The whole point is to find the bugs. Also, the circuit breaker working correctly IS the safety net working. You're welcome.

**Morgan → Joshua:** You gave us the Barback idea in the middle of sprint planning, added a "don't forget brewery metadata" request mid-crawl, found the Untappd embed, and said "let's crush these guys." In one conversation. I love working for you, but my backlog has a backlog now.

**Joshua → Morgan:** *types "go go go go go go"*

---

## Sprint 80 Preview

Joshua saw Heist Brewery's Untappd embed and it was... not good. His words: "We can do soooooo much better than this."

**Sprint 80 — The Untappd Killer** (working title)
Using Heist as our reference client:
1. **Gleaming brewery profile pages** — make `/brewery/[id]` gorgeous, beer-menu-forward, with full tap list
2. **Full beer menu component** — based on available beers, styles, ABV, descriptions
3. **Embeddable beer menu widget** — a `<script>` or `<iframe>` breweries can drop on their own website, replacing Untappd's ugly embed

This is the feature that makes breweries switch. Not because we ask them to — because their customers show them something better.

---

## Numbers

| Metric | Value |
|--------|-------|
| Files changed | 24 |
| Lines added | 4,375 |
| New tables | 3 (crawl_sources, crawl_jobs, crawled_beers) |
| New API routes | 4 |
| New components | 2 |
| New scripts | 1 |
| Beers discovered (pilot) | 15 |
| Pilot cost | $0.003 |
| P0 bugs at retro | 0 |
| Debugging iterations (Barback) | 4 |
| Jordan walks taken | 1 |
| Times Joshua said "go" | 6 |

---

*"This is the sprint where the data came alive. The Barback found real beers at real breweries for less than a penny. And Joshua saw an Untappd embed and chose violence. Sprint 80 is going to be legendary."*

— Morgan 🗂️

*"Covered."*

— Reese 🧪
