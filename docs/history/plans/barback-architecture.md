# The Barback — Architectural Analysis
**Author:** Jordan (Architecture Lead)
**Date:** 2026-03-31
**Status:** PROPOSAL — not yet approved for sprint planning
**Reviewed by:** Nobody yet. This needs Riley, Casey, and Drew before a single migration ships.

---

> I had to take a walk before writing this one. An AI that crawls brewery websites and tells users what's on tap? If we get it wrong, someone drives to a brewery expecting a beer that doesn't exist. That's not a bug — that's a broken promise. So this document is going to be thorough, maybe uncomfortably so.

---

## 1. Database Schema

### 1.1 New Tables

#### `crawl_jobs`
The orchestration table. One row per crawl attempt per brewery.

```sql
CREATE TABLE crawl_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id    uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'fetching', 'parsing', 'reviewing', 'completed', 'failed', 'skipped')),
  source_url    text,                          -- actual URL crawled (may differ from brewery.website_url)
  http_status   int,                           -- response status code from fetch
  raw_html_hash text,                          -- SHA-256 of fetched HTML (skip re-parse if unchanged)
  raw_html_size int,                           -- bytes, for cost monitoring
  tokens_used   int,                           -- Claude API tokens consumed (input + output)
  cost_usd      numeric(8,6),                  -- estimated cost for this crawl
  beers_found   int DEFAULT 0,                 -- count of beers extracted
  beers_added   int DEFAULT 0,                 -- count promoted to production
  error_message text,                          -- if status = 'failed'
  retry_count   int DEFAULT 0,
  started_at    timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_crawl_jobs_brewery ON crawl_jobs(brewery_id);
CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_created ON crawl_jobs(created_at DESC);
```

#### `crawled_beers`
Staging table. Beers extracted by the AI live here until approved (automatically or manually). Never goes directly into `beers`.

```sql
CREATE TABLE crawled_beers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crawl_job_id    uuid NOT NULL REFERENCES crawl_jobs(id) ON DELETE CASCADE,
  brewery_id      uuid NOT NULL REFERENCES breweries(id) ON DELETE CASCADE,
  name            text NOT NULL,
  style           text,                        -- raw style from AI (mapped to BeerStyle on promotion)
  abv             numeric(4,2),
  ibu             int,
  description     text,
  confidence      numeric(3,2) NOT NULL DEFAULT 0.00,  -- 0.00–1.00, AI self-reported
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'promoted', 'stale')),
  matched_beer_id uuid REFERENCES beers(id),   -- if we matched to an existing beer
  source_text     text,                        -- the exact text snippet the AI extracted from
  promoted_at     timestamptz,
  rejected_at     timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_crawled_beers_brewery ON crawled_beers(brewery_id);
CREATE INDEX idx_crawled_beers_status ON crawled_beers(status);
CREATE INDEX idx_crawled_beers_job ON crawled_beers(crawl_job_id);
```

#### `crawl_sources`
Tracks per-brewery crawl configuration. Which URL to hit, how often, whether the site cooperates.

```sql
CREATE TABLE crawl_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brewery_id      uuid NOT NULL UNIQUE REFERENCES breweries(id) ON DELETE CASCADE,
  crawl_url       text,                        -- override URL (null = use brewery.website_url)
  crawl_enabled   boolean NOT NULL DEFAULT true,
  crawl_mode      text NOT NULL DEFAULT 'unclaimed'
                    CHECK (crawl_mode IN ('unclaimed', 'ai_managed', 'disabled')),
  robots_allowed  boolean DEFAULT true,        -- false = robots.txt blocks us, skip
  last_crawled_at timestamptz,
  last_html_hash  text,                        -- skip AI if HTML unchanged
  next_crawl_at   timestamptz,                 -- scheduler reads this
  crawl_interval  interval NOT NULL DEFAULT '7 days',
  consecutive_failures int DEFAULT 0,          -- circuit breaker
  notes           text,                        -- admin notes ("menu is a PDF", "site is a Facebook page")
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX idx_crawl_sources_next ON crawl_sources(next_crawl_at)
  WHERE crawl_enabled = true;
```

### 1.2 Columns Added to Existing Tables

#### `breweries` table
```sql
ALTER TABLE breweries
  ADD COLUMN data_source text DEFAULT 'manual'
    CHECK (data_source IN ('manual', 'seed', 'crawled', 'ai_managed')),
  ADD COLUMN last_crawled_at timestamptz,
  ADD COLUMN crawl_beer_count int DEFAULT 0;
```

- `data_source` tells us where this brewery's beer data comes from. `'seed'` = Open Brewery DB / Kaggle. `'crawled'` = The Barback found it. `'manual'` = a claimed owner or admin entered it. `'ai_managed'` = Barrel-tier auto-crawl.
- `last_crawled_at` denormalized for fast UI display ("Beer list updated 3 days ago via AI").
- `crawl_beer_count` denormalized count of active promoted crawled beers.

#### `beers` table
```sql
ALTER TABLE beers
  ADD COLUMN source text DEFAULT 'manual'
    CHECK (source IN ('manual', 'seed', 'crawled', 'ai_managed')),
  ADD COLUMN crawled_beer_id uuid REFERENCES crawled_beers(id),
  ADD COLUMN last_verified_at timestamptz;
```

- `source` tracks provenance. Critical for the claim handoff (section 6).
- `crawled_beer_id` links back to staging for audit trail.
- `last_verified_at` supports freshness (section 5).

### 1.3 The Claimed/Unclaimed Boundary at the Schema Level

The `crawl_sources.crawl_mode` column is the architectural boundary:
- `'unclaimed'` — we crawl it, we manage the data, `verified = false` on the brewery.
- `'ai_managed'` — Barrel-tier pays us to crawl for them, `verified = true`.
- `'disabled'` — claimed brewery manages their own data, we don't touch it.

RLS policy: `crawl_sources` is superadmin-only. No public reads or writes. `crawled_beers` same — staging data never leaks to the consumer app.

### 1.4 Migration Plan

This is **migration 051**. Single migration, single transaction. All tables + indexes + RLS policies. No data changes — pure schema.

---

## 2. Crawler Architecture

### 2.1 The Decision: Node Script (not Edge Function, not Supabase Cron)

**Why not Edge Functions?** The 150-second Supabase Edge Function timeout is a hard constraint. A single brewery crawl involves: HTTP fetch (1-5s), HTML cleaning (< 1s), Claude API call (3-15s), staging inserts. That's fine for one brewery. But a batch of 50? Edge Functions are per-request — we'd need an external orchestrator anyway.

**Why not Supabase cron (pg_cron)?** `pg_cron` can schedule SQL and Edge Function invocations. It's great for "run this query every hour." It's terrible for "fetch a website, call an external AI API, handle retries." Wrong tool.

**The answer: A Node.js script (`scripts/barback-crawl.mjs`) triggered by a GitHub Actions cron OR a local `npm run barback` command.**

This follows our existing pattern (`scripts/fetch-breweries.mjs`, `scripts/fetch-beers.mjs`). Same shape, same reliability model.

### 2.2 Script Architecture

```
scripts/barback-crawl.mjs
  |
  |-- 1. Query crawl_sources WHERE next_crawl_at <= now() AND crawl_enabled = true
  |      AND crawl_mode IN ('unclaimed', 'ai_managed')
  |      ORDER BY next_crawl_at ASC
  |      LIMIT 10                             -- batch size, configurable
  |
  |-- 2. For each brewery (sequential, not parallel):
  |      a. Check robots.txt (cached per domain, 24hr TTL)
  |      b. Fetch website_url (or crawl_sources.crawl_url override)
  |      c. Hash the HTML body
  |      d. If hash === last_html_hash → mark 'skipped', bump next_crawl_at, continue
  |      e. Clean HTML → text (strip scripts, styles, nav, footer)
  |      f. Call Claude API with extraction prompt
  |      g. Parse structured response → insert into crawled_beers
  |      h. Auto-approve beers with confidence >= 0.85
  |      i. Update crawl_sources (last_crawled_at, last_html_hash, next_crawl_at)
  |      j. Insert crawl_job record
  |      k. Wait 2 seconds (rate limit courtesy)
  |
  |-- 3. Promotion pass: crawled_beers WHERE status = 'approved' AND NOT promoted
  |      a. Match against existing beers by (brewery_id, normalized name)
  |      b. If match: update existing beer's last_verified_at
  |      c. If new: INSERT into beers with source = 'crawled'
  |      d. Mark crawled_beers.status = 'promoted'
  |
  |-- 4. Staleness pass: beers WHERE source = 'crawled'
  |      AND brewery_id IN (just-crawled breweries)
  |      AND id NOT IN (any crawled_beer promoted this run)
  |      → Mark is_active = false (NOT delete — see section 5)
  |
  |-- 5. Summary: log stats, optionally notify via Resend
```

### 2.3 Scheduling

**Charlotte pilot:** Manual runs via `npm run barback` or a weekly GitHub Actions cron:

```yaml
# .github/workflows/barback.yml
name: Barback Crawl
on:
  schedule:
    - cron: '0 6 * * 1'  # Every Monday at 6am UTC (2am ET)
  workflow_dispatch: {}    # Manual trigger button
```

Weekly is fine for 50 breweries. Tap lists change, but not daily at most places. And we'd rather be stale by 3 days than wrong by a single beer.

### 2.4 Rate Limiting & Retry

- **Per-host delay:** 2 seconds between requests to the same domain (almost all breweries are unique domains, but safety first).
- **Retry policy:** On HTTP 429 or 5xx, retry once after 30 seconds. On second failure, mark `status = 'failed'` and increment `consecutive_failures`.
- **Circuit breaker:** If `consecutive_failures >= 3`, set `crawl_enabled = false` and log a warning. Requires manual re-enable by a superadmin.
- **Timeout:** 10-second HTTP fetch timeout. If a brewery site takes longer, it's probably broken.

### 2.5 robots.txt Compliance

Before crawling any domain, fetch `{domain}/robots.txt` and check for `Disallow` rules. Cache the result for 24 hours. If disallowed, set `robots_allowed = false` on `crawl_sources` and skip. Log it.

We should also set a descriptive User-Agent: `HopTrack-Barback/1.0 (craft beer discovery; contact@hoptrack.app)`.

If a brewery blocks us, we respect it. Full stop. This isn't negotiable.

---

## 3. AI Parsing Strategy

### 3.1 The Prompt

This is the most important part. Bad prompt = hallucinated beer names = broken trust. Here's my draft:

```
You are extracting a beer/tap list from a brewery's website. You will receive
cleaned text content from the page.

Extract ONLY beers that are clearly listed as currently available (on tap, on
the menu, "our beers", etc). Do NOT invent beers. Do NOT guess. If you're
unsure whether something is a beer name or a heading/description, skip it.

For each beer, extract:
- name (required): the beer name exactly as written
- style: beer style if mentioned (e.g. IPA, Stout, Lager)
- abv: ABV percentage if listed (number only, e.g. 6.5)
- ibu: IBU if listed (number only)
- description: tasting notes or description if provided (1-2 sentences max)
- confidence: your confidence this is a real beer on their current menu (0.0-1.0)

Rules:
- If the page has no beer list or menu, return an empty array.
- If the page is a general "about" or "visit us" page with no beer data, return empty.
- Do NOT include merchandise, food items, or non-beer drinks unless they are
  explicitly labeled as cider or mead.
- Confidence guidelines:
  - 0.9+: clearly formatted tap list with name, style, ABV
  - 0.7-0.9: beer names listed but missing details (style/ABV)
  - 0.5-0.7: names that might be beers but context is ambiguous
  - Below 0.5: do not include

Return JSON array. No markdown. No explanation. Just the array.
```

### 3.2 Model Selection

Use **Claude 3.5 Haiku** (not Sonnet, not Opus). This is a structured extraction task — Haiku excels here and costs 1/10th of Sonnet. We already have the Anthropic SDK wired in from HopRoute.

### 3.3 HTML Cleaning Before Sending

The single biggest cost optimization: **don't send raw HTML.** Strip:
- `<script>`, `<style>`, `<noscript>`, `<svg>`, `<iframe>` tags entirely
- Navigation, header, footer elements (heuristic: `<nav>`, `<header>`, `<footer>`, common class names)
- HTML attributes (keep only text content)
- Collapse whitespace

Goal: a typical brewery website goes from ~50KB HTML to ~2-5KB of meaningful text. That's the difference between 15,000 tokens and 1,500 tokens per crawl.

We should use a library like `cheerio` (already available in Node.js context) for this.

### 3.4 Token Estimation & Prompt Structure

**Input per crawl:**
- System prompt: ~300 tokens (fixed)
- Cleaned website text: ~1,000-3,000 tokens (variable, cap at 4,000)
- Total input: ~1,500-4,300 tokens

**Output per crawl:**
- Typical tap list (10-15 beers): ~500-800 tokens
- Empty result: ~10 tokens

**Average per crawl:** ~3,000 input + ~600 output = ~3,600 tokens

### 3.5 Reducing AI Spend

1. **HTML hash deduplication** — if the page hasn't changed since last crawl, skip the AI call entirely. This alone will save 50-70% of API costs after the first run.
2. **Token cap** — if cleaned text exceeds 6,000 tokens, truncate to the most likely beer-list section (search for keywords: "tap", "menu", "beer", "on draft", "our beers").
3. **Batch window** — don't crawl all 50 in one run. 10 per day, staggered across the week.
4. **Haiku, not Sonnet** — non-negotiable for this use case.

---

## 4. Data Pipeline

### Stage 1: Fetch
```
crawl_sources → HTTP GET brewery website → raw HTML
                                         → crawl_jobs row (status: 'fetching')
```
- Respect robots.txt
- 10-second timeout
- Store HTTP status code
- Hash the raw HTML (SHA-256)

### Stage 2: Clean
```
raw HTML → strip scripts/styles/nav → clean text (~2-5KB)
         → compare hash to last_html_hash
         → if unchanged: status = 'skipped', done
```

### Stage 3: Extract (AI)
```
clean text → Claude Haiku prompt → JSON array of beers
           → crawl_jobs updated (status: 'parsing', tokens_used, cost_usd)
```
- Parse JSON response (handle malformed responses gracefully)
- If JSON parse fails: status = 'failed', error logged

### Stage 4: Stage
```
parsed beers → INSERT into crawled_beers
             → each beer gets confidence score from AI
             → crawl_jobs updated (status: 'reviewing', beers_found)
```

### Stage 5: Approve
```
crawled_beers WHERE confidence >= 0.85 → status = 'approved' (auto)
crawled_beers WHERE confidence < 0.85  → status = 'pending' (manual review)
```

For the pilot, I recommend **manual review for everything** the first 2-3 runs. We need to calibrate the confidence threshold against real data before we trust auto-approve.

### Stage 6: Promote
```
approved crawled_beers → match against existing beers (brewery_id + normalized name)
  → match found: UPDATE beers SET last_verified_at = now(), is_active = true
  → no match:    INSERT into beers (source = 'crawled', is_active = true)
  → crawled_beers.status = 'promoted'
  → crawl_jobs updated (status: 'completed', beers_added)
```

Name normalization: lowercase, trim, collapse whitespace, strip common suffixes ("(16oz)", "NEW!", etc.).

### Stage 7: Stale Check
```
beers WHERE source = 'crawled'
  AND brewery_id IN (just-crawled set)
  AND id NOT IN (promoted this run)
  → SET is_active = false   (NOT deleted — see section 5)
```

---

## 5. Freshness Model

This is where I got nervous enough to take that walk.

### 5.1 The Core Problem

A beer disappears from a website. It could mean:
1. The keg blew and they'll replace it tomorrow.
2. It was seasonal and it's gone for 6 months.
3. They rebuilt their website and forgot to update the menu.
4. Their website is broken and showing nothing.

We cannot distinguish between these. And the cost of showing a user a beer that doesn't exist is higher than the cost of not showing a beer that does exist. **Err toward removal.**

### 5.2 The Freshness Rules

| Scenario | Action |
|----------|--------|
| Beer found on current crawl | `is_active = true`, `last_verified_at = now()` |
| Beer NOT found, last verified < 7 days ago | No change (grace period) |
| Beer NOT found, last verified 7-14 days ago | `is_active = false` (soft removal) |
| Beer NOT found, last verified > 30 days ago | Eligible for hard deletion (batch job) |
| Crawl failed (HTTP error) | No changes to any beers — don't punish data for site issues |
| Crawl skipped (HTML unchanged) | Extend all `last_verified_at` timestamps |

### 5.3 UI Implications

Beers with `source = 'crawled'` and `is_active = false` should NOT show on the consumer-facing tap list. But they stay in the database for:
- Historical session/beer_log references (FK integrity)
- Potential re-appearance on next crawl
- Analytics ("this brewery used to serve X")

The brewery detail page should show a small note: "Beer list sourced from [brewery name]'s website. Last updated [date]." This is transparency. Drew would insist on it.

### 5.4 TTL and Crawl Intervals

| Context | Default Interval |
|---------|-----------------|
| Charlotte pilot (unclaimed) | 7 days |
| Barrel-tier AI Managed | 3 days |
| Brewery with frequent changes (detected) | 3 days |
| Brewery with stable menu (3+ unchanged crawls) | 14 days |

The `crawl_sources.crawl_interval` field is per-brewery, adjustable. The script honors it.

---

## 6. The Claimed/Unclaimed Boundary

### 6.1 Enforcement

The rule is simple: **if `brewery.verified = true`, The Barback does not touch it.** The query for crawl candidates starts with:

```sql
SELECT cs.* FROM crawl_sources cs
JOIN breweries b ON cs.brewery_id = b.id
WHERE b.verified = false
  AND cs.crawl_enabled = true
  AND cs.crawl_mode = 'unclaimed'
  AND cs.next_crawl_at <= now()
```

`verified = true` means a human claimed this brewery. Their data, their problem. We back off.

### 6.2 The Claim Handoff

When an unclaimed brewery (with crawled beers) gets claimed:

1. **Trigger:** `/api/brewery-claims` route approves a claim.
2. **Handoff steps:**
   a. `crawl_sources.crawl_mode` → `'disabled'`
   b. `crawl_sources.crawl_enabled` → `false`
   c. All `beers` where `source = 'crawled'` and `brewery_id = X`:
      - Keep them. Don't delete.
      - Change `source` → `'manual'` (owner now owns this data)
      - Set `last_verified_at` → `null` (owner should review)
   d. Email the new owner: "We found [N] beers on your website. Your tap list has been pre-populated. Review and update it in your dashboard."
   e. The onboarding wizard (Sprint 74) already handles fresh claims — it should detect pre-populated beers and skip the "Add Beers" step or show them for confirmation.

This is the killer feature of The Barback for GTM. Taylor should be jumping up and down: "Claim your brewery, your tap list is already there." That's the pitch.

### 6.3 Edge Cases

- **Brewery claims, then subscription lapses** — does crawl resume? **No.** Once claimed, always `crawl_mode = 'disabled'` for unclaimed crawling. Only `'ai_managed'` is available, and only if they re-subscribe to Barrel.
- **Brewery has both Kaggle seed beers AND crawled beers** — deduplication on promotion handles this. Name matching is the key. Kaggle beers have `source = 'seed'`, crawled beers get `source = 'crawled'`. If they match, we update the existing beer rather than creating a duplicate.
- **Superadmin manually adds beers to unclaimed brewery** — those beers have `source = 'manual'`. The Barback won't overwrite them. It will match by name and update `last_verified_at` if found on the website.

---

## 7. Premium "AI Managed" (Barrel Tier)

### 7.1 How It Differs

| Aspect | Unclaimed Crawling | Barrel-Tier AI Managed |
|--------|-------------------|----------------------|
| `crawl_mode` | `'unclaimed'` | `'ai_managed'` |
| `verified` | `false` | `true` |
| Frequency | Weekly (7 days) | Twice weekly (3 days) |
| Auto-approve threshold | 0.85 confidence | 0.80 (owner can review) |
| Owner notification | None (no owner) | Email digest of changes |
| Manual override | Superadmin only | Owner can pin/unpin beers |
| Beer source tag | `'crawled'` | `'ai_managed'` |
| Cost borne by | Us (platform cost) | Included in Barrel pricing |
| Kill switch | Superadmin | Owner toggle in dashboard |

### 7.2 Architectural Differences

The core pipeline is **identical**. Same script, same prompt, same staging table. The only differences:

1. **Query filter:** `crawl_mode = 'ai_managed'` instead of `'unclaimed'`.
2. **Verified check:** AI Managed skips the `verified = false` filter (obviously).
3. **Notification:** After each crawl, email the brewery owner a diff: "Added: [beer], Removed: [beer], Unchanged: [N] beers."
4. **Dashboard UI:** Barrel-tier breweries see a "Barback" tab in their admin showing crawl history, staged beers, and a toggle to enable/disable.
5. **Pinned beers:** Owners can "pin" beers that should never be auto-removed, even if The Barback doesn't find them on the website (seasonal specials they want to keep listed).

### 7.3 Billing Gate

The `barback-crawl.mjs` script checks `brewery_accounts.subscription_tier = 'barrel'` before crawling any `ai_managed` source. If subscription lapses, `crawl_mode` stays `'ai_managed'` but `crawl_enabled` flips to `false` via the Stripe webhook handler.

---

## 8. Charlotte Pilot Constraints

### 8.1 Scoping to Charlotte

The pilot targets Charlotte, NC breweries only. Two mechanisms:

**Mechanism 1: Seed the crawl_sources table with Charlotte breweries only.**

```sql
INSERT INTO crawl_sources (brewery_id, crawl_mode)
SELECT id, 'unclaimed'
FROM breweries
WHERE city ILIKE 'charlotte'
  AND state ILIKE '%north carolina%'
  AND verified = false
  AND website_url IS NOT NULL;
```

If a brewery isn't in `crawl_sources`, it doesn't get crawled. Simple. The script only reads from `crawl_sources`.

**Mechanism 2: Hardcoded pilot check in the script.**

```javascript
const PILOT_CITIES = ['charlotte'];
const PILOT_STATES = ['north carolina'];

// In the main loop, after fetching crawl candidates:
if (!PILOT_CITIES.includes(brewery.city?.toLowerCase()) ||
    !PILOT_STATES.includes(brewery.state?.toLowerCase())) {
  console.warn(`Skipping non-pilot brewery: ${brewery.name} (${brewery.city}, ${brewery.state})`);
  continue;
}
```

Belt and suspenders. Remove the hardcoded check when we're ready to go national.

### 8.2 Charlotte Brewery Count

From our Open Brewery DB data (migration 048), let me estimate: Charlotte, NC likely has 30-60 breweries with `website_url` populated. Not all will have parseable beer lists. Realistic expectation: **25-40 breweries with usable data.**

### 8.3 Kill Switch

```sql
-- Emergency: disable ALL Barback crawling
UPDATE crawl_sources SET crawl_enabled = false;
```

Also: the GitHub Actions workflow has `workflow_dispatch` — it only runs when triggered (manual or scheduled). Deleting the cron line stops it. No runaway crawls.

### 8.4 Monitoring

The script should output a structured summary:

```
[Barback] Run complete at 2026-04-07T06:02:14Z
  Breweries queried:  50
  Crawled:            38
  Skipped (no change): 8
  Failed:              4
  AI calls made:      38
  Tokens used:        136,800
  Estimated cost:     $0.034
  Beers found:        412
  Beers auto-approved: 367
  Beers pending review: 45
  Beers promoted:     312
  Beers marked stale:  18
```

This should also be stored in a `crawl_runs` summary table or emailed via Resend to the superadmin.

---

## 9. Cost Analysis

### 9.1 Claude API Costs (Haiku 3.5)

| Metric | Estimate |
|--------|----------|
| Input price | $0.25 / 1M tokens |
| Output price | $1.25 / 1M tokens |
| Avg input per crawl | ~3,000 tokens |
| Avg output per crawl | ~600 tokens |
| Input cost per crawl | $0.00075 |
| Output cost per crawl | $0.00075 |
| **Total per crawl** | **~$0.0015** |

### 9.2 Charlotte Pilot (50 breweries, weekly)

| Item | Monthly Cost |
|------|-------------|
| AI calls (50/week x 4.3 weeks) | ~215 calls x $0.0015 = **$0.32** |
| Minus hash-skip savings (~50%) | **~$0.16** |
| Supabase (existing plan, no increase) | $0 |
| GitHub Actions (< 5 min/run) | $0 (free tier) |
| **Total monthly (pilot)** | **< $0.50** |

That's nothing. Less than the cost of a single HopRoute generation. Joshua will be happy.

### 9.3 National Scale (7,177 breweries)

Assuming ~5,000 have parseable websites and weekly crawls:

| Item | Monthly Cost |
|------|-------------|
| AI calls (5,000/week x 4.3 = 21,500) | 21,500 x $0.0015 = **$32.25** |
| Minus hash-skip savings (~60% after first month) | **~$13** |
| Supabase compute increase | ~$5-10/mo (more rows, more queries) |
| GitHub Actions (larger runner) | ~$5/mo |
| **Total monthly (national)** | **~$25-30** |

For context: if we have just ONE Barrel-tier subscriber ($149+/mo), we're profitable on AI Managed crawling. And the unclaimed crawling is a customer acquisition cost — if it converts even one brewery claim per month, the ROI is infinite.

### 9.4 Cost Safeguards

- **Per-run token budget:** Hard cap at 500,000 tokens per run. Script aborts if exceeded.
- **Per-crawl token cap:** If cleaned HTML exceeds 8,000 tokens, truncate. Don't send novels to Claude.
- **Monthly budget alert:** If `SUM(cost_usd) FROM crawl_jobs WHERE created_at > now() - interval '30 days'` exceeds $50, email the superadmin.

---

## 10. Risks and Mitigations

### 10.1 AI Hallucination of Beer Names

**Risk:** Claude invents a beer that doesn't exist. User checks in to it. Data integrity is shot.

**Mitigation:**
- Prompt explicitly says "Do NOT invent beers."
- Confidence scoring with manual review for anything < 0.85.
- `source_text` column on `crawled_beers` stores the exact text the AI extracted from — audit trail.
- First 2-3 runs of the pilot: **100% manual review**. No auto-approve until we trust the output.
- Periodic spot-check: superadmin picks 10 random crawled beers, visits the brewery website, verifies.

This is my biggest concern. I would rather ship late with trustworthy data than ship fast with hallucinated beer lists.

### 10.2 Brewery Websites That Don't Have Beer Lists

**Risk:** Many brewery websites are marketing-only. No tap list. The AI returns an empty array and we wasted a crawl.

**Mitigation:**
- After 3 consecutive empty crawls, increase the interval to 30 days.
- `crawl_sources.notes` field for admin annotations: "no beer list on site", "menu is a PDF", "site is a Facebook page".
- Long-term: detect common patterns (Untappd embeds, PDF menus, Facebook redirects) and handle them differently.

### 10.3 PDF Menus

**Risk:** Many breweries put their beer list in a PDF, not HTML. Our HTML crawler can't read it.

**Mitigation:** Out of scope for the pilot. Log it in `crawl_sources.notes`. Revisit when we have a PDF-to-text pipeline. This is a v2 feature.

### 10.4 JavaScript-Rendered Tap Lists

**Risk:** Some brewery sites use React/Vue/etc and the beer list loads via client-side JS. A simple HTTP fetch returns an empty shell.

**Mitigation:** Out of scope for the pilot. Log the failure. Revisit with a headless browser approach (Puppeteer/Playwright) if many Charlotte breweries are affected. My gut says most small brewery sites are simple WordPress/Squarespace — not SPAs.

### 10.5 Rate Limiting / IP Blocking from Hosts

**Risk:** Brewery hosting providers (Squarespace, Wix, WordPress.com) block our crawler IP.

**Mitigation:**
- 2-second delay between requests.
- Descriptive User-Agent.
- robots.txt compliance.
- Sequential (not parallel) crawling.
- If blocked: back off, log it, don't retry for 24 hours.
- At 50 breweries/week, we're making ~50 HTTP requests over ~2 minutes. No hosting provider will care.

### 10.6 Legal Considerations

**Risk:** Is scraping brewery websites legal?

**Mitigation:**
- We're reading publicly available information (tap lists) for the purpose of directing customers TO the brewery. This is directionally the same as Google indexing their menu.
- We respect robots.txt.
- We link back to the source ("Beer list sourced from [brewery website]").
- We stop crawling immediately when a brewery claims their listing.
- We stop crawling if they ask us to (add an opt-out mechanism: email contact, or a meta tag we check).
- Not legal advice. Talk to a lawyer before going national. For 50 Charlotte breweries in a pilot? The risk is negligible.

### 10.7 Data Drift Between Crawls

**Risk:** A brewery changes their tap list on Wednesday. We crawl on Monday. For 6 days, our data is wrong.

**Mitigation:**
- This is the fundamental trade-off. We accept staleness in exchange for automation.
- The UI must communicate this: "Last updated [date]" on every crawled beer list.
- Users can report incorrect data (future feature: "Is this beer still available?" button).
- Barrel-tier gets 3-day intervals to reduce drift.

### 10.8 The Barback Breaks During a Crawl

**Risk:** Script crashes mid-run. Half the breweries are updated, half aren't.

**Mitigation:**
- Each brewery is an independent crawl_job. If the script crashes after brewery #25, breweries 1-25 have data and 26-50 simply don't get updated this run. No partial state within a single brewery.
- Idempotent design: running the script twice with the same HTML produces the same result (hash check skips the second run).
- `crawl_jobs` has `status` tracking — easy to query what happened.

---

## 11. Implementation Order

If this gets greenlit for Sprint 79+, here's the order I'd want Avery to build it:

1. **Migration 051:** Schema only (tables, indexes, RLS). Ship it, apply it, verify.
2. **`scripts/barback-crawl.mjs`:** Core script — fetch, clean, extract, stage. No promotion yet. Run it against 5 Charlotte breweries manually. **Review the output with Drew.**
3. **Promotion logic:** Add the staging-to-production pipeline. Run against all Charlotte breweries. Manual review every beer.
4. **Freshness/staleness:** Add the stale-check pass. Run for 2 weeks. Verify no false removals.
5. **Auto-approve:** Once we trust the confidence scores (after ~3 manual review cycles), enable auto-approve at 0.85.
6. **GitHub Actions cron:** Automate weekly runs.
7. **Superadmin dashboard:** View crawl history, review pending beers, override decisions.
8. **Claim handoff:** Wire into the existing claim flow.
9. **Barrel-tier AI Managed:** Only after unclaimed crawling is stable for 4+ weeks.

That's at least 3 sprints of work. Don't rush it. Data accuracy over velocity.

---

## 12. Open Questions

These need answers before we build:

1. **Charlotte brewery count with websites** — How many of our Charlotte, NC breweries actually have `website_url` populated? Need to query the DB.
2. **PDF menu prevalence** — How many Charlotte breweries use PDF menus? Someone should manually check 10 sites.
3. **Anthropic API key budget** — Does Joshua want a separate API key for Barback vs HopRoute? Separate billing visibility would be nice.
4. **Superadmin review UI** — Do we build a dedicated Barback admin page, or add a tab to the existing superadmin?
5. **User-facing attribution** — Exact copy for "Beer list sourced from..." text. Jamie should own this.
6. **Opt-out mechanism** — If a brewery emails us saying "stop scraping my site," what's the process? Manual `crawl_enabled = false`? A meta tag?
7. **Deduplication with Kaggle data** — Our 2,361 Kaggle beers are already in the DB. The Barback will find some of the same beers on websites. How aggressive should name matching be?

---

*I've been thinking about this for hours and I'm still nervous about the hallucination risk. But the GTM story is undeniable — "claim your brewery, your tap list is already there" is the kind of thing that makes Taylor's pitch effortless. We just have to get the data right. No shortcuts on accuracy.*

*— Jordan*
