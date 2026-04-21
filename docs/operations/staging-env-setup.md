# HopTrack Staging Environment Setup

**Owner:** Riley (Infrastructure)
**Date:** 2026-03-24 (drafted) · 2026-04-21 (activated)
**Status:** ✅ Provisioned and baselined — staging schema matches prod as of 2026-04-21

## Quick reference

| Field | Staging | Production |
|---|---|---|
| Project name | `hoptrack-staging` | `HopTrack` |
| Project ref | `qhznhxyhwqmqfdaqebla` | `uadjtanoyvalnmlbnzxk` |
| URL | `https://qhznhxyhwqmqfdaqebla.supabase.co` | `https://uadjtanoyvalnmlbnzxk.supabase.co` |
| Region | East US (N. Virginia) / us-east-1 | East US (Ohio) / us-east-2 |
| Dashboard | [supabase.com/dashboard/project/qhznhxyhwqmqfdaqebla](https://supabase.com/dashboard/project/qhznhxyhwqmqfdaqebla) | [supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk](https://supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk) |
| Credentials | 1Password — HopTrack Engineering > Staging Supabase | 1Password — HopTrack Engineering > Production Supabase |

**Region mismatch noted** — staging is us-east-1, prod is us-east-2. Not blocking (pre-launch, no real users), but worth matching regions before real traffic. Recreating staging in us-east-2 is cheap (disposable project) and can happen any time.

## About migration 000_baseline.sql

Created 2026-04-21 during staging activation. The migration chain (001-120) was not self-contained — it assumed foundational tables (`breweries`, `profiles`, `beers`, etc.) already existed, because those were created by hand in the Supabase UI back in March 2026 before the migration discipline started. Staging exposed the gap because it was the first time the chain ran against a fresh DB.

`000_baseline.sql` is a pg_dump of prod's public schema at activation time. It:
- Captures the 72 tables that pre-dated the migration chain
- Resets the public schema (DROP CASCADE) at the top — safe because downstream environments should have this migration marked applied in their tracker, causing `supabase db push` to skip it
- Enables the `pg_trgm` extension in the public schema (prod convention, used by smart-search GIN indexes)

**Both prod and staging have 000_baseline.sql marked as applied** in their respective `supabase_migrations.schema_migrations` trackers. `supabase db push` will never re-run it. Only if someone manually executes the SQL file would the DROP fire — avoid doing that unless you know what you're doing.



---

## Overview

HopTrack maintains two Supabase environments: **staging** and **production**.

The staging environment is the integration point for all development work. Every database migration is tested against staging before it touches production. All seed data runs against staging or local only.

**Core rules:**
- Never run seeds against production
- Never test migrations directly against production
- Never commit production credentials to git
- If you are unsure which environment you are pointing at, check your `.env.local` before running any database commands

---

## Environment Files

Three environment files govern which Supabase project the app connects to:

```
.env.local          — local development (points to staging Supabase by default)
.env.staging        — staging environment variables
.env.production     — production environment variables (NEVER committed to git)
```

`.env.local` and `.env.production` are in `.gitignore`. Only `.env.staging` may be committed, and it must never contain the `SUPABASE_SERVICE_ROLE_KEY`.

### .env.local (template — copy and fill in)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[STAGING_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[STAGING_SERVICE_ROLE_KEY]
NEXT_PUBLIC_ENV=development
```

### .env.staging

```env
NEXT_PUBLIC_SUPABASE_URL=https://[STAGING_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]
NEXT_PUBLIC_ENV=staging
# SUPABASE_SERVICE_ROLE_KEY is never committed — set in CI/CD secrets
```

### .env.production

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROD_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PROD_ANON_KEY]
NEXT_PUBLIC_ENV=production
# SUPABASE_SERVICE_ROLE_KEY is never committed — set in CI/CD secrets
```

---

## Required Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL. Safe to expose to the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon/public key. Safe to expose — RLS enforces access control. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Bypasses RLS. Never prefix with `NEXT_PUBLIC_`. Never commit. |

> **Important:** Any variable prefixed with `NEXT_PUBLIC_` is bundled into the client-side JavaScript and visible to anyone who inspects the browser. The `SUPABASE_SERVICE_ROLE_KEY` must never have this prefix and must only be used in server-side code (`app/api/`, `server actions`, `getServerSideProps`).

---

## npm Scripts

Add the following to `package.json` under `"scripts"`:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:staging": "NEXT_PUBLIC_ENV=staging next dev",
    "dev:prod": "NEXT_PUBLIC_ENV=production next dev",
    "db:migrate:staging": "supabase db push --project-ref [STAGING_REF]",
    "db:migrate:prod": "supabase db push --project-ref [PROD_REF]",
    "db:seed:staging": "supabase db reset --project-ref [STAGING_REF]",
    "db:reset:local": "supabase db reset"
  }
}
```

Replace `[STAGING_REF]` and `[PROD_REF]` with the actual Supabase project reference IDs (found in the Supabase dashboard URL: `app.supabase.com/project/[REF]`).

**Note:** `db:seed:staging` and `db:reset:local` are intentionally absent for production. There is no `db:seed:prod` script. This is by design.

---

## Migration Promotion Workflow

All database schema changes follow this exact sequence. No exceptions.

```
Write migration → Test on staging → Verify in staging app → Promote to production
```

### Step-by-step

**1. Write the migration**

Create a new migration file in `supabase/migrations/`:

```bash
supabase migration new <descriptive_name>
```

This creates `supabase/migrations/[timestamp]_<descriptive_name>.sql`. Write your SQL in this file.

**2. Test against staging**

```bash
npm run db:migrate:staging
```

Watch the output. If the migration fails, fix the SQL and re-run. Do not proceed until staging succeeds.

**3. Verify in the staging app**

Open the staging app URL and test the feature or change that the migration supports. Confirm:
- New columns/tables appear as expected
- Existing data is not corrupted
- RLS policies behave correctly
- The app does not throw errors related to the schema change

**4. Promote to production**

Only after staging verification is complete:

```bash
npm run db:migrate:prod
```

**5. Never skip staging**

If you are tempted to run a migration directly against production because it is "just a small change" — do not. Every production incident involving a bad migration started with someone who thought it was a small change.

---

## Seed Data Policy

### Seeds Are Staging/Local Only

The seed files in `supabase/seeds/` (001 through 006) exist to populate a development or staging environment with realistic test data. They are:

- Safe to run against local development
- Safe to run against staging
- **Never to be run against production**

Production gets real data from real users. Seeded data in production would corrupt analytics, pollute check-in history, and create fake breweries visible to real consumers.

### Current Seed Files

| File | Contents |
|---|---|
| `001_...` | Base brewery data |
| `002_...` | Beer catalog |
| `003_...` | User accounts (test users) |
| `004_...` | Check-ins |
| `005_...` | Loyalty program data |
| `006_...` | Analytics / review data |

*(Update this table as seeds are added or renamed.)*

### Resetting Staging

To fully reset the staging database (drop all data and re-run migrations + seeds):

```bash
npm run db:seed:staging
```

This is a destructive operation on staging. It is safe because staging contains no real user data. Confirm you are pointed at staging before running this.

---

## Setting Up a New Development Machine

Follow these steps in order when onboarding a new developer or setting up a new machine.

### Step 1: Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

Verify installation:

```bash
supabase --version
```

### Step 2: Install project dependencies

```bash
cd /path/to/hoptrack
npm install
```

### Step 3: Copy the .env.local template

Retrieve the staging credentials from 1Password (vault: HopTrack Engineering > Staging Supabase).

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — staging project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — staging anon key
- `SUPABASE_SERVICE_ROLE_KEY` — staging service role key

### Step 4: Start local Supabase (optional, for fully local dev)

If you want to run a fully local Supabase instance instead of pointing at staging:

```bash
supabase start
```

This spins up a local Postgres + Supabase stack via Docker. Update `.env.local` with the local URLs printed by this command.

### Step 5: Run migrations

For local Supabase:
```bash
supabase db reset
```

For staging (if skipping local):
```bash
npm run db:migrate:staging
```

### Step 6: Run seeds (staging or local only)

For local:
```bash
supabase db reset
# (reset already runs seeds if they are in supabase/seeds/)
```

For staging:
```bash
npm run db:seed:staging
```

### Step 7: Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000` and will connect to your local or staging Supabase instance.

---

## Staging Project Details

| Field | Value |
|---|---|
| Project name | hoptrack-staging |
| Project URL | https://qhznhxyhwqmqfdaqebla.supabase.co |
| Project ref | qhznhxyhwqmqfdaqebla |
| Supabase dashboard | https://supabase.com/dashboard/project/qhznhxyhwqmqfdaqebla |
| Region | East US (N. Virginia) / us-east-1 |
| Compute tier | MICRO |
| Baselined | 2026-04-21 (72 tables from prod) |
| Credentials location | 1Password — HopTrack Engineering > Staging Supabase |

---

## Production Project Details

*(Production credentials are never stored in this document — see 1Password)*

| Field | Value |
|---|---|
| Project name | HopTrack |
| Project URL | https://uadjtanoyvalnmlbnzxk.supabase.co |
| Project ref | uadjtanoyvalnmlbnzxk |
| Supabase dashboard | https://supabase.com/dashboard/project/uadjtanoyvalnmlbnzxk |
| Region | East US (Ohio) / us-east-2 |
| Compute tier | NANO |
| Credentials location | 1Password — HopTrack Engineering > Production Supabase |

---

## Security Warning

> **WARNING**
>
> NEVER share the production `SUPABASE_SERVICE_ROLE_KEY` in:
> - Slack (any channel, any DM)
> - Email
> - GitHub issues, PRs, or comments
> - This document or any committed file
>
> The service role key bypasses all Row Level Security policies. Anyone with this key has full read/write access to every row in the production database.
>
> **If the production service role key is ever exposed, rotate it immediately** via the Supabase dashboard (Settings > API > Service Role Key > Regenerate). Then audit the Supabase logs for any unauthorized access. Notify Jordan.

---

## CI/CD Environment Variables

For Vercel (or whichever deployment platform is in use), environment variables are set in the project settings dashboard — not via committed files.

Required variables to set in Vercel for each environment:

**Preview / Staging deployments:**
- `NEXT_PUBLIC_SUPABASE_URL` (staging value)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (staging value)
- `SUPABASE_SERVICE_ROLE_KEY` (staging value — marked as sensitive)

**Production deployments:**
- `NEXT_PUBLIC_SUPABASE_URL` (production value)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production value)
- `SUPABASE_SERVICE_ROLE_KEY` (production value — marked as sensitive)

Never use the Vercel CLI or GitHub Actions to log or echo these values. Set them once in the dashboard and treat them as write-only.

---

*Document owner: Riley. Last updated: 2026-03-24.*
