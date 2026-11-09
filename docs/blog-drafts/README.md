# HopTrack Blog Drafts

Unpublished drafts for the future HopTrack blog. These are **draft docs**, not live site pages — nothing in this folder is deployed anywhere, and no routes exist in `app/blog/`. When Joshua approves any of these for publication, we'll scaffold the blog route group and move the approved drafts in.

Every statistic in every draft is backed by a real, verifiable source. See each post's source list at the bottom, and the master source list in `sources.md`.

## Status

| # | Slug | Title | Target keyword | Status |
|---|------|-------|---------------|--------|
| 1 | `paper-punch-cards-cost-brewery-money` | Why paper punch cards are costing your brewery more than you think | brewery loyalty program | DRAFT — awaiting review |
| 2 | `brewery-tap-list-software-buyers-guide` | Brewery tap list software in 2026: the honest buyer's guide | brewery tap list software | DRAFT — awaiting review |
| 3 | `mug-club-loyalty-program-brewery-retention` | Mug clubs don't actually retain customers. Experiences do. | brewery mug club / taproom loyalty | DRAFT — awaiting review, Drew should sanity-check |
| 4 | `2025-craft-beer-midyear-report` | The 2025 craft beer crossroads: what the Brewers Association midyear report means for your brewery | craft beer 2025 trends | DRAFT — awaiting review |

## Review checklist

Before any of these go live:

- [ ] Joshua reads and approves the angle
- [ ] Drew sanity-checks Post 3 specifically (mug clubs is a sacred cow in some brewery circles)
- [ ] Jamie edits for brand voice
- [ ] Check every hyperlink still resolves
- [ ] Confirm we're comfortable naming competitors by name in Post 2
- [ ] Decide: MDX in-repo or Supabase-backed CMS before `/blog` gets scaffolded

## Post-approval workflow (not yet implemented)

1. Scaffold `app/blog/page.tsx` (index) and `app/blog/[slug]/page.tsx` (individual post)
2. Either ship MDX-backed content from `content/blog/` or build a Supabase CMS
3. Add `/blog` to `sitemap.ts` with proper priority
4. Add JSON-LD `Article` schema to each post page
5. Add OG image generation for each post via `app/og/blog/[slug]/route.tsx`
6. Link from footer (and maybe nav) once there are ≥3 posts live

None of this is done yet. Drafts first, review second, build third.
