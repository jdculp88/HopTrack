# Sprint 25 — Rate & Relate

**Date:** 2026-03-28
**Theme:** Fix the rating system, redesign session recap, overhaul the feed
**All hands planning sprint — requirements, design, and build**

---

## Scope

| # | Item | Priority | Owner |
|---|------|----------|-------|
| 1 | StarRating 5th star bug fix | P0 | Jordan |
| 2 | Brewery rating moved to top of brewery page | P0 | Jordan + Alex |
| 3 | Session recap v2 — beer rating prompts + brewery quick review | P0 | Jordan + Alex |
| 4 | Feed card visual refresh — kill banner, readable beer list, photos, notes | P0 | Jordan + Alex |
| 5 | Welcome card slim-down | P0 | Jordan |
| 6 | `beer_reviews` table + migration 032 | P1 | Riley + Jordan |
| 7 | Beer page review section | P1 | Jordan |
| 8 | Feed — visible comments + count | P1 | Jordan |
| 9 | Feed — "Cheers" reaction button | P1 | Jordan |
| 10 | Feed — filter tab redesign | P2 | Alex + Jordan |
| 11 | Playwright E2E | P2 | Casey (9th carry) |

---

## Key Design Decisions

- Brewery rating section moves to position 2 on brewery page (after hero, before tap list)
- Session recap shows unrated beers with inline star pickers + brewery quick review
- Feed cards: kill redundant brewery banner, show beer list as readable rows, surface photos + notes
- Welcome card collapses to slim bar after first visit of the day
- `beer_reviews` table follows same pattern as `brewery_reviews` (upsert, one per user per beer)
- Comments shown inline on feed cards (not hidden behind expand)
- "Cheers" reaction button on feed cards (single reaction type)

---

## Migration 032: beer_reviews

```sql
CREATE TABLE beer_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beer_id uuid NOT NULL REFERENCES beers(id) ON DELETE CASCADE,
  rating numeric(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, beer_id)
);
CREATE INDEX idx_beer_reviews_beer ON beer_reviews(beer_id);
ALTER TABLE beer_reviews ENABLE ROW LEVEL SECURITY;
-- RLS: public read, auth write own (same as brewery_reviews)
```
