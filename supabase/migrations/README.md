# Database Migrations

## Naming Convention

Migrations are numbered sequentially: `001_description.sql`, `002_description.sql`, etc.

Use snake_case descriptions that explain what the migration does:
- `042_seed_breweries.sql` — seed data
- `044_brewery_review_responses.sql` — schema change
- `047_fix_review_fk_to_profiles.sql` — FK/constraint fix

## Applying Migrations

```bash
# Apply all pending migrations to the linked project
npm run db:migrate

# Apply to staging
npm run db:migrate:staging

# Apply to production
npm run db:migrate:production
```

Under the hood, these run `supabase db push` with the appropriate project ref.

## Creating a New Migration

1. Create a new file: `supabase/migrations/NNN_description.sql`
2. Use the next sequential number (check the highest existing number)
3. Write idempotent SQL where possible (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`)
4. Test locally with `supabase db reset` before pushing

## After FK Migrations

If you add or change foreign key relationships, run this in the Supabase SQL editor to refresh PostgREST's schema cache:

```sql
NOTIFY pgrst, 'reload schema';
```

Without this, PostgREST won't resolve embedded joins on the new FK until the next cache refresh.

## Current State

- **46 migration files** (001-047, some numbers consolidated)
- All migrations applied to production
- See `docs/sprint-history.md` for migration history by sprint

## Rollback

There is no automatic rollback. If a migration needs to be undone:

1. Write a new forward migration that reverses the change
2. Never delete or modify an already-applied migration file
3. Test the rollback migration on staging first
