# Data Model

*The Supabase schema at a glance.* Owned by [Riley](../../.claude/agents/riley.md) and [Quinn](../../.claude/agents/infra-engineer.md).

**Back to [architecture](README.md) · [wiki home](../README.md).**

---

## Where the schema lives

- **Migrations:** [supabase/migrations/](../../supabase/migrations/) — sequentially numbered, each one self-contained (table + RLS + indexes). Current head: migration **120** (HopRoute Concierge, [Sprint 178](../history/retros/sprint-178-retro.md)).
- **Generated types:** [types/database.ts](../../types/database.ts) — regenerated via `npm run db:types`.
- **Join shapes:** [types/supabase-helpers.ts](../../types/supabase-helpers.ts) — hand-curated.
- **Seeds:** [supabase/seeds/](../../supabase/seeds/) — idempotent dev + demo data.

The authoritative "how to write a migration" rules live in the [supabase-migration skill](../../.claude/skills/supabase-migration/SKILL.md).

## The top-level entities

### Brand + location + catalog
See [multi-location-brand.md](multi-location-brand.md).

### Drinker (profile)
`profiles` — one per Supabase auth user. Carries `unique_beers`, streaks, personality axes ([REQ-107](../requirements/REQ-107-personality-axes-four-favorites.md)), XP/level ([REQ-008](../requirements/REQ-008-xp-leveling-system.md)), passport count. Write-paths enforced via triggers since [Sprint 177](../history/retros/sprint-177-retro.md) ([REQ-117](../requirements/REQ-117-stat-write-paths.md)).

### Beer
`beers` — belongs to a brand via the catalog. Fields include SRM color, aroma/taste/finish arrays ([REQ-116](../requirements/REQ-116-sensory-layer.md)), style, ABV, glassware defaults.

### Tap list
`tap_lists` — location-scoped. Pulls from the brand catalog. Live via [realtime](realtime.md).

### Session
`sessions` — a drinking session. The session model replaced the deprecated `checkins` table ([REQ-011](../requirements/REQ-011-checkin-flow.md) deprecated → [REQ-025](../requirements/REQ-025-sessions-tap-wall.md) replacement). Migration 015 dropped the old table.

### Loyalty
`brand_loyalty_passport` + stamps + redemptions — earn anywhere, redeem anywhere ([REQ-096](../requirements/REQ-096-brand-loyalty.md)).

### Brand team + audit
`brand_team_members` + `brand_team_activity` ([REQ-095](../requirements/REQ-095-brand-team-roles.md)).

## RLS model

Every user-data table has policies written in the **same migration** as the table — no exceptions. The Sprint 123 recursion bug ([retro](../history/retros/sprint-123-retro.md)) and the Sprint 147 Brand Team bug ([retro](../history/retros/sprint-147-retro.md)) are why.

Invariant guards:

- [lib/__tests__/rls-safety.test.ts](../../lib/__tests__/rls-safety.test.ts) — cross-cutting.
- [lib/__tests__/orphaned-columns-guard.test.ts](../../lib/__tests__/orphaned-columns-guard.test.ts) — catches columns that are read but never written (the Sprint 177 lesson).
- [lib/__tests__/stat-write-paths.test.ts](../../lib/__tests__/stat-write-paths.test.ts) — every stat column has a write path.

## Migration conventions (short form)

1. Numbered sequentially — next file goes **after** the current head. No renumbering.
2. `gen_random_uuid()` for UUID defaults.
3. RLS policies in the same file as the table.
4. FK changes require `NOTIFY pgrst 'reload schema'` at the end.
5. Destructive migrations ship with a rollback plan in the file comment.

Full rules: [supabase-migration skill](../../.claude/skills/supabase-migration/SKILL.md).

## Arcs that shaped the schema

- **Multi-Location arc** (S114-137) — most of the structure we have today. See [multi-location-brand.md](multi-location-brand.md).
- **The Sensory Layer** (S176, [REQ-116](../requirements/REQ-116-sensory-layer.md)) — beer SRM + aroma/taste/finish arrays. Migrations 111+112.
- **The Plumbing** (S177, [REQ-117](../requirements/REQ-117-stat-write-paths.md)) — triggers to close 2 P0 orphans. Migration 113.
- **The Concierge** (S178, [REQ-118](../requirements/REQ-118-hoproute-concierge.md)) — taste fingerprint + brewery scoring. Migration 120.
- **Display Suite foundation** (S175, [REQ-115](../requirements/REQ-115-display-suite.md)) — 11 brewery display columns. Migration 110.

## When to add a table vs extend an existing one

- Add a table when the new entity has its own identity, RLS story, or lifecycle.
- Extend when the new field is a property of something that already exists and RLS doesn't change.
- If in doubt, ask Avery. That's how we end up with patterns, not proliferation.

## Cross-links

- [auth-and-rls.md](auth-and-rls.md).
- [multi-location-brand.md](multi-location-brand.md).
- [supabase-migration skill](../../.claude/skills/supabase-migration/SKILL.md).
