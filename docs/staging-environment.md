# Staging Environment

How to set up and use the HopTrack staging environment for pre-production testing.

---

## Overview

Staging mirrors production with its own Supabase project and Vercel preview deployment. Use it to test migrations, seed data, and new features against a real database without touching production.

The workflow: **develop locally -> push to `staging` branch -> verify on staging -> merge to `main`**.

---

## 1. Setting Up a Staging Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project (e.g., `hoptrack-staging`).
2. Note the **Project Reference ID**, **URL**, **Anon Key**, and **Service Role Key** from Project Settings > API.
3. Link the Supabase CLI to the staging project:
   ```bash
   supabase link --project-ref YOUR_STAGING_PROJECT_REF
   ```

---

## 2. Environment Variables

Add staging credentials to your local `.env.local` (these vars are already templated in `.env.local.example`):

```bash
STAGING_SUPABASE_URL=https://YOUR_STAGING_PROJECT_REF.supabase.co
STAGING_SUPABASE_ANON_KEY=your_staging_anon_key
STAGING_SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
STAGING_SUPABASE_PROJECT_REF=YOUR_STAGING_PROJECT_REF
```

For Vercel, set these as environment variables scoped to the **Preview** environment:

| Vercel Env Var | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Staging Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Staging anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging service role key |

---

## 3. Running Migrations Against Staging

All migrations live in `supabase/migrations/` and run in order. Push them to staging with:

```bash
npm run db:migrate:staging
```

This runs `supabase db push --project-ref $STAGING_SUPABASE_PROJECT_REF`. Make sure `STAGING_SUPABASE_PROJECT_REF` is set in your `.env.local`.

To check migration status:

```bash
supabase db push --project-ref $STAGING_SUPABASE_PROJECT_REF --dry-run
```

---

## 4. Seeding Staging with Test Data

Seed migrations are included in the regular migration sequence (prefixed with `seed` in their filenames). They run automatically with `db:migrate:staging`. The seed files populate:

- Demo users and profiles
- Sample breweries with GPS coordinates (real US craft breweries)
- Beers across multiple styles
- Board stats and sample data

To reset staging and re-run all migrations (including seeds):

```bash
supabase db reset --project-ref $STAGING_SUPABASE_PROJECT_REF
```

---

## 5. Vercel Preview Deployments

Vercel automatically creates preview deployments for non-production branches. To deploy staging:

1. Create and push the `staging` branch:
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```
2. Vercel builds a preview deployment at a unique URL.
3. Set the staging Supabase credentials as Vercel Preview environment variables (see section 2).
4. Every push to `staging` triggers a new preview build.

The `.github/workflows/staging.yml` workflow also runs lint, type check, and build on every push to `staging` for CI validation.

---

## 6. Local Development Against Staging

Run the dev server pointed at the staging database:

```bash
npm run dev:staging
```

This uses `STAGING_SUPABASE_URL` and `STAGING_SUPABASE_ANON_KEY` from your environment.

---

## 7. Workflow Summary

```
Local dev (.env.local)
  |
  v
Push to `staging` branch
  |
  +--> GitHub Actions: lint + type check + build
  +--> Vercel: preview deployment with staging Supabase
  |
  v
Test on staging preview URL
  |
  v
Merge to `main`
  |
  +--> GitHub Actions: lint + type check + build + E2E
  +--> Vercel: production deployment
```

---

## Notes

- Never use production credentials in staging or CI.
- The staging Supabase project should have the same schema (via migrations) but can have different seed data.
- RLS policies apply in staging the same as production. Test with real auth flows.
- After FK migrations on staging, run `NOTIFY pgrst, 'reload schema';` in the Supabase SQL editor to refresh PostgREST cache.
