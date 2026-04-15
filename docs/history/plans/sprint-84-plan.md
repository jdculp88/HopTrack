# Sprint 84 Plan — The Wrap
**PM:** Morgan | **Date:** 2026-03-31
**Arc:** Stick Around (Sprints 79-84) — FINAL SPRINT
**Theme:** HopTrack Wrapped — Year-in-Review shareable experience

---

## Goal

Build a shareable, animated "Year-in-Review" experience that showcases a user's beer journey. Spotify Wrapped for craft beer. Viral by design — every share is a free ad.

---

## Why Now

- Last sprint of the Stick Around (retention) arc — this IS the retention capstone
- F-012 from roadmap research — S-sized, fits in one sprint
- PintRewind API already aggregates most stats — we extend, not rebuild
- Shareable content = organic acquisition at zero cost
- The kind of feature users screenshot and post without being asked

---

## Deliverables

### 1. Wrapped Data Engine — `lib/wrapped.ts`
**Owner:** Avery (Dev Lead)
**Reviewer:** Jordan (Architecture Lead)

Extend PintRewind aggregation with date-range filtering and additional stats:

**Stats to compute:**
- Total sessions (brewery + home)
- Total unique beers tried
- Total unique breweries visited
- Total unique styles explored
- Top brewery (most visits)
- Top beer (most logged)
- Top style (most logged)
- Beer personality archetype (from BeerDNACard pattern)
- Average rating + rating personality
- Longest streak achieved
- XP earned + level reached
- Achievements unlocked count
- Friends made (friendships created in period)
- Cities visited (unique brewery cities)
- "Adventurer score" — styles tried / total styles available (%)

**Interface:**
```typescript
interface WrappedStats {
  period: { start: string; end: string; label: string }
  totalSessions: number
  totalBeers: number
  uniqueBeers: number
  uniqueBreweries: number
  uniqueStyles: number
  topBrewery: { name: string; city: string; visits: number } | null
  topBeer: { name: string; brewery: string; count: number } | null
  topStyle: { style: string; count: number }
  personality: { archetype: string; emoji: string; tagline: string }
  avgRating: number | null
  ratingPersonality: string
  longestStreak: number
  xpEarned: number
  level: { level: number; title: string }
  achievementsUnlocked: number
  friendsMade: number
  citiesVisited: string[]
  adventurerScore: number
}
```

### 2. Wrapped API Route — `/api/wrapped/route.ts`
**Owner:** Avery
**Reviewer:** Jordan

- GET with optional `?year=2026` param (defaults to current year or all-time if < 6 months of data)
- Auth required
- Returns WrappedStats
- Reuses PintRewind patterns for aggregation

### 3. Wrapped Card Series — `components/wrapped/`
**Owner:** Avery (build) + Alex (design direction)
**Reviewer:** Jordan

5-7 animated slides using Framer Motion + AnimatePresence:

| Slide | Content | Visual |
|-------|---------|--------|
| 1. Intro | "Your Year in Beer" + user name | Dark bg, gold text, beer emoji rain |
| 2. The Numbers | Total sessions, beers, breweries | Big animated counters, card-bg-stats |
| 3. Your Taste | Top style + personality archetype | Style-colored gradient, personality emoji |
| 4. Top Brewery | Most-visited brewery + visit count | card-bg-hoproute topo treatment, MapPin |
| 5. Top Beer | Most-logged beer + rating | Star rating, style-colored accent |
| 6. The Journey | Cities visited + adventurer score | Mini map or city list, progress ring |
| 7. The Badge | Level + XP + achievements count | Gold celebration, confetti callback |

**Component structure:**
- `WrappedExperience.tsx` — shell with slide navigation (swipe + tap)
- `WrappedSlide.tsx` — base slide component with enter/exit animations
- Individual slide components: `WrappedIntro`, `WrappedNumbers`, `WrappedTaste`, etc.

**Design constraints (Alex):**
- 9:16 aspect ratio option for Instagram Story sharing
- 1:1 square option for feed sharing
- Dark theme, gold accents, style-colored gradients
- Spring animations: `{ type: "spring", stiffness: 400, damping: 30 }`
- Counter animations for numbers (count up effect)
- `prefers-reduced-motion` respected

### 4. Wrapped Page — `app/(app)/wrapped/page.tsx`
**Owner:** Avery

- Server component that fetches wrapped data
- Renders `WrappedExperience` client component
- `loading.tsx` skeleton
- Empty state for users with 0 sessions ("Start your beer journey!")

### 5. Share Functionality
**Owner:** Avery
**Brand copy:** Jamie

- Web Share API (navigator.share) with clipboard fallback (BeerDNACard pattern)
- Share button on final slide + per-slide share
- Share text: "My HopTrack Wrapped: I tried {X} beers across {Y} breweries. I'm a {personality}! See yours at hoptrack.beer/wrapped"
- OG image route extension: `/og?type=wrapped&user=username&personality=hophead` (stretch goal)

### 6. Entry Points
**Owner:** Avery

- **You tab** — "Your Wrapped is ready" CTA card (gold border, gift icon)
- **Profile page** — Wrapped badge/link if data exists

---

## Edge Cases (Casey)

| Case | Handling |
|------|----------|
| 0 sessions | "Start your journey" empty state, no slides |
| 1 session | Show what we have, skip "top" comparisons |
| No ratings | Skip rating slide, adjust personality |
| No brewery visits (all home) | "Home Brewer" personality variant |
| New user (< 1 month) | Show "all-time" instead of year |
| No friends | Skip friends stat, adjust journey slide |

---

## NOT in scope

- OG image generation for wrapped (stretch goal, do if time allows)
- Push notification ("Your Wrapped is ready!") — future sprint
- Brewery-side Wrapped (how their brewery did this year) — future sprint
- Migration — no schema changes needed, all data exists

---

## Team

| Person | Role |
|--------|------|
| **Morgan** 🗂️ | Sprint lead, priorities |
| **Sage** 📋 | Plan, specs, coordination |
| **Avery** 💻 | Build everything |
| **Jordan** 🏛️ | Architecture review, code quality |
| **Alex** 🎨 | Card design direction, animation feel |
| **Jamie** 🎨 | Brand copy for slides + share text |
| **Casey** 🔍 | Edge cases, QA |
| **Drew** 🍻 | "Does this make a beer drinker want to share it?" |

---

## Success Criteria

- [ ] Wrapped page loads with real user data
- [ ] All 5-7 slides render with animations
- [ ] Share works (Web Share API + clipboard fallback)
- [ ] Edge cases handled (0 sessions, 1 session, etc.)
- [ ] Mobile-first, looks great on phone
- [ ] Casey signs off on happy + sad paths
- [ ] Drew says "I'd share this"
