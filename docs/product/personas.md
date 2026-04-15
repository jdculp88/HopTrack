# Personas

*Who uses HopTrack, and what they come here to do.* Owned by [Morgan](../../CLAUDE.md). Sales view in [sales/ideal-customer-profile.md](../sales/ideal-customer-profile.md).

**Back to [product](README.md) · [wiki home](../README.md).**

---

HopTrack serves two sides: drinkers and breweries. Each side has 2-3 personas with different jobs-to-be-done. Every feature should answer "which persona, what job?"

## Drinker personas

### The Beer-Curious (Casey on a Friday night)
Drinks craft occasionally. Doesn't know styles by name. Wants a good time with friends.
- **Jobs:** find a brewery nearby, pick a beer without feeling dumb, share the night.
- **Features that matter:** [HopRoute Concierge](../requirements/REQ-118-hoproute-concierge.md), flavor tags in human terms ([REQ-010](../requirements/REQ-010-flavor-tags-serving-styles.md)), session OG cards to share.
- **Anti-patterns:** walls of untappd-style badges, rating scales with decimals, brewery jargon.

### The Passionate Regular (every brewery has one)
Visits the same 2-3 breweries multiple times a month. Knows the staff. Runs up the loyalty card.
- **Jobs:** stamps earned, streaks defended, personal stats bragged, tap list checked before heading out.
- **Features that matter:** [Brand-Wide Loyalty Passport](../requirements/REQ-096-brand-loyalty.md), streaks + freeze ([REQ-102](../requirements/REQ-102-engagement-engine.md)), realtime tap list ([REQ-101](../requirements/REQ-101-supabase-realtime.md)), [Four Favorites](../requirements/REQ-107-personality-axes-four-favorites.md).
- **Anti-patterns:** losing a streak to a bug, tap list out of date, loyalty card invisible.

### The Craft Explorer (Drew's tribe)
Visits a new brewery every weekend. Tracks everything. Will argue about SRM.
- **Jobs:** log every unique beer, compare breweries, find hidden gems, identify style-mates.
- **Features that matter:** [Sensory Layer](../requirements/REQ-116-sensory-layer.md), [Beer Passport](../requirements/README.md) (REQ-013), [Personality axes](../requirements/REQ-107-personality-axes-four-favorites.md), [Wrapped recaps](../requirements/REQ-005-wrapped-recaps.md).
- **Anti-patterns:** generic recs, missing beer data, no stats depth.

## Brewery personas

### The Owner
Runs a 1-3 location brewery. Wears every hat. Signs the checks. Will die on a hill about beer quality.
- **Jobs:** know who's drinking, know which beers hit, know what to do differently next week, close the circle on loyalty.
- **Features that matter:** [Brewery Health Score](../requirements/REQ-104-intelligence-layer.md), [Smart Weekly Digest](../requirements/REQ-104-intelligence-layer.md), [Brewery CRM](../requirements/REQ-076-brewery-crm.md), [Win-Back Intelligence](../requirements/REQ-104-intelligence-layer.md).
- **Anti-patterns:** charts without a "so what?", manual data entry, anything their bartender won't use.

### The Bartender
Works the floor. Fast hands. Zero patience for cluttered interfaces. Doesn't care about strategy.
- **Jobs:** punch in a pour, answer "what's new?", handle a loyalty redemption without making a line form.
- **Features that matter:** [Bartender Experience](../requirements/REQ-098-bartender-experience.md), quick-access nav, [Smart Search](../requirements/REQ-090-smart-search.md), [Code Entry](../requirements/REQ-081-session-drawer.md).
- **Anti-patterns:** too many clicks, small touch targets, modals over the POS.

### The Brand Manager (multi-location only)
Oversees a brand across 3+ locations. Needs rollups + the ability to push updates down.
- **Jobs:** cross-location reporting, push-to-locations for catalog + promotions, spot which location is lagging.
- **Features that matter:** [Multi-Location](../requirements/REQ-072-multi-location-brewery-support.md), [Brand Team Roles](../requirements/REQ-095-brand-team-roles.md), [Tap Network](../requirements/REQ-072-multi-location-brewery-support.md), [Brand Reports](../requirements/REQ-072-multi-location-brewery-support.md).
- **Anti-patterns:** having to do the same thing at each location, per-location billing, losing the propagation trail.

## Cross-links

- [sales/ideal-customer-profile.md](../sales/ideal-customer-profile.md) — the ICP view.
- [product/roadmap.md](roadmap.md) — feature priorities tie back to personas.
- [architecture/multi-location-brand.md](../architecture/multi-location-brand.md) — the brand role mechanics.
