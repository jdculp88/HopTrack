# REQ-071: The Barback — AI-Powered Brewery Website Crawler

**Status:** QUEUED
**Priority:** P1
**Category:** Data Infrastructure / New Feature
**Sides:** Platform (data ops), Consumer (data quality), Brewery Admin (premium tier)
**Effort:** L (6-10 sprints — pilot through production rollout)
**Related:** Sprint 78 (brewery/beer seed data), REQ-070 (menu uploads), F-001 (billing tiers)
**Sprint Arc:** TBD (post-Sprint 79)
**Author:** Sam (Business Analyst / QA Lead)
**Date:** 2026-03-31

---

## 1. Problem Statement

HopTrack has 7,177 breweries but only 2,361 beers across 541 of them. That means **92% of our breweries have zero beers in the database.** A user opens the app, finds their local brewery, and sees... nothing. No tap list. No beers to check in. No reason to stay.

From a business continuity standpoint, this is an existential data quality problem. The app's core value proposition — check in beers, earn XP, plan pub crawls — falls apart when the data isn't there. Users who show up to an empty listing don't come back.

Worse: if we display beer data that's stale (a beer that was on tap last month but got kicked Tuesday), users physically show up to a brewery asking for something that doesn't exist. That's not a bug. That's a trust violation. One bad experience like that and we lose that user permanently.

**The gap:** We need a system that continuously discovers and enriches beer data for breweries that aren't managing their own listings. Most small breweries maintain a website or social media presence with current tap lists. That data exists — we just aren't reading it.

**The constraint:** Claimed breweries (owners who pay us and manage their own data) must NEVER have their data overwritten by a crawler. Their data is authoritative. The crawler only operates on unclaimed listings.

**The opportunity:** If we solve this for unclaimed breweries, we also unlock a premium feature for claimed breweries — "AI Managed" tap list maintenance as a top-tier perk. Brewery owners who don't want to manually update their tap list every keg change could let The Barback do it.

---

## 2. User Stories

### 2.1 Consumer (Beer Drinker)

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a user, I want to see current beers at any brewery in the app, so I can decide where to go tonight. | P0 |
| US-02 | As a user, I want to know how recently the beer list was updated, so I can judge whether the data is trustworthy. | P0 |
| US-03 | As a user, I want to be warned if a beer listing might be stale, so I don't show up expecting something that's been kicked. | P0 |
| US-04 | As a user, I want to check in beers that the crawler discovered, the same way I check in owner-managed beers. | P1 |
| US-05 | As a user, I want to report "this beer isn't actually here" so the system learns and corrects. | P1 |

### 2.2 Unclaimed Brewery Listing

| ID | Story | Priority |
|----|-------|----------|
| US-10 | As an unclaimed brewery listing, my beer data should be enriched automatically from my public website, so users see accurate information. | P0 |
| US-11 | As an unclaimed brewery listing, crawled data should NOT go live until it passes confidence thresholds, so garbage data doesn't appear under my name. | P0 |
| US-12 | As an unclaimed brewery listing, if I get claimed by an owner, all crawler-sourced data should be flagged for owner review — not deleted, not hidden, just clearly marked as "discovered, not verified." | P1 |

### 2.3 Claimed Brewery Owner

| ID | Story | Priority |
|----|-------|----------|
| US-20 | As a claimed brewery owner, my manually entered beer data must NEVER be overwritten or modified by The Barback. My data is the source of truth. | P0 |
| US-21 | As a claimed brewery owner, I should never see crawler-sourced beers injected into my tap list without my explicit action. | P0 |
| US-22 | As a claimed brewery owner on the Barrel tier, I want the option to enable "AI Managed" mode so The Barback keeps my tap list updated from my website automatically. | P2 (future) |
| US-23 | As a claimed brewery owner with AI Managed enabled, I want to review and approve/reject changes before they go live, or set it to auto-approve with notification. | P2 (future) |

### 2.4 Superadmin (HopTrack Platform Team)

| ID | Story | Priority |
|----|-------|----------|
| US-30 | As a superadmin, I want a dashboard showing crawl status, success rates, beer discovery counts, and error rates across all targeted breweries. | P1 |
| US-31 | As a superadmin, I want to manually trigger a crawl for a specific brewery. | P1 |
| US-32 | As a superadmin, I want to review staged (not-yet-live) beer data before it's promoted to production. | P0 |
| US-33 | As a superadmin, I want to blocklist specific brewery domains that return garbage, are behind login walls, or have requested we stop crawling. | P1 |
| US-34 | As a superadmin, I want cost tracking per crawl run (API tokens consumed, execution time) so we can project spend at scale. | P1 |

### 2.5 Premium Subscriber (Future — Barrel Tier)

| ID | Story | Priority |
|----|-------|----------|
| US-40 | As a Barrel-tier brewery owner, I want to enable "AI Managed" to have The Barback read my website and keep my HopTrack tap list synced. | P2 |
| US-41 | As a Barrel-tier brewery owner, I want to choose between "auto-approve" and "review first" modes for AI-discovered changes. | P2 |
| US-42 | As a Barrel-tier brewery owner, I want a weekly summary email of what The Barback changed on my behalf. | P2 |

---

## 3. Crawl Rules

### 3.1 What Gets Crawled

- **Primary source:** Brewery `website_url` field (populated for most Open Brewery DB entries)
- **Target pages:** Homepage, `/beer`, `/menu`, `/on-tap`, `/tap-list`, `/our-beers`, `/taproom`, and common variants
- **Secondary sources (future):** Social media feeds (Instagram, Facebook) — out of scope for pilot
- **Data extracted per beer:** Name, style (mapped to our 26 canonical styles), ABV, IBU (if present), description (if present), seasonal flag (if detectable)

### 3.2 What Does NOT Get Crawled

| Rule | Reason |
|------|--------|
| Claimed breweries (verified = true) | Owner manages their own data. Period. |
| Breweries with no `website_url` | Nothing to crawl. |
| Breweries on the blocklist | Explicit opt-out or known bad data source. |
| Pages behind authentication or paywalls | Can't access, won't try. |
| Non-beer content (food menus, merch, events) | Out of scope for this feature. |
| PDF menus | Out of scope for pilot (complex parsing, low ROI vs. HTML). |

### 3.3 Crawl Frequency

| Scenario | Frequency | Rationale |
|----------|-----------|-----------|
| Initial discovery (new brewery, never crawled) | On addition to crawl queue | Backfill the catalog |
| Routine refresh (brewery with existing crawl data) | Weekly | Balance freshness vs. cost/politeness |
| User-reported stale data | Within 24 hours | Trust repair |
| Superadmin manual trigger | On demand | Debugging, QA |

### 3.4 Politeness & Ethics

- **Respect `robots.txt`:** If a brewery's site disallows crawling, skip it. Log it. Move on.
- **Rate limiting:** Maximum 1 request per domain per 10 seconds. No parallel requests to the same domain.
- **User-Agent:** Identify as `HopTrack-Barback/1.0 (+https://hoptrack.app/barback-info)` — transparent, linkable to an info page explaining what we do and how to opt out.
- **Opt-out mechanism:** Any brewery can email us or submit a form to be added to the blocklist. Response SLA: 48 hours.
- **No scraping of competitor platforms:** We crawl brewery-owned websites only. Never Untappd, BeerMenus, RateBeer, or any third-party aggregator.
- **Bandwidth consciousness:** Cache responses. Don't re-crawl pages that return HTTP 304 (not modified).
- **Legal:** Publicly available data on brewery-owned websites. No login bypass, no CAPTCHA solving, no terms-of-service violations. If a brewery's ToS prohibits scraping, we respect it.

---

## 4. Data Lifecycle

### 4.1 Pipeline Stages

```
[Crawl] → [Extract] → [Normalize] → [Stage] → [Review/Auto-approve] → [Production] → [Monitor] → [Expire]
```

**Stage 1: Crawl**
- Fetch brewery website pages
- Store raw HTML snapshot (for debugging and re-extraction)
- Record HTTP status, response time, last-modified header

**Stage 2: Extract**
- AI-powered extraction (LLM parses HTML into structured beer data)
- Falls back to rule-based extraction for common menu formats (Untappd embed, Taplist.io embed, common WordPress beer plugins)
- Each extracted beer gets a `source_url` and `extracted_at` timestamp

**Stage 3: Normalize**
- Map extracted style string to our 26 canonical `BeerStyle` values
- Validate ABV range (0.0-30.0 — flag anything outside as suspicious)
- Deduplicate against existing beers at the same brewery (fuzzy name match)
- Assign confidence score (see 4.2)

**Stage 4: Stage**
- Insert into `barback_staged_beers` table (NOT production `beers` table)
- Status: `pending_review`
- Staged data is invisible to consumers until promoted

**Stage 5: Review / Auto-approve**
- **Pilot phase:** All staged beers require superadmin review before promotion
- **Post-pilot:** Beers with confidence >= 0.85 auto-promote. Below 0.85 require review.
- Superadmin can: approve (promote to production), reject (discard), edit then approve, or flag for re-crawl

**Stage 6: Production**
- Approved beer inserted into production `beers` table
- `source` field set to `barback` (vs. `owner` for claimed-brewery data, `seed` for initial dataset)
- `source_url` and `last_crawled_at` tracked
- Beer appears in search, check-ins, brewery detail pages

**Stage 7: Monitor**
- Weekly re-crawl compares current website data to stored data
- Beers no longer found on website: flagged as potentially removed (see 4.3 Staleness)
- User "not here" reports feed back into confidence scoring

**Stage 8: Expire**
- Beers not confirmed by crawl for 30 days AND with 0 recent check-ins: marked `is_active = false`
- Beers not confirmed by crawl for 90 days AND with 0 recent check-ins: soft-deleted (hidden from all views)
- Expired beers are recoverable if they reappear on the brewery website

### 4.2 Confidence Scoring

Each staged beer receives a confidence score (0.0 - 1.0) based on:

| Signal | Weight | Description |
|--------|--------|-------------|
| Extraction clarity | 0.30 | Was the beer name/style unambiguous in the source HTML? |
| Style mapping success | 0.15 | Did the style map cleanly to one of our 26 canonical styles? |
| ABV present and valid | 0.10 | ABV exists and falls within 0.0-30.0 range |
| Duplicate check passed | 0.15 | No fuzzy match against existing beers at this brewery |
| Source page structure | 0.15 | Is this a dedicated beer/menu page vs. a blog post or news article? |
| Historical crawl success | 0.15 | Has this brewery's website previously yielded good data? |

**Thresholds:**
- `>= 0.85` — Auto-approve eligible (post-pilot)
- `0.60 - 0.84` — Requires superadmin review
- `< 0.60` — Auto-reject. Log for analysis but do not stage.

### 4.3 Staleness & Expiry Rules

| Condition | Action | User-facing |
|-----------|--------|-------------|
| Beer confirmed by crawl within 7 days | Fresh. No indicator. | Normal display |
| Beer not confirmed by crawl for 8-14 days | Stale warning internally | No user indicator yet |
| Beer not confirmed by crawl for 15-30 days | Stale. Flag in UI. | Subtle "Last verified X days ago" label |
| Beer not confirmed by crawl for 31-60 days + 0 check-ins | Demoted. `is_active = false` | Removed from tap list, still searchable with "may no longer be available" badge |
| Beer not confirmed by crawl for 90+ days + 0 check-ins | Soft-deleted | Hidden from all views |
| User reports "not here" (3+ unique reports in 7 days) | Immediate demotion pending re-crawl | Removed from tap list within 1 hour |

**Key principle:** When in doubt, hide the beer. A missing beer in the app is disappointing. A phantom beer that sends someone on a wasted trip is a trust violation.

---

## 5. The Claimed / Unclaimed Boundary

This is the most important section of this document. Read it twice.

### 5.1 The Hard Rule

```
IF brewery.verified = true THEN The Barback does NOT touch it.
```

No exceptions for the default case. No "helpful suggestions." No "we found some beers on your website, want to add them?" Not until the premium tier is built AND the owner explicitly opts in.

### 5.2 State Transitions

| Event | Barback Behavior |
|-------|-----------------|
| Brewery is unclaimed, has `website_url` | Eligible for crawling. Proceed. |
| Brewery is unclaimed, no `website_url` | Skip. Cannot crawl. |
| Brewery gets claimed (owner verifies) | **Immediately stop all crawling.** Existing barback-sourced beers remain but are flagged `source = 'barback'` for owner review. Owner can keep, edit, or delete them. |
| Brewery gets unclaimed (owner abandons) | Re-enters crawl pool after 30-day grace period. |
| Barrel-tier owner enables "AI Managed" | Resume crawling with owner's approval workflow. Data goes through owner review queue, not straight to production. |
| Barrel-tier owner disables "AI Managed" | Stop crawling immediately. Existing data stays. |

### 5.3 Data Ownership After Claim

When an owner claims a brewery that has barback-sourced beers:

1. All barback-sourced beers retain their `source = 'barback'` tag
2. Owner sees a one-time prompt: "We found X beers from your website. Review them?"
3. Owner can: **Approve** (keeps beer, changes source to `owner`), **Edit + Approve** (fix any errors), or **Delete** (remove from listing)
4. Beers the owner does not review within 30 days remain visible but keep the barback source tag
5. Once a beer's source is changed to `owner`, The Barback never touches it again

### 5.4 Why This Matters

Joshua said it plainly: "We don't want stale data. If we say a beer is at a brewery, people show up and it needs to be there."

The claimed/unclaimed boundary is how we honor that. Claimed breweries are managed by humans who know what's on tap right now. Unclaimed breweries are managed by an AI that's doing its best with public data — and we're honest about the difference.

---

## 6. Premium "AI Managed" Tier Concept

### 6.1 Overview

A Barrel-tier (custom pricing) add-on feature. The brewery owner opts in and The Barback monitors their website, automatically proposing tap list updates.

**This is NOT the pilot. This is the future state.**

### 6.2 How It Would Work

1. Owner navigates to Dashboard > Settings > AI Managed
2. Toggles "Enable AI Managed Tap List"
3. Confirms their website URL and which page(s) to monitor
4. Chooses mode:
   - **Review First** (default): Barback crawls, stages changes, sends notification. Owner approves/rejects each change.
   - **Auto-Approve**: Barback crawls and applies changes immediately. Owner gets a daily/weekly digest email of what changed.
5. Owner can pause or disable at any time

### 6.3 Differences from Unclaimed Crawling

| Aspect | Unclaimed | AI Managed (Barrel) |
|--------|-----------|-------------------|
| Consent | Implicit (public data, no owner to ask) | Explicit (owner opts in) |
| Review gate | Superadmin (pilot) or auto-approve (post-pilot) | Owner (review mode) or auto with digest |
| Crawl frequency | Weekly | Configurable: daily, twice-daily, or on-demand |
| Data confidence threshold | 0.85 for auto-approve | 0.70 (owner catches errors, lower threshold OK) |
| Source tag | `barback` | `barback_managed` |
| Staleness rules | Aggressive (hide when uncertain) | Relaxed (owner is responsible for accuracy) |

### 6.4 Revenue Impact

- Justifies Barrel-tier custom pricing (this is a real operational time-saver for busy brewery owners)
- Differentiator vs. Untappd for Business (they have no equivalent)
- Potential upsell path: Cask-tier owners see "AI Managed is available on Barrel" nudge when they manually update their tap list

### 6.5 When to Build

Not until: (a) the pilot validates crawl accuracy at >= 80% precision, (b) at least 3 Barrel-tier customers exist to validate demand, (c) the unclaimed crawl pipeline is stable in production for 60+ days.

---

## 7. Data Freshness Guarantees

### 7.1 What We Promise Users

| Data Source | Freshness Guarantee | UI Indicator |
|-------------|-------------------|--------------|
| Owner-managed (claimed) | Real-time (owner updates when kegs change) | "Managed by [Brewery Name]" badge |
| Barback-discovered (unclaimed) | Verified within the last 7 days | "Last verified [date]" label (subtle, not alarming) |
| Barback-stale (unclaimed, 15-30 days) | May be outdated | "Last verified [date]" label + muted styling |
| Seed data (Sprint 78 bulk import) | Static. Not actively verified. | "Community data" label. No freshness claim. |

### 7.2 What Happens When Data Goes Stale

1. **Soft degradation:** Stale beers don't disappear instantly. They fade — muted text, "last verified" labels, eventual demotion from active tap list to "previously available."
2. **User reports accelerate:** A single "not here" report triggers a priority re-crawl. Three reports in 7 days trigger immediate demotion.
3. **No false confidence:** We never display barback-sourced beers without a freshness indicator. Users should always know the data source and recency.
4. **Honest empty states:** If we have no confident beer data for a brewery, we show "No beer data yet — know what's on tap? Help us out!" with a user contribution CTA (future feature). Better to show nothing than to show garbage.

### 7.3 The Seed Data Problem

The 2,361 beers from Sprint 78 (Kaggle) have no freshness guarantee. They were bulk-imported from a static dataset. Post-Barback launch, these should be:
- Tagged `source = 'seed'`
- Candidates for Barback re-verification (crawl the brewery website, see if the seed beer still exists)
- Gradually replaced by barback-sourced data with actual freshness tracking
- Displayed with "Community data — may not reflect current tap list" label until verified

---

## 8. Charlotte NC Pilot

### 8.1 Scope

- **Geography:** Charlotte, NC metro area
- **Brewery count:** 50 unclaimed breweries with `website_url` populated
- **Selection criteria:** Must have a functional website with a visible beer/tap list page. Filter out breweries with no website, dead links, or sites behind authentication.
- **Duration:** 4 weeks from first crawl to pilot review
- **Manual review:** ALL staged beers require superadmin approval during pilot. No auto-approve.

### 8.2 Why Charlotte

- Strong craft beer market (60+ breweries in the metro)
- Southeast hub — relevant to our Asheville-first GTM strategy (Taylor's warm intros through Drew's network)
- Large enough to be meaningful, small enough to manually QA
- Mix of brewery types: brewpubs, taprooms, production facilities with tasting rooms

### 8.3 Success Criteria

| Metric | Target | How We Measure |
|--------|--------|----------------|
| Crawl success rate | >= 70% of targeted breweries yield at least 1 beer | Crawl logs |
| Extraction precision | >= 80% of extracted beers are real, correctly named, correctly styled | Superadmin manual review against brewery website |
| Style mapping accuracy | >= 90% of style mappings are correct or "close enough" (e.g., "West Coast IPA" → "IPA" is acceptable) | Manual audit |
| False positive rate | <= 10% of promoted beers are wrong (wrong brewery, wrong name, fabricated) | Superadmin review + spot-check against live brewery sites |
| User-reported errors | <= 5 "not here" reports in first 2 weeks of live data | In-app reporting |
| Crawl cost | < $50 total for 4-week pilot (LLM API tokens + compute) | API usage tracking |
| Time to review | Superadmin can review a batch of 50 staged beers in < 30 minutes | Time tracking |
| Website opt-out requests | 0 (no brewery asks us to stop) | Support inbox |

### 8.4 What We Measure But Don't Gate On

- Check-in lift: Do users at Charlotte breweries check in more beers after enrichment?
- Search conversion: Do Charlotte brewery searches result in more brewery detail page visits?
- Session starts: Do Charlotte breweries see more session starts after beer data is populated?
- HopRoute inclusion: Do Charlotte breweries appear more often in HopRoute plans?

### 8.5 Pilot Infrastructure

- Supabase Edge Function or standalone script (not a persistent server)
- Triggered by superadmin manually or cron job (daily during pilot)
- Results written to `barback_staged_beers` table
- Superadmin review UI: simple table view in `/superadmin/barback/` — name, style, ABV, confidence, source URL, approve/reject buttons
- Crawl logs stored in `barback_crawl_logs` table

---

## 9. Risk Matrix

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R-01 | **Phantom beer problem** — user shows up for a beer that doesn't exist | Medium | Critical | Aggressive staleness rules. "Last verified" UI labels. User "not here" reports trigger immediate re-crawl. When in doubt, hide the beer. |
| R-02 | **Legal: website scraping complaint** | Low | High | Respect robots.txt. Transparent User-Agent. Opt-out mechanism with 48h SLA. Only crawl brewery-owned sites. No competitor scraping. Consult legal counsel before scaling beyond pilot. |
| R-03 | **Data quality: LLM hallucination** — AI invents beers that don't exist | Medium | High | Confidence scoring. Manual review during pilot. Post-pilot auto-approve threshold at 0.85. Raw HTML stored for audit. |
| R-04 | **Claimed brewery data overwrite** | Very Low | Critical | Hard code boundary: `verified = true` means zero crawl activity. Code review. Integration test. This is a "break glass" P0 if it ever happens. |
| R-05 | **Cost overrun** — LLM API costs exceed budget at scale | Medium | Medium | Track cost per crawl. Set hard budget caps. Optimize prompts. Cache aggressively. Rule-based extraction for common formats (reduce LLM calls). |
| R-06 | **Brewery website changes format** — crawl breaks silently | High | Medium | Monitor extraction success rate per brewery. Alert on sudden drops. Fall back to "no data" (safe default) rather than serving garbage. |
| R-07 | **Stale seed data conflict** — Kaggle beers conflict with crawled beers | Medium | Low | Dedup logic (fuzzy name match). Barback-sourced data takes priority over seed data. Migration to tag seed data with `source = 'seed'`. |
| R-08 | **Rate limiting / IP blocking by brewery hosts** | Low | Low | Polite crawl rate (1 req / 10s / domain). Respectful User-Agent. Rotate nothing — be transparent, not evasive. If blocked, add to blocklist and move on. |
| R-09 | **User trust erosion** — users don't trust barback data even when accurate | Medium | Medium | Clear UI differentiation between owner-managed and AI-discovered data. Build trust gradually through accuracy. Let users verify ("I confirm this beer is here" button — future). |
| R-10 | **Scope creep** — team wants to crawl social media, PDFs, images before pilot validates | Medium | Medium | This document says NO. Pilot is HTML websites only. Social media, PDF menus, and image OCR are post-pilot features with their own REQs. |

---

## 10. Acceptance Criteria (Pilot)

### Must Have (Pilot ships when ALL are met)

- [ ] Crawler successfully extracts beer data from >= 35 of 50 targeted Charlotte breweries (70% success rate)
- [ ] Extraction precision >= 80% as measured by superadmin manual review
- [ ] `barback_staged_beers` table exists with: beer name, style, ABV, brewery_id, confidence_score, source_url, extracted_at, status (pending_review / approved / rejected), reviewed_by, reviewed_at
- [ ] `barback_crawl_logs` table exists with: brewery_id, crawl_timestamp, http_status, pages_crawled, beers_found, error (if any), cost_tokens, duration_ms
- [ ] Superadmin review UI at `/superadmin/barback/` with approve/reject/edit controls
- [ ] Approved beers promoted to production `beers` table with `source = 'barback'`, `source_url`, and `last_crawled_at`
- [ ] Hard boundary enforced: breweries with `verified = true` are never crawled (integration test required)
- [ ] `robots.txt` is respected — breweries that disallow crawling are skipped
- [ ] Crawler identifies itself with `HopTrack-Barback/1.0` User-Agent
- [ ] Total pilot cost < $50 in LLM API tokens
- [ ] Zero brewery opt-out complaints
- [ ] Barback-sourced beers display "Last verified [date]" label in consumer UI

### Should Have (nice to have for pilot, required for production)

- [ ] User "not here" reporting button on barback-sourced beers
- [ ] Automated weekly re-crawl for Charlotte pilot breweries
- [ ] Staleness rules enforced (15-day label, 30-day demotion, 90-day soft-delete)
- [ ] Confidence scoring with all 6 signals weighted
- [ ] Seed data (Sprint 78) tagged with `source = 'seed'` for differentiation
- [ ] Cost-per-crawl tracking visible in superadmin dashboard

---

## 11. Out of Scope for Pilot

| Item | Why | When |
|------|-----|------|
| Social media crawling (Instagram, Facebook) | Different extraction challenge. Validate HTML first. | Post-pilot REQ |
| PDF menu parsing | Requires OCR/document AI. Low ROI for pilot. | Post-pilot REQ |
| Image-based menu extraction | Complex CV problem. Nail text-based first. | Post-pilot REQ |
| AI Managed (Barrel tier) | Needs pilot validation + paying Barrel customers first. | Post-pilot, see Section 6.5 |
| User-contributed beer data ("I know what's on tap") | Different trust model. Needs its own REQ. | Separate feature |
| Non-beer items (food, merch, events) | Different data model. Different extraction prompts. | Separate REQ |
| Nationwide rollout | Validate Charlotte first. Then expand region by region. | Post-pilot, gated on success criteria |
| Real-time crawling (webhook-triggered on website change) | Overengineering for pilot. Weekly is fine. | Production optimization |
| Competitor data scraping | Ethically wrong. Legally risky. Never. | Never. |

---

## 12. New Database Objects (Pilot)

### Tables

**`barback_staged_beers`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| brewery_id | uuid (FK → breweries) | |
| name | text | Extracted beer name |
| style | text | Raw extracted style (pre-normalization) |
| mapped_style | BeerStyle | Our canonical style mapping |
| abv | numeric(4,2) | Nullable |
| ibu | integer | Nullable |
| description | text | Nullable |
| confidence_score | numeric(3,2) | 0.00 - 1.00 |
| source_url | text | The specific page URL this beer was found on |
| extracted_at | timestamptz | When the AI extracted this data |
| status | text | `pending_review`, `approved`, `rejected` |
| reviewed_by | uuid (FK → profiles) | Nullable — superadmin who reviewed |
| reviewed_at | timestamptz | Nullable |
| rejection_reason | text | Nullable — why it was rejected |
| created_at | timestamptz | Default now() |

**`barback_crawl_logs`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| brewery_id | uuid (FK → breweries) | |
| crawl_timestamp | timestamptz | When the crawl ran |
| pages_crawled | integer | How many pages were fetched |
| beers_found | integer | How many beers were extracted |
| beers_staged | integer | How many passed minimum confidence |
| http_status | integer | Primary page HTTP status |
| error | text | Nullable — error message if crawl failed |
| cost_tokens | integer | LLM tokens consumed |
| duration_ms | integer | Total crawl time |
| raw_html_url | text | Nullable — storage URL for raw HTML snapshot |

### Columns Added to Existing Tables

**`beers` table:**
| Column | Type | Notes |
|--------|------|-------|
| source | text | `owner`, `barback`, `barback_managed`, `seed`. Default `owner`. |
| source_url | text | Nullable — URL where barback found this beer |
| last_crawled_at | timestamptz | Nullable — last time barback verified this beer exists |

**`breweries` table:**
| Column | Type | Notes |
|--------|------|-------|
| barback_enabled | boolean | Default false. True = eligible for crawling. |
| barback_blocklisted | boolean | Default false. True = never crawl. |
| last_crawled_at | timestamptz | Nullable — last successful crawl |

---

## 13. Post-Pilot Expansion Plan

If the Charlotte pilot meets success criteria:

1. **Phase 2 — Southeast expansion:** Asheville, Raleigh-Durham, Charleston, Atlanta. 200 breweries. (~2 sprints)
2. **Phase 3 — Top 20 craft beer metros:** Portland, Denver, San Diego, etc. 1,000 breweries. (~2 sprints)
3. **Phase 4 — Nationwide:** All 7,177 breweries with website URLs. (~3 sprints, heavily automated)
4. **Phase 5 — AI Managed (Barrel tier):** Premium feature for claimed breweries. (~2 sprints)

Each phase requires its own success criteria review before proceeding.

---

## Appendix A: Open Questions

1. **LLM provider:** Anthropic (Claude) for extraction? OpenAI? Cost-optimize with a smaller model for structured extraction? (Jordan and Riley to evaluate.)
2. **HTML storage:** Store raw HTML in Supabase Storage or just keep the URL? Storage cost vs. debugging value.
3. **Notification on claim:** When an unclaimed brewery gets claimed, should we email the new owner about barback-sourced beers, or just show it in the dashboard?
4. **User contribution model:** If a user says "I know what's on tap here," how does that interact with barback data? (Separate REQ, but think about it now.)
5. **Seasonal beer handling:** If a beer appears in winter but not summer, is it stale or seasonal? How do we differentiate?

---

*"From a business continuity standpoint, empty brewery listings are our biggest risk. The Barback fixes that — carefully, honestly, and with guardrails that would make Casey proud."*

— Sam, Business Analyst / QA Lead

---

## RTM Links

### Implementation
[scripts/barback-crawl.mjs](../../scripts/barback-crawl.mjs), [.github/workflows/barback.yml](../../.github/workflows/barback.yml)

### Tests
[cron-ai-suggestions.test.ts](../../lib/__tests__/cron-ai-suggestions.test.ts)

### History
- [retro](../history/retros/sprint-146-retro.md)
- [plan](../history/plans/sprint-79-plan.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
