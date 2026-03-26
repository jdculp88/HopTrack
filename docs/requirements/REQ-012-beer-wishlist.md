# REQ-012 — Beer Wishlist
**Status:** Built
**Priority:** P0
**Owner:** Sam (BA), Jordan (Dev), Alex (UI/UX)
**Sprint:** 13

## Summary
Users can save beers they want to try to a personal wishlist. The wishlist appears on the user's profile and beers are automatically removed when logged in a session. The feature encourages exploration and gives users a reason to return to beer detail pages.

## User Stories
- As a user, I want to save beers I want to try so I can remember what to order next time
- As a user, I want to see my wishlist on my profile so I can plan my next brewery visit
- As a user, I want beers auto-removed from my wishlist when I log them so I don't have to manage it manually

## Data Model

### `wishlist` table (pre-existing)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| beer_id | uuid | FK → beers |
| note | text | Optional user note |
| created_at | timestamptz | |

**Constraints:** Unique on `(user_id, beer_id)`
**RLS:** Users can CRUD their own wishlist items only

## Components

### WishlistButton (`components/ui/WishlistButton.tsx`)
- Client component with optimistic toggle
- Props: `beerId`, `initialWishlisted`
- Shows `Bookmark` (empty) or `BookmarkCheck` (gold) icon
- Calls `POST /api/wishlist` to add, `DELETE /api/wishlist` to remove
- Spring animation on toggle (`stiffness: 400, damping: 20`)
- Toast notification on success

### Beer Detail Page Integration
- Server component queries `wishlist` to check if beer is wishlisted
- `WishlistButton` replaces static bookmark icon in beer header

### Profile Page — "Want to Try" Section
- Shows up to 6 wishlisted beers in a 2-column grid
- Only visible on own profile (RLS prevents cross-user access)
- Each card links to beer detail page with name, style badge, brewery name

## API

### `POST /api/wishlist`
- Body: `{ beer_id: string }`
- Upserts to handle idempotency
- Returns 201

### `DELETE /api/wishlist`
- Body: `{ beer_id: string }`
- Deletes matching row
- Returns 200

## Auto-Remove on Beer Log
When a beer is logged via `POST /api/sessions/[id]/beers`, if the `beer_id` matches a wishlist entry, it is automatically deleted. This is fire-and-forget (non-blocking).

## Acceptance Criteria
- [ ] Bookmark button toggles wishlist state on beer detail page
- [ ] Toast confirms add/remove
- [ ] Wishlist section shows on own profile
- [ ] Beer auto-removed from wishlist when logged in session
- [ ] Empty wishlist doesn't show section on profile
