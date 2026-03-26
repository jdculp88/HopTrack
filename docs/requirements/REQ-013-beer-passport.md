# REQ-013 — Beer Passport
**Status:** Built
**Priority:** P0
**Owner:** Sam (BA), Jordan (Dev), Alex (UI/UX)
**Sprint:** 13

## Summary
A visual "passport" page showing every unique beer a user has tried, displayed as collectible stamps in a grid. Users can search and filter by style. Gold borders highlight 5-star rated beers. The passport makes beer exploration feel like a collection game and encourages users to try new beers.

## User Stories
- As a user, I want to see every unique beer I've tried in one place
- As a user, I want to filter my passport by beer style to see my collection
- As a user, I want to feel rewarded for trying new beers (stamp collection metaphor)

## Page Structure

### Route: `/profile/[username]/passport`

### Server Component (`passport/page.tsx`)
- Queries `beer_logs` for the user, grouped by `beer_id`
- Joins `beers` for name, style, ABV + `breweries` for brewery name
- Deduplicates by `beer_id`, keeping the first occurrence (first time tried)
- Computes stats: unique beers, unique styles, unique breweries

### Client Component (`passport/PassportGrid.tsx`)

**Stats Header:**
- Gold accent card with Stamp icon
- 3-column grid: Beers | Styles | Breweries

**Filters:**
- Search input (beer name or brewery name)
- Style filter pills (derived from user's collection)

**Grid:**
- 2-column (mobile) / 3-column (desktop) stamp grid
- Each stamp shows:
  - Gradient background with beer emoji
  - Beer name (truncated)
  - Brewery name
  - Style badge (BeerStyleBadge component)
  - Star rating (if rated)
  - First tried date
- 5-star beers get gold border + subtle gold shadow
- Stagger animation on mount (`delay: i * 0.03, spring stiffness: 400`)
- Tap navigates to `/beer/[id]`

**Empty State:**
- "Your passport is empty — start a session to collect your first stamp"

### Loading Skeleton (`passport/loading.tsx`)
- Skeleton header, filter bar, and 6 placeholder stamp cards

### Profile Page Link
- "Beer Passport" card on profile page links to passport
- Shows unique beer count from profile stats

## Acceptance Criteria
- [ ] Passport page shows all unique beers tried by user
- [ ] Search filters by beer name and brewery name
- [ ] Style filter pills work correctly
- [ ] 5-star beers have gold border
- [ ] Stamps link to beer detail page
- [ ] Loading skeleton shows while data loads
- [ ] Empty state renders for users with no beer logs
