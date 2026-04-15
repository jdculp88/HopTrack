# REQ-002 — Brewery Images & Beer Menus
**Status:** Planned
**Priority:** Now
**Owner:** Jordan (Dev), Riley (Infra)
**Sprint:** 1

## Summary
Display real images for breweries. Allow breweries (and users) to upload photos. Pull fallback images from Unsplash. Enable brewery-managed tap lists.

## Brewery Images
- Primary: user/brewery uploaded photo → Supabase Storage (`brewery-images` bucket, public)
- Fallback: Unsplash API query `craft brewery [city]` or `taproom interior`
- Cache Unsplash URL in `breweries.cover_image_url` column (already exists in schema)
- Image CDN: Supabase built-in image transformations for resizing

## Beer Menu Management
- Breweries with verified accounts can add/edit/remove beers from their tap list
- `beers.is_active` flag controls tap list visibility
- Consumer sees active beers on brewery detail page
- Brewery admin sees full list including inactive/seasonal

## Acceptance Criteria
- [ ] Brewery detail page shows cover image (uploaded or Unsplash fallback)
- [ ] Gradient placeholder shown while image loads
- [ ] Brewery admin can upload a cover photo
- [ ] Brewery admin can add beers: name, style, ABV, IBU, description, seasonal flag
- [ ] Consumers see active tap list on brewery page
- [ ] Beer cards show style badge, ABV, average rating

## Schema Changes
None required — `cover_image_url` already on `breweries` and `beers` tables.

## Infrastructure (Riley)
- Create `brewery-images` public bucket in Supabase Storage
- Configure RLS: anyone can read, authenticated brewery owners can write
- Max upload size: 10MB
- Accepted formats: JPEG, PNG, WebP

---

## RTM Links

### Implementation
[lib/menus](../../lib/), [supabase/migrations/](../../supabase/migrations/)

### Tests
[menus.test.ts](../../lib/__tests__/menus.test.ts)

### History
- [retro](../history/retros/sprint-12-retro.md)
- [plan](../history/plans/sprint-12-plan.md)

> Added 2026-04-15 during the wiki reorg — see the [RTM](README.md) for the master table.
