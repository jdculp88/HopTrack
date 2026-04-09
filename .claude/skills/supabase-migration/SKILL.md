---
name: supabase-migration
description: Create and validate HopTrack Supabase migrations — sequential numbering in supabase/migrations/, gen_random_uuid, RLS policies in the same migration as table creation, destructive-change rollback plans, running supabase db push, post-foreign-key schema reload. Use when writing a migration, modifying the database schema, adding tables, adding RLS policies, editing migration files, or troubleshooting the migration pipeline.
---

# HopTrack Supabase Migrations

**Owners**: Riley (Infrastructure / DevOps) + Quinn (Infrastructure Engineer). Every migration must make Riley sleep soundly. If it could cause chaos on Drew's busy Friday night, it doesn't ship.

## Before writing a migration
1. **Check the current migration state first** — always. This is Quinn's rule. Look at `supabase/migrations/` for the latest numbered file before picking a number.
2. **Coordinate with Avery** on any schema changes needed for features — don't freelance schema shape.
3. **If the migration is destructive** (drops, alters that lose data, renames, type narrowing): write a rollback plan FIRST. Never run destructive migrations without one. Non-negotiable.

## Writing the migration
- **Location**: `supabase/migrations/` — numbered sequentially from current max + 1
- **Use `gen_random_uuid()`** — NOT `uuid_generate_v4()`
- **RLS policies go in the SAME migration as table creation** — never split them across files
- **Document purpose** in a file header comment so future Claude/future Quinn knows why it exists
- **Test locally** before applying to remote

## RLS policies
- Every new table must have RLS enabled before policies are written
- Secure but not overly restrictive — err on the side of correctness, not looseness
- Service role key is server-side only, NEVER in client code
- When in doubt, model policies on similar existing tables (check `supabase/migrations/` for patterns)

## Applying migrations
- Use `supabase db push` to apply (CLI is linked)
- Staging first: `npm run db:migrate:staging`
- **After any foreign key migration**: remind the team to run `NOTIFY pgrst, 'reload schema';` — otherwise PostgREST won't pick up the new relationship and the API will lie about joins

## Never
- NEVER commit secrets to git (env vars, service keys, connection strings)
- NEVER run a destructive migration without a rollback plan (Quinn's hard rule)
- NEVER forget to update `.env.local.example` when adding new env vars
- NEVER skip the `as any` cast when Supabase types fight TypeScript in consuming code — it's the agreed workaround

## If something goes wrong
- Check migration state: `supabase db diff` or inspect the `supabase_migrations` table
- Drew's P0 list is gospel — if a migration breaks tap list accuracy, loyalty editing, or photo uploads, roll it back immediately
- Escalate to Riley for anything involving production data or storage buckets
- The SQL editor incident is why we have this skill — don't recreate it
