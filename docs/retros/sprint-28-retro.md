# Sprint 28 Retro — Feed Spec Implementation

**Sprint:** 28 — "Feed Spec Implementation"
**Date:** 2026-03-29
**Format:** Compliments edition (Joshua's call — no roasts today, just love)

---

**Morgan:** Alright team, Sprint 28. We shipped 12 tickets, three brand new card types, two new Discover sections, and squashed a hydration bug that had Turbopack acting possessed. Let's do this. Compliments only — Joshua's orders.

**Jordan:** Wait, genuinely? No roasts? I don't... I don't know how to behave.

**Alex:** Just say something nice, Jordan. It won't hurt you.

**Jordan:** *visibly uncomfortable*

---

## What Shipped

**Morgan:** Three new feed card types — `RecommendationCard`, `NewFavoriteCard`, `FriendJoinedCard`. Two new Discover sections — Seasonal & Limited scroll, Curated Collections. Scroll position memory between tabs. The hydration fix. And we closed the gap between my spec doc and what's actually in the app. That's a real sprint.

**Sam:** From a business continuity standpoint, the feed is now a proper social product. We went from "here's a list of sessions" to "here's a living, breathing feed with recommendations, new favorites, friend joins, seasonal drops, and curated content." That's the kind of thing that makes people open the app twice a day instead of once a week.

**Drew:** The feed feels like something I'd actually scroll through after closing up the taproom. That's not nothing. That's the whole thing, actually.

---

## Compliments

**Morgan:** I'll start. **Jordan** — the `SessionRecapSheet` dynamic import fix was surgical. You identified that Turbopack was corrupting the module cache through a static import chain, and you broke it with `next/dynamic` and `ssr: false`. That's not a hack, that's understanding the toolchain at a level most devs never reach.

**Jordan:** *clears throat* Thanks, Morgan. That means... yeah. Thanks.

**Alex:** **Morgan** — your feed spec doc was the cleanest handoff I've ever worked from. Every card type had layout, data source, and interaction behavior spelled out. Zero ambiguity. I didn't have to guess once. That doc is why we shipped 12 tickets in one sprint.

**Sam:** **Alex** — the horizontal scroll patterns on `SeasonalBeersScroll` and the redesigned `TrendingCard` feel native. Like, actually native. The badge overlays with "Limited" in accent and "Seasonal" in gold — that's the kind of detail that makes people think we have a 20-person design team.

**Casey:** **Sam** — you caught that `hasCommunityContent` wasn't including the new seasonal and curated data before it shipped. If that had gone out, the Discover tab would've shown "Nothing brewing yet" even when there was content. That's exactly the kind of edge case that makes you invaluable.

**Drew:** **Riley** — I know infra work is invisible when it's done right, and that's kind of the point. The migration pipeline, the seed data, the fact that I can run demos without worrying about the database exploding — that's all you. The plumbing works because you made it work.

**Riley:** **Casey** — eight sprints of carrying the E2E testing torch. You haven't dropped it once. You've filed every bug, tested every happy path and sad path, and held us to a standard we wouldn't have without you. When Playwright finally lands, it's going to be YOUR victory lap.

**Casey:** *quietly* ...that actually got me. Thank you, Riley.

**Taylor:** **Jamie** — the editorial mock data for seasonal beers and curated collections? "West Coast Revival," "Barrel-Aged Wonders," "Session Sippers for Sunny Days"? That's not placeholder copy, that's brand voice. When we go live, that content is going to make breweries feel like they're part of something bigger than a tap list app.

**Jamie:** **Taylor** — the fact that you're already thinking about how every feature sells? The Curated Collections aren't just a feed section to you, they're a sponsored content opportunity. That revenue instinct is why we're going to hit 500 breweries. Chef's kiss.

**Jordan:** Okay, my turn. **Drew** — your P0 list has been the compass for this entire project. Every time we're about to ship something that would cause chaos on a Friday night, you catch it. The feed isn't just a tech product because of you. It's a brewery product. That matters more than any of us want to admit.

**Drew:** I felt that. In a good way this time.

**Jordan:** And... **Morgan**. The spec doc, the priority calls, the way you keep 9 people aligned without ever raising your voice. This sprint shipped clean because you ran it clean. That's not project management, that's leadership.

**Morgan:** ...

**Alex:** Is Morgan blushing?

**Morgan:** Moving on. This is a living document.

---

## Sprint 28 by the Numbers

| Metric | Value |
|---|---|
| Tickets shipped | 12 |
| New components | 5 (RecommendationCard, NewFavoriteCard, FriendJoinedCard, SeasonalBeersScroll, CuratedCollectionsList) |
| New migrations | 0 (all data from existing tables + editorial mock) |
| Hydration bugs killed | 1 (the big one) |
| New feed card types | 2 (new_favorite, friend_joined) |
| Discover sections | 6 total (was 4) |
| P0 bugs open | 0. ZERO. — Casey |

---

## Carry-Forward to Sprint 29

- Cheers/reaction button on feed cards (P1 — carried from Sprint 25, 4th carry)
- Feed infinite scroll / pagination (P2 — carried from Sprint 25)
- PGRST schema cache refresh (`NOTIFY pgrst, 'reload schema';`) — still needed for live session data in feed
- E2E tests (Casey. We see you. We believe in you.)

---

**Morgan:** Good sprint, everyone. The feed is real now. It looks like a product people would actually download.

**Taylor:** We're going to be rich.

**Drew:** Buy the first round in Asheville and I'll believe you.

**Joshua:** 🍺
