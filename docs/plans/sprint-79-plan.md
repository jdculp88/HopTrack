# Sprint 79 — Brewery Value + The Barback Pilot

**Sprint:** 79
**Arc:** Stick Around (Sprints 79-84) — Retention before churn starts
**Theme:** Show brewery owners ROI + plant the seed for automated data enrichment
**Date:** 2026-03-31
**Planned by:** Morgan (PM) + Sage (PM Assistant)
**Architecture review:** Jordan
**Requirements:** Sam (REQ-071)

---

## Sprint Goals

| # | Goal | Feature | Size | Owner |
|---|------|---------|------|-------|
| 1 | **Brewery Value** | F-007: Weekly Digest Emails | M | Avery (build), Quinn (email trigger migration), Jamie (email template copy) |
| 2 | **Brewery Value** | F-010: ROI Dashboard Card | S | Avery (build), Alex (design), Taylor (ROI calculation logic) |
| 3 | **Data Enrichment** | The Barback — Pilot Foundation | M | Avery (script), Jordan (architecture review), Quinn (migration 051), Casey (QA) |

---

## Goal 1: Weekly Digest Emails (F-007)

**Why:** SMB SaaS churn is 31-58% annually. The #1 retention tool is showing value without requiring login. A weekly email saying "42 check-ins this week, your Hazy IPA is trending" keeps brewery owners engaged.

**What we're building:**
- New email template in `lib/email-templates/`: `weekly-digest` — branded, data-rich, mobile-friendly
- New API route: `/api/brewery/[brewery_id]/digest` — generates digest data (visits, top beers, loyalty redemptions, new regulars, week-over-week comparison)
- New trigger in `lib/email-triggers.ts`: `onWeeklyDigest()` — sends to all claimed breweries with activity
- GitHub Actions cron job: `weekly-digest.yml` — fires every Monday 9am ET
- Brewery dashboard: "Email Reports" toggle in settings (opt-out, not opt-in — default ON)

**Key metrics in the digest:**
- Total check-ins this week (vs. last week)
- Top 3 beers by check-in count
- New unique visitors
- Loyalty stamp redemptions
- "Your week at a glance" hero stat

**Dependencies:** F-002 (Email Infrastructure — Sprint 75) ✅ complete

**Acceptance criteria:**
- [ ] Email template renders correctly in Gmail, Apple Mail, Outlook (test with Resend preview)
- [ ] Digest includes real data from the brewery's activity
- [ ] Week-over-week comparison shows directional arrows (up/down/flat)
- [ ] Brewery owners can opt out from dashboard settings
- [ ] Empty weeks send a softer message ("Quiet week — here's how to drive traffic")
- [ ] Cron job runs reliably on schedule

---

## Goal 2: ROI Dashboard Card (F-010)

**Why:** If brewery owners can see the money, they stay. A simple card on the dashboard that says "Your loyalty program drove 23 repeat visits this month, worth an estimated $345 in revenue" is the single best defense against churn.

**What we're building:**
- New component: `components/brewery-admin/ROIDashboardCard.tsx`
- Calculation logic: `lib/roi.ts` — estimates revenue impact from loyalty program activity
- Wired into the existing brewery dashboard (Today's Snapshot section)

**ROI calculation (Taylor-approved):**
- Repeat visit value = average craft brewery spend per visit ($35 industry average, configurable per brewery)
- Loyalty-driven visits = visits where a loyalty stamp was earned this month
- ROI = (loyalty-driven visits × avg spend) - subscription cost
- Display: "Your HopTrack subscription paid for itself X times over this month"

**Design (Alex):**
- Gold accent card with `card-bg-stats` background
- Big hero number (ROI multiple or dollar value)
- Sparkline trend (last 4 weeks)
- Subtle "How we calculate this" tooltip

**Acceptance criteria:**
- [ ] ROI card visible on brewery dashboard for all claimed breweries
- [ ] Shows real data (not placeholder) — falls back to "Not enough data yet" for new claims
- [ ] Calculation methodology documented in tooltip
- [ ] Mobile-responsive (stacks properly on small screens)
- [ ] Handles edge cases: zero activity, trial period, no loyalty program configured

---

## Goal 3: The Barback — Pilot Foundation (REQ-071)

**Why:** 92% of our 7,177 breweries have zero beers. Empty listings kill user trust. Joshua's vision: a slow, persistent crawler that keeps unclaimed brewery data fresh — but NEVER touches claimed breweries.

**Full requirements:** `docs/requirements/REQ-071-the-barback-ai-beer-crawler.md` (Sam)
**Architecture:** `docs/plans/barback-architecture.md` (Jordan)

**What we're building this sprint (pilot foundation only):**

### 3a. Migration 051 — Barback Schema
- `crawl_jobs` table (orchestration)
- `crawled_beers` table (staging — beers never go directly to production)
- `crawl_sources` table (per-brewery crawl config)
- New columns on `beers`: `source`, `crawled_beer_id`, `last_verified_at`
- New columns on `breweries`: `data_source`, `last_crawled_at`, `crawl_beer_count`
- RLS policies: superadmin-only on all Barback tables
- Tag Sprint 78 Kaggle beers with `source = 'seed'`

### 3b. Barback Crawl Script — `scripts/barback-crawl.mjs`
- Fetch Charlotte metro breweries from `crawl_sources`
- robots.txt compliance (cache per domain, 24hr TTL)
- HTML fetch with 10s timeout, SHA-256 hash for change detection
- HTML cleaning (strip scripts/styles/nav → ~2-5KB text)
- Claude Haiku extraction (structured beer data: name, style, ABV, IBU, description, confidence)
- Stage results to `crawled_beers` (never direct to `beers`)
- Crawl logging to `crawl_jobs`
- 2-second inter-request delay (polite)
- `HopTrack-Barback/1.0` User-Agent
- Hardcoded Charlotte metro pilot check (belt + suspenders)

### 3c. Charlotte Metro Pilot Seed
- Seed `crawl_sources` with ~50 unclaimed Charlotte metro breweries that have `website_url`
  - Charlotte: 27 breweries (23 with URLs)
  - Concord, Cornelius, Mooresville, Huntersville, Mint Hill, Gastonia, Fort Mill, Rock Hill, Indian Trail, Mount Holly: ~25 breweries
- First run: manual via `npm run barback`
- ALL results require superadmin manual review (no auto-approve for pilot)

### 3d. Superadmin Review UI
- New page: `/superadmin/barback/` — table of staged beers with approve/reject/edit controls
- Crawl history log (last N runs, success rate, cost)
- Quick actions: trigger crawl, blocklist a brewery, view source HTML

**What we are NOT building this sprint:**
- Auto-approve (manual review only)
- Freshness/staleness rules (v2)
- User "not here" reporting (v2)
- Consumer-facing "Last verified" labels (v2 — after we trust the data)
- AI Managed (Barrel tier) — post-pilot
- GitHub Actions cron — manual runs only until we trust it

**Pilot success criteria (from REQ-071):**
- >= 70% of targeted breweries yield at least 1 beer
- >= 80% extraction precision (manual review)
- Total pilot cost < $50 in API tokens
- Zero brewery opt-out complaints
- Superadmin can review a batch in < 30 minutes

---

## Team Assignments

| Person | Sprint 79 Focus |
|--------|----------------|
| **Morgan** | Sprint coordination, priority calls, pilot scope decisions |
| **Sage** | Sprint plan, retro prep, ticket tracking |
| **Avery** | F-007 (digest emails), F-010 (ROI card), Barback script |
| **Jordan** | Architecture review on all three goals, Barback prompt tuning |
| **Quinn** | Migration 051 (Barback schema), digest email trigger |
| **Alex** | ROI card design, digest email visual design |
| **Casey** | QA on all three goals, Barback output validation |
| **Jamie** | Digest email copy, "sourced from" attribution copy |
| **Taylor** | ROI calculation methodology, GTM pitch for "tap list is already there" |
| **Drew** | Charlotte brewery validation — spot-check 10 crawl results against real websites |
| **Riley** | Infra review on Barback (Supabase load, storage decisions) |
| **Sam** | REQ-071 owner, acceptance criteria validation, pilot success measurement |
| **Reese** | Test coverage for digest API, ROI calculation |

---

## Sprint 79 Exit Criteria

- [ ] Weekly digest emails send to claimed breweries with real data
- [ ] ROI dashboard card visible and calculating on brewery dashboard
- [ ] Migration 051 applied — Barback schema live
- [ ] `scripts/barback-crawl.mjs` runs successfully against Charlotte metro breweries
- [ ] At least one manual crawl run reviewed by superadmin + Drew
- [ ] Barback staged beers reviewable at `/superadmin/barback/`
- [ ] All three goals pass Casey's QA

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Charlotte breweries mostly use PDF menus (not HTML) | Log and skip — we accept fewer results. If < 30% success, expand pilot to include nearby metros. |
| LLM hallucination in beer extraction | 100% manual review for pilot. `source_text` audit trail. Drew spot-checks against real sites. |
| Digest emails look bad in Outlook | Use Resend preview, test across 3 clients before shipping |
| ROI calculation feels inaccurate to brewery owners | Taylor writes defensible methodology. Tooltip explains inputs. Conservative estimates. |

---

## Notes

- **Jordan's architecture doc is the source of truth** for Barback technical decisions: `docs/plans/barback-architecture.md`
- **Sam's REQ-071 is the source of truth** for Barback business rules: `docs/requirements/REQ-071-the-barback-ai-beer-crawler.md`
- The Barback is a multi-sprint initiative. Sprint 79 = foundation + first crawl. Sprint 80+ = automation, freshness, consumer UI, claim handoff.
- Joshua's key insight: claimed = owner manages. Unclaimed = we enrich. Premium = AI assists. This three-tier model guides everything.

---

*"Three goals. Retention + enrichment. We show brewery owners the money, and we start filling the empty shelves. Sprint 79 is where the data comes alive."*

— Morgan 🗂️
