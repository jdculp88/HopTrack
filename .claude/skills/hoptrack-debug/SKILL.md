---
name: hoptrack-debug
description: HopTrack debugging playbook and systematic diagnostic order — THE rule is "check CI first" (Sprint 173 lesson — CI was silently red for 106 runs while retros claimed green), then check browser console, then server logs, then database state, then reproduce locally, then add logging. Covers how to diagnose build failures, test failures, CI failures, runtime errors, API 500s, data inconsistencies, missing features, and "it worked yesterday". Includes the GoDaddy-parked-page decoding story (if an HTTP response has `class="x"` and `gd-ad-flex-parent`, the domain doesn't have an app deployed). Use AGGRESSIVELY whenever anything is broken, failing, returning wrong data, timing out, or behaving unexpectedly. Also use for "it used to work", "CI is red", "tests are failing", "something's wrong", or any investigation task. Pushy loading because the #1 debugging mistake is guessing instead of systematically checking.
---

# HopTrack Debug Playbook

The systematic order of operations when something is broken. Learned the hard way from Sprint 173 where CI was silently red for 9 days because nobody was actually checking.

## The Golden Rule: Check Before Guessing

Every debug session should go through this checklist IN ORDER. Do not skip steps. Do not guess. The answer is almost always in one of these layers.

## Step 1: Check CI First (The S173 Rule)

```bash
gh run list --workflow=CI --limit 5 --json conclusion,headSha,displayTitle --jq '.[] | "\(.conclusion // "pending") \(.headSha[:7]) \(.displayTitle)"'
```

**Expected output when healthy:**
```
success abc1234 feat(S174): new feature
success def5678 docs: update README
```

**If you see `failure` or `cancelled` on recent runs:** CI has been broken. That might BE the "something is wrong" you're debugging. Investigate CI before assuming the issue is in your current change.

**Why this is rule #1:** Multiple sprint retros claimed CI was green when it wasn't. The team conflated "I ran it locally" with "the GitHub Actions workflow concludes success." Those are different things. "Green" means the green checkmark in GitHub, not `exit 0` on your laptop.

## Step 2: What Layer Is The Bug In?

| Symptom | Layer | Check This First |
|---|---|---|
| Build fails | Node/TypeScript/Next.js | `npm run build` locally with `unset .env.local` vars |
| Lint fails | ESLint | `npm run lint -- --quiet` (errors only) |
| Type check fails | tsc | `npx tsc --noEmit` (see test file type errors) |
| Tests fail | Vitest/Playwright | `npm test -- --run <file>` for isolation |
| CI fails but local passes | CI env mismatch | Check `.github/workflows/ci.yml` env vars vs local |
| Runtime error in browser | React/Component | Browser DevTools console (see Step 3) |
| API 500 error | Server/Supabase | Server logs + Supabase logs (see Step 4) |
| Data looks wrong | Database | Direct SQL query in Supabase SQL Editor |
| "It worked yesterday" | Recent commits | `git log --oneline -20` + `git bisect` if serious |
| Missing feature | Feature flag/Tier gate | Check `lib/stripe.ts` FEATURE_MATRIX + tier checks |

## Step 3: Browser Console (Client-Side Issues)

Open DevTools → Console. Claude Preview has `preview_console_logs` for automation.

**Red flags:**
- React warnings about keys, hooks, state updates
- `Hydration mismatch` errors → check for `typeof window !== 'undefined'` issues or Date.now() at render (S173 `AchievementBadge` lesson — use `useState(() => Date.now())`)
- CORS errors → check `next.config.ts` headers
- 401/403 on API calls → check `requireAuth()` usage + session state
- Supabase PostgREST errors → check RLS policies + foreign key relationships

**Network tab checks:**
- Request URL correct?
- Request payload correct shape?
- Response status code?
- Response body — is it the GoDaddy parked page? (see below)

## Step 4: Server Logs (API + SSR Issues)

```bash
# Local dev
npm run dev
# Logs print to the terminal running this

# Production (Vercel)
vercel logs <deployment-url>

# Supabase dashboard
# Project → Logs → API / Postgres / Auth
```

**Red flags:**
- `HANGING_PROMISE_REJECTION` — async function not awaited
- `cookies() rejects when prerender is complete` — dynamic route being prerendered (S173 CI build lesson — needs dummy env vars or force-dynamic)
- `PGRST...` errors — Supabase PostgREST → RLS or FK issue
- `Missing env var` — check `.env.local` AND CI env block in `ci.yml`
- 1000-row cap → S153 lesson, use `.limit(50000)` or `{ count: "exact", head: true }`

## Step 5: Database State (Data Issues)

If the issue is "the data looks wrong" or "this query returns nothing":

```sql
-- Verify row counts
SELECT count(*) FROM table_name WHERE ...;

-- Check RLS state
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'your_table';

-- Check foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint WHERE contype = 'f' AND conrelid::regclass::text = 'your_table';

-- Check migration state (S173 diagnostic)
SELECT count(*) AS migrations, max(version) AS latest
FROM supabase_migrations.schema_migrations;
```

Run in Supabase Dashboard → SQL Editor.

**Common gotchas:**
- 1000-row cap in PostgREST (fix: `max_rows = 10000` in `supabase/config.toml`, S155)
- Missing index on a JOIN column → slow query
- RLS blocking expected rows → check `auth.uid()` context
- Future-dated seed data (S155 lesson) inflating stats

## Step 6: Reproduce Locally

If all the above looks clean but the bug is real:

```bash
# Fresh install, no cached state
rm -rf node_modules .next
npm install
npm run build  # catches build-time issues
npm run dev

# Try the exact user flow that triggers the bug
```

**If it still reproduces:** add logging (Step 7). If it doesn't reproduce: check environment (prod vs local env vars, different Supabase instance, auth state).

## Step 7: Add Logging (Last Resort)

Strategic logging, not shotgun logging:

```typescript
// At the BOUNDARY where data enters/exits
console.log('[debug] fetchBeers input:', { breweryId, filters })
const result = await supabase.from('beers')...
console.log('[debug] fetchBeers result:', { count: result.data?.length, error: result.error })
```

Remove logging before committing (there's no hook for this yet — Alex + Jordan have opinions about leftover console.logs).

## Decoding Mysterious HTTP Responses (S173 lesson)

If an HTTP response body looks weird, decode the HTML signature:

| Signature | What it means |
|---|---|
| `class="x"`, `.c1-*` glamor CSS, Adobe Source Sans Pro, Montserrat, `gd-ad-flex-parent` | **GoDaddy parked domain** — the domain doesn't have an app deployed. The S173 cron workflows were failing because the secrets pointed at `hoptrack.beer` which Joshua bought but hasn't deployed to. |
| `class="fl-*"`, Namecheap logo | Namecheap parked page |
| `server: cloudflare` + 1020 error | Cloudflare blocking (IP, user-agent, rate limit) |
| Empty body + 204 | Success, no content |
| HTML with `<meta name="robots">` | Probably a marketing/landing page — wrong URL |

## The "It Worked Yesterday" Playbook

```bash
# Find what changed since "yesterday"
git log --oneline --since="2 days ago"

# Identify the commit that broke it via git bisect
git bisect start
git bisect bad HEAD
git bisect good <last-known-good-sha>
# Run the test / check the behavior at each step
# git bisect good or git bisect bad until git points at the culprit

git bisect reset
```

## The CI-Passes-Locally-Fails Playbook

S173 had 3 of these in a row. Usually one of these:

1. **Missing CI env var** — `.env.local` has something CI doesn't. Example: `SUPABASE_SERVICE_ROLE_KEY` needed at build time for static prerender of `/superadmin/barback`. Fix in `.github/workflows/ci.yml` Build step env block.

2. **Different Node version** — check `package.json` engines field and `.github/workflows/ci.yml` setup-node version.

3. **Port conflict** — S173 Playwright lesson. If a CI step starts a server and another step tries to use port 3000, configure `reuseExistingServer: true`.

4. **Ephemeral test data missing** — `hoptrack-staging` is empty, E2E fails in CI but not locally because you're not running E2E locally. See `memory/feedback_staging_supabase_empty.md`.

5. **Pre-existing errors uncovered** — if CI was red for a while (S173 case), fixing the top error can reveal a lower one that's been there for sprints. Keep peeling the onion.

## Production Incident Order (When You're Live)

Not applicable yet, but documenting for the future:

1. **Triage severity** — Drew's P0 list is gospel (tap list accuracy, no browser dialogs, loyalty editing, photo uploads, analytics accuracy)
2. **Acknowledge** — Joshua + Morgan + Casey in a thread
3. **Check status dashboards** — Vercel, Supabase, Sentry
4. **Roll back if possible** — `vercel rollback <url>` is fast
5. **Post-mortem** — runbook in `docs/launch-day-ops.md`

## Related Skills

- **`hoptrack-testing`** — how to write the test that catches a bug (add a regression test for every fix)
- **`hoptrack-codebase-map`** — where to look for a file
- **`hoptrack-conventions`** — what patterns should be in place (often the fix is "use the existing pattern")
- **`supabase-migration`** — if the debug leads to a schema change

## The Never-Again List (S173)

- Never claim "CI green" without running `gh run list` and seeing the actual green checkmark
- Never let "pre-existing, not ours" errors live for 6 sprints
- Never let lint warnings bury lint errors (we have `--quiet` guard now)
- Never guess the endpoint URL — decode the response body if it looks weird
- Never let hooks race job timeouts (Playwright `--global-timeout` vs GH `timeout-minutes`)
