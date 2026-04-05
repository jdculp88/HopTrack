# HopTrack Design Research: 2026 State of the Art Facelift

**Researched:** 2026-04-05 (Sprint 160 planning)
**Context:** Joshua feels the app is "boring" — colors/fonts/styles are good, but the overall experience needs to feel "seamless, state-of-the-art, and fun to use"
**Goal:** Identify specific, adoptable patterns from the best consumer mobile apps of 2024-2026

---

## TL;DR — What Actually Moves the Needle

HopTrack already has the ingredients (dark theme, gold accent, good typography, Framer Motion, View Transitions enabled). What it's missing is the **sensory layer** that makes a Friday-night app feel like Friday night instead of a dashboard:

1. **Liquid Glass nav layer** — floating tab bar above content, minimize on scroll, backdrop blur with saturation boost
2. **Physics-based springs, not ease curves** — Arc Browser-style phase animations (scale 1.0 → 0.96 → 1.0, shadow 5px → 70px)
3. **Mascot / character personality** — Duolingo's Duo proves baby-schema characters drive emotional attachment. HopTrack needs a mascot (hop? pint glass character? brewery dog?)
4. **Haptics on every meaningful tap** — Apollo for Reddit made Reddit feel physical. HopTrack should feel physical on every check-in, rating, friend interaction
5. **Grainy mesh gradients over flat surfaces** — noise texture + 3-5 color point mesh = premium depth without competing with content
6. **Celebration moments with real confetti + sound + haptic** — not just a toast. Check-in #10 at a brewery = party.
7. **Shared element view transitions on every card → detail navigation** — beer card expands to beer detail, brewery card expands to brewery page, 350ms spring
8. **Minimize-on-scroll bottom nav** — reclaim screen, emphasize content
9. **Character-driven notifications, empty states, errors** — not "No sessions yet." Say something with personality.
10. **Variable rewards on XP + streaks** — not fixed point values, randomize within a range

---

## 1. Apple Design Award Winners 2024-2025: What Actually Won

### 2025 Delight and Fun — CapWords
**The pattern:** Camera → instant interactive sticker transformation. Photography IS the gameplay loop.
**Why it works:** Collapsing the primary verb (learning a word) with an existing habit (taking photos) creates zero-friction onboarding.
**HopTrack adoption:** The check-in camera should have a "snap → instant beer card with animated fill" moment. When you take a photo of your beer, the app should *transform* it — not just upload it. Auto-detect beer color, animate liquid filling a glass shape, apply a grainy filter wash.

### 2025 Interaction — iA Writer
**The pattern:** Distraction-free paradigm. Swipe right = library, swipe left = preview. Only highlight relevant text at focused moments.
**Why it works:** Every gesture reduces cognitive load. The app gets out of its own way.
**HopTrack adoption:** Swipe gestures on feed cards — swipe right to cheers, swipe left to save. Only highlight the active session card; dim everything else when a session is live.

### 2025 Visuals — Feather: Draw in 3D
**The pattern:** Complexity hidden behind minimalist interface. 2D sketch → 3D extrusion with a single gesture.
**Why it works:** Skill-agnostic (beginner OR pro), single interaction unlocks depth.
**HopTrack adoption:** Hide statistical complexity behind a simple swipe. Profile stats should START as 4 cards but expand into Beer DNA + Taste Profile + Sessions heatmap when swiped up.

### 2024 Delight and Fun — Bears Gratitude
**The pattern:** Character animation in "delightfully unexpected places." Warm, inviting visual language.
**Why it works:** Behavioral psychology — characters reduce friction for habit formation.
**HopTrack adoption:** HopTrack needs a **mascot**. A cartoon hop character or a pint-glass-with-a-face that shows up in empty states, in notifications, when you hit milestones, when you open the app for the first time that day. This is the single biggest gap vs. Duolingo-tier delight.

### 2024 Innovation — Procreate Dreams
**The pattern:** Extends familiar tool library (Procreate) into new context (animation) — consistent interaction model.
**Why it works:** Zero learning curve for existing users.
**HopTrack adoption:** Every new feature should feel like an extension of the check-in flow, not a new modal/page. Loyalty = a card in the feed. Challenges = a card in the feed. Brand loyalty = a card in the feed.

### 2024 Interaction — Crouton
**The pattern:** Progressive information disclosure based on task flow. Cooking app surfaces the exact right info at the exact right moment.
**Why it works:** Removes noise. Shows next step, not everything at once.
**HopTrack adoption:** Active session drawer should be progressive — pour 1 = suggest pour 2 from same brewery, pour 3 = suggest trying different style, pour 5 = "you're on a roll, rate them" contextual nudge.

### 2024 Visuals — Rooms
**The pattern:** 8-bit retro aesthetic + modern UX. Detailed micro-animations in blank creative canvas.
**Why it works:** Nostalgia + usability = distinctive brand memory.
**HopTrack adoption:** HopTrack's "topographic" card-bg system (from S63) is exactly this pattern. Push it further — hand-drawn beer can illustrations in empty states, topo contour lines as loading indicators.

---

## 2. Duolingo: The Engagement Engine

### Specific Patterns to Steal

**Play-First Onboarding**
- Users complete first lesson → earn XP → hit 10% fluency — ALL before signup
- HopTrack adoption: Let users log their first beer BEFORE signup. "Try it first" button on landing → fake local-storage check-in → signup to save it.

**Baby Schema Mascot (Duo the Owl)**
- Large eyes, rounded features, childlike proportions
- Triggers protective + positive emotional responses
- Appears in notifications, achievements, errors
- HopTrack adoption: **Commission a mascot.** Possible candidates:
  - "Hops" — a friendly hop cone character with big eyes
  - "Pint" — a pint glass with a face
  - "Rover" — a brewery dog
  - Must be rounded, big-eyed, small body = nurturing response

**Variable Reward Scheduling**
- XP earned per lesson is UNPREDICTABLE (Candy Crush psychology)
- HopTrack adoption: Session XP is currently FIXED (from lib/xp.ts `SESSION_XP` constants). Add ±20% variance. Occasionally grant "Bonus Pour!" x2 XP moments. The unpredictability is the hook.

**Streak Loss Aversion**
- Fear of losing streak > joy of gaining it
- HopTrack adoption: HopTrack added streak freezes in S157. Push further — show "streak at risk" amber pulse on home screen after 22 hours. Play a sad sound when streak breaks. Celebrate loudly when saved.

**Personality-Driven Feedback**
- Mascot appears in EVERY notification, error, achievement
- HopTrack adoption: Replace every generic toast. Instead of "Session saved", say "Nice round!" with mascot. Instead of "Error", say "Uh oh — something went sideways" with worried mascot.

Sources: [Duolingo UX Breakdown](https://www.925studios.co/blog/duolingo-design-breakdown)

---

## 3. Mesh Gradients + Noise Texture + Depth

### The 2026 Technique

**Grainy Mesh Gradients** — the evolution beyond flat design.
- 3-5 color points with soft, contrasting hues
- Blur strength high, points spread apart
- Add subtle noise texture (breaks banding, adds organic grain)
- Apply to hero sections, modals, card backgrounds
- NEVER apply to content (list items, text blocks)

### HopTrack Adoption

**Replace flat surface colors with mesh gradients in these locations:**
- Home feed hero banner (dark-gold-amber mesh)
- Beer detail hero (style-family-colored mesh using existing beerStyleColors.ts)
- Brewery detail hero (city-colored mesh, or brand-colored)
- Achievement celebration overlay (gold-amber-bronze mesh, animated)
- Profile header background (user's top 3 styles as mesh color points — this ALREADY works in BeerDNACard!)

**Implementation:** Tailwind v4 + CSS `background: radial-gradient(circle at X% Y%, color1, transparent)` stacked 3-5 times, plus `::before` pseudo-element with `background-image: url("noise.svg")` at 0.04 opacity.

**CSS variables needed:**
```css
--mesh-gold: radial-gradient(circle at 20% 30%, rgba(212,168,67,0.35), transparent 40%),
             radial-gradient(circle at 80% 60%, rgba(184,122,44,0.25), transparent 50%),
             radial-gradient(circle at 50% 100%, rgba(139,93,29,0.2), transparent 60%);
--noise: url("data:image/svg+xml;base64,...");
```

Sources: [Mesh Gradients Deep Dive](https://www.learnui.design/blog/mesh-gradients.html), [Grainy Mesh Gradient Component](https://www.framer.com/marketplace/components/grainy-mesh-gradient/)

---

## 4. Micro-Interactions That Delight

### Arc Browser Search Bar — The Gold Standard

**Exact phases (from SwiftUI reverse-engineering):**
1. **Idle** — rest state
2. **Validating** — color overlay 0.18 opacity, 80ms easeInOut
3. **Decrease** — scale 1.0 → 0.96, shadow 5px → 10px, 90ms spring
4. **Increase** — scale 0.96 → 1.0, shadow 10px → 70px, 380ms easeOut
5. **Finished** — return to normal, 10ms linear

**Why it works:** The 70px shadow expansion feels like the element is BREATHING. Not a click — a pulse.

**HopTrack adoption — apply to every primary CTA:**
- "Check In" button on FAB
- "Log Pour" button in session drawer
- "Cheers" reaction button on feed cards
- "Redeem" button on loyalty page

**Framer Motion equivalent:**
```tsx
<motion.button
  whileTap={{ scale: 0.96, boxShadow: "0 0 10px rgba(212,168,67,0.5)" }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
  onTap={() => {
    // trigger 70px shadow expansion on release
    // haptic medium impact
    // success haptic on completion
  }}
>
```

### Haptic Pattern Discipline (iOS)

| Event | Haptic | When |
|-------|--------|------|
| Tab switch | Selection | On tap |
| Primary CTA press | Impact Medium | On press |
| Primary CTA release | Impact Light | On release |
| Log pour success | Notification Success (light double-tap) | After server confirms |
| Check-in complete | Notification Success + confetti | After session end |
| New achievement | Notification Success + Impact Heavy (bump) | On unlock |
| Error | Notification Error (triple tap escalating) | On API fail |
| Streak at risk | Impact Light | On home screen mount |
| Rating 5 stars | Impact Medium | On final tap |
| Friend cheer received | Impact Light | On receive (if app open) |

HopTrack already has `useHaptic` hook (from S154). The gap is **placement** — wire into every tap, not just nav.

### Confetti + Sound + Haptic Trifecta

**Moments that deserve the full trifecta:**
1. First check-in at a new brewery
2. Achievement unlock
3. Streak milestone (7, 30, 100 days)
4. Level up
5. Brewery Passport completion
6. First reaction on your feed post

**Implementation:**
- `canvas-confetti` library (3KB, already compatible with existing AchievementCelebration)
- Sound: 120ms WAV (subtle "pop" or "clink")
- Haptic: Notification Success + Impact Heavy simultaneously
- AnimatePresence overlay with mesh gradient backdrop at 0.8 opacity

Sources: [Arc Browser Animation Breakdown](https://medium.com/@bancarel.paul/from-concept-to-code-reproducing-arc-browsers-search-bar-animation-in-swiftui-cd9fdb60e7a5), [iOS Haptic Patterns Guide](https://medium.com/@mi9nxi/haptic-feedback-in-ios-a-comprehensive-guide-6c491a5f22cb)

---

## 5. Onboarding + First-Run 2026 Standard

### The 30-Second Wow Window

Users judge apps within 30 seconds. Script the magic moment to happen within 60 seconds.

### What 2026 Leaders Do

**BeReal** — guides users step-by-step, literally requires them to click a notification to progress. Push notifications become onboarding rails.

**Duolingo** — play-first, signup-second. 10% fluency before credentials.

**Superhuman** — 30-minute guided onboarding call, personalized.

**Arc Search** — start typing immediately, no login required for basic use.

### HopTrack's Gap

Current onboarding (WelcomeFlow, 3 screens from S42) is standard. To hit 2026 standard:

**Proposed flow:**
1. **Screen 1 (2s)** — logo animation, spring bounce, gold wash sweep across screen, subtle haptic
2. **Screen 2 (5s)** — "What are you drinking right now?" — hero question with beer picker carousel (mesh gradient background)
3. **Screen 3 (10s)** — User picks a beer → animation of liquid filling glass → "+10 XP" float → mascot appears
4. **Screen 4 (8s)** — "Want to save this forever?" → signup (optional, can skip to anonymous mode)
5. **Screen 5 (post-signup, 5s)** — Confetti + sound + mascot cheer + "You're in! Here's your first achievement: Welcome Pour 🍺"

**Total time to value:** 30 seconds. User has a check-in, an achievement, XP, and a mascot welcome.

Sources: [BeReal Onboarding Case Study](https://assets.nextleap.app/submissions/AbhijeetSingh_BeReal-Case-Study-Onboarding-and-First-Time-User-Experience.-01aad0cf-975f-4086-94f4-8184e1d6018f.pdf), [Superhuman Onboarding Teardown](https://www.flowjam.com/blog/superhuman-onboarding-teardown-30-minute-wow-session)

---

## 6. Tab Bars + Navigation 2026

### iOS 26 Liquid Glass Tab Bar — The New Standard

**Apple's specification (WWDC 2025):**
- Tab bar FLOATS above content (doesn't touch edges)
- Backdrop blur + saturation boost makes it a "liquid lens"
- **Minimizes on scroll down** (shrinks to pill), re-expands on scroll up
- Transparent glass surface with subtle refraction/lensing
- Auto-adapts legibility based on content beneath
- **Rule: Liquid Glass ONLY for the navigation layer. Never for content.**

### HopTrack's Current Tab Bar

`BottomNav.tsx` is currently a standard sticky bar. Upgrade path:

**CSS to adopt:**
```css
.floating-nav {
  position: fixed;
  bottom: 16px; /* floating, not stuck to edge */
  left: 16px;
  right: 16px;
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(15, 14, 12, 0.65); /* dark translucent */
  border: 1px solid rgba(212, 168, 67, 0.15); /* subtle gold edge */
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

**Minimize on scroll:**
```tsx
const { scrollY } = useScroll();
const scale = useTransform(scrollY, [0, 100], [1, 0.7]);
const opacity = useTransform(scrollY, [0, 100], [1, 0.85]);
```

**Floating check-in FAB:**
- Round button that FLOATS above tab bar
- Gold mesh gradient background
- Breathing animation at rest (scale 1.0 ↔ 1.02, 3s loop)
- On tap: Arc Browser-style phase animation (0.96 dip + 70px shadow bloom)

Sources: [iOS 26 Liquid Glass Tab Bars](https://www.donnywals.com/exploring-tab-bars-on-ios-26-with-liquid-glass/), [Liquid Glass Tailwind CSS](https://flyonui.com/blog/liquid-glass-effects-in-tailwind-css/)

---

## 7. Dark Mode Done Right: Premium vs Utilitarian

### Premium Dark Mode Characteristics

**Letterboxd** — "cinematic" deep background, muted color palette. Content highlighted without glare. Green/orange accents identifiable without logo.

**Things 3 Black Mode** — on OLED, "the boundary between your device and the app almost seems to vanish."

**Netflix / Vimeo** — theater-like feel, dark frames make content pop.

### Technical Spec for OLED Premium

- **True black (#000000)** for page backgrounds (saves 30-50% battery on OLED)
- **Dark gray (#121212 or #1C1C1C)** for cards/elevated surfaces (softer, less jarring)
- **Pure color accents** (HopTrack gold #D4A843) at max saturation — they look electric against true black
- **Never gray-on-gray text** — always high contrast (WCAG AA minimum, already done in S56)
- **Grainy noise layer** over all dark surfaces (breaks banding, adds organic feel)

### HopTrack's Upgrade Path

Current: `#0F0E0C` bg (already near-true-black). To level up:

1. **Offer 3 theme modes:** Light / Dark / OLED Black
   - OLED Black = `#000000` bg, pure vantablack experience
   - Used by Things 3, Reeder, Carrot Weather
2. **Add noise layer** to all card backgrounds (currently solid `var(--surface)`)
3. **Gold accent at higher saturation** on OLED mode — push `#D4A843` to `#E0B34D` only in OLED mode

Sources: [Dark Mode UI Best Practices 2025](https://www.uinkits.com/blog-post/best-dark-mode-ui-design-examples-and-best-practices-in-2025), [Things 3 Dark Mode Review](https://thesweetsetup.com/things-3-8-for-ios-debuts-new-dark-mode/)

---

## 8. "Vibey" vs "Dashboard" — The Technical Difference

### What Makes an App Feel Like Friday Night

**Vibey traits (Friday night):**
- Mesh gradients, noise textures, depth layering
- Spring-physics animations (not ease curves)
- Audio feedback on primary actions
- Mascot/character presence
- Unpredictable reward timing (variable XP)
- Celebration moments disproportionate to the action
- Warm color accents (gold, amber, rose, peach)
- Rounded corners (rounded-2xl for cards, rounded-xl for buttons — HopTrack already does this)
- Generous white space / padding
- Sound design — clinks, pops, subtle music stings

**Dashboard traits (Monday morning):**
- Flat solid colors
- Ease-in-out animations
- Silent (no audio)
- No character
- Predictable fixed rewards
- Muted acknowledgments ("Saved")
- Cool color accents (blue, gray, teal)
- Square corners / sharp edges
- Dense information packing
- No sound

### HopTrack's Current State

Looking at the codebase:
- **Vibey:** Dark theme ✅, Gold accent ✅, Playfair display font ✅, rounded-2xl cards ✅, Framer Motion springs ✅, topo card-bg system ✅, haptic hook ✅
- **Dashboard:** No mascot ❌, No audio ❌, No mesh gradients ❌, No noise texture ❌, Fixed XP ❌, No celebration sound ❌, Generic toasts ❌, No character in empty states ❌, Linear ease transitions in some spots ❌

### The Quickest Wins to Shift Vibey

1. **Add audio** — single `pour.wav` (120ms) on log pour, `cheers.wav` (200ms) on reaction, `achievement.wav` (600ms) on unlock
2. **Commission a mascot** — appears in 4 places: empty feed, achievement unlock, error toasts, streak reminders
3. **Mesh gradient hero on home screen** — replace flat `var(--bg)` with mesh
4. **Randomize XP ±20%** — change from fixed to variable
5. **Noise texture on all cards** — single noise.svg at 0.03 opacity via `::before`

---

## 9. Specific Patterns to Adopt — HopTrack Mapping

### A. Shared Element Transitions on Every Detail Navigation

HopTrack enabled `viewTransition: true` in S157. Expand coverage:

**Current:** `breweryTransitionName()` + `beerTransitionName()` already exist
**Add:**
- Session card → session detail
- Achievement badge → achievement detail modal
- Friend avatar → friend profile
- Loyalty stamp → loyalty card detail
- Feed post → expanded post

**Spring config:** `{ type: "spring", stiffness: 400, damping: 30 }` (already HopTrack's standard)
**Duration floor:** 350ms (below this feels clipped, above feels sluggish)

### B. Swipe Gestures on Feed Cards

**iA Writer proved it works for content apps. Apollo for Reddit made it the standard.**

**Implementation:**
- Swipe right short = Cheers (quick reaction)
- Swipe right long = Save to My List
- Swipe left short = See comments
- Swipe left long = Go to brewery/beer detail

Use Framer Motion `drag="x"` + `dragConstraints` + haptic on threshold.

### C. Pull-to-Refresh with Personality

**Current:** `usePullToRefresh` hook exists (S47)
**Upgrade:** Replace generic spinner with animated mascot
- Pull down → mascot appears, follows finger
- Release → mascot does a flip/shake animation
- Loading → mascot juggles beer glasses
- Complete → mascot gives thumbs up + haptic light

### D. Achievement Celebration 2.0

**Current:** `AchievementCelebration.tsx` has confetti, haptic, auto-dismiss 3s (S47)
**Upgrade:**
- Add `pour.wav` sound at 600ms
- Replace confetti with **beer-themed particles** (tiny hop cones, pint glasses, gold droplets)
- Background mesh gradient animates (color cycle over 3s)
- Mascot bursts in from edge with excited face
- Share button directly in overlay ("Brag to friends?")

### E. Home Feed Hero Section

**Current:** Flat home feed with cards
**Add:** Hero banner at top
- Mesh gradient background (gold-amber-dark)
- Greeting: "Good evening, Joshua" (time-sensitive)
- Today's XP progress ring
- Streak flame counter with pulse animation if at risk
- Mascot in corner with rotating greetings ("Thirsty?", "Round two?", "Friday vibes")

### F. Empty States With Personality

Every empty state in the app should feature the mascot + specific copy.

| Empty State | Current | Proposed |
|-------------|---------|----------|
| No friends | "You have no friends yet" | Mascot holding two beers looking sad: "Drinking alone? Let's fix that." + Find Friends CTA |
| No check-ins | "Log your first beer" | Mascot with empty glass: "This glass isn't going to fill itself..." + Start Session CTA |
| No achievements | "Unlock achievements" | Mascot looking at locked trophy: "Your trophy case is empty. Let's change that." |
| No brewery visits | "Visit breweries to start" | Mascot holding map: "There's a whole beer world out there." |
| No notifications | "You're all caught up" | Mascot with closed laptop: "Inbox zero! Nicely done." |

### G. Variable Reward Scheduling

**Current (lib/xp.ts):** Fixed `SESSION_XP.CHECKIN = 10`, `SESSION_XP.BEER_LOG = 5`

**Proposed:**
```ts
export function awardSessionXP(base: number): number {
  const variance = 0.2; // ±20%
  const multiplier = 1 + (Math.random() * 2 - 1) * variance;
  return Math.round(base * multiplier);
}

// 5% chance of 2x bonus ("Lucky Pour!")
// 1% chance of 5x bonus ("Golden Pour!" + confetti)
```

This is the SINGLE highest-leverage psychology change. Duolingo built a $6B business on this pattern.

### H. Minimize-On-Scroll Floating Nav

**Implementation spec:**
```tsx
// components/layout/BottomNav.tsx
const { scrollY } = useScroll();
const navScale = useTransform(scrollY, [0, 100], [1, 0.85]);
const navOpacity = useTransform(scrollY, [0, 100], [1, 0.92]);
const navY = useTransform(scrollY, [0, 100], [0, 8]);

<motion.nav
  style={{ scale: navScale, opacity: navOpacity, y: navY }}
  className="fixed bottom-4 left-4 right-4 backdrop-blur-xl bg-[rgba(15,14,12,0.65)] border border-[rgba(212,168,67,0.15)] rounded-2xl"
>
  {/* tabs */}
</motion.nav>
```

### I. Audio Feedback System

**New file:** `lib/sounds.ts`
```ts
const sounds = {
  pour: new Audio("/sounds/pour.wav"),     // 120ms gentle pour
  clink: new Audio("/sounds/clink.wav"),   // 80ms cheers
  unlock: new Audio("/sounds/unlock.wav"), // 600ms achievement
  error: new Audio("/sounds/error.wav"),   // 200ms soft
  success: new Audio("/sounds/success.wav") // 200ms chime
};

export function playSound(name: keyof typeof sounds, respectPreference = true) {
  if (respectPreference && !userSoundEnabled()) return;
  sounds[name].currentTime = 0;
  sounds[name].play().catch(() => {}); // fail silently if blocked
}
```

Settings toggle: "Sound effects" (default ON for mobile, OFF for desktop).

### J. Seasonal/Time-of-Day Theme Shifts

**Current:** Dark theme is static
**Proposed:** Subtle color temperature shifts
- **Morning (6am-12pm):** Gold accent slightly warmer (`#E0B34D`)
- **Afternoon (12pm-6pm):** Standard gold (`#D4A843`)
- **Evening (6pm-10pm):** Deeper amber (`#B87A2C`) — "Friday night mode"
- **Late night (10pm-2am):** Rich copper (`#9B5D1A`) — "whiskey hour"

Implement via CSS variables that swap based on `new Date().getHours()` on page load.

---

## 10. Prioritization: What to Ship First

### Sprint 160 — "The Facelift" (Proposed)

**High-impact, medium-effort:**
1. **Liquid Glass floating nav** — backdrop blur, minimize-on-scroll, gold edge
2. **Audio feedback system** — 5 sounds, toggle in settings
3. **Variable XP rewards** — ±20% randomization, 5% lucky bonus, 1% golden
4. **Mesh gradient hero** on home feed
5. **Noise texture layer** on all cards
6. **Mascot commission brief** — design doc for Finley + Alex

### Sprint 161 — "The Mascot" (Follow-up)

**After mascot designs are approved:**
1. Mascot assets (Lottie files) for: empty states, achievement celebration, pull-to-refresh, error toasts
2. Rewrite 12+ empty states with mascot + personality copy
3. Achievement Celebration 2.0 with beer particles + sound
4. Character-driven error toasts
5. Home feed hero greeting rotation

### Sprint 162 — "The Physics" (Polish)

**Advanced interactions:**
1. Arc Browser-style phase animations on all CTAs
2. Swipe gestures on feed cards
3. Shared element transitions on 6 new routes
4. Haptic audit — every tap gets the right haptic
5. Time-of-day theme temperature shifts

---

## Sources

- [Apple Design Awards 2025 Winners](https://developer.apple.com/design/awards/)
- [Apple Design Awards 2024 Winners](https://developer.apple.com/design/awards/2024/)
- [2025 App Store Awards](https://www.apple.com/newsroom/2025/12/apple-unveils-the-winners-of-the-2025-app-store-awards/)
- [Duolingo UX Design Breakdown](https://www.925studios.co/blog/duolingo-design-breakdown)
- [Arc Browser Search Bar Animation](https://medium.com/@bancarel.paul/from-concept-to-code-reproducing-arc-browsers-search-bar-animation-in-swiftui-cd9fdb60e7a5)
- [iOS Haptic Feedback Guide](https://medium.com/@mi9nxi/haptic-feedback-in-ios-a-comprehensive-guide-6c491a5f22cb)
- [iOS 26 Liquid Glass Tab Bars](https://www.donnywals.com/exploring-tab-bars-on-ios-26-with-liquid-glass/)
- [Mesh Gradients Deep Dive](https://www.learnui.design/blog/mesh-gradients.html)
- [Grainy Mesh Gradient (Framer)](https://www.framer.com/marketplace/components/grainy-mesh-gradient/)
- [Dark Mode UI Best Practices 2025](https://www.uinkits.com/blog-post/best-dark-mode-ui-design-examples-and-best-practices-in-2025)
- [BeReal Onboarding Case Study](https://tearthemdown.medium.com/6-product-lessons-from-bereal-including-user-education-36564408b9c6)
- [Liquid Glass Tailwind CSS](https://flyonui.com/blog/liquid-glass-effects-in-tailwind-css/)
- [Letterboxd Design Case Study](https://blakecrosley.com/guides/design/letterboxd)
- [Not Boring Software](https://notbor.ing/)
- [Mobbin — UI inspiration library](https://mobbin.com)
- [Apollo for Reddit Haptic Design](https://apolloapp.io/phil/)
- [View Transitions API in Next.js 16](https://blog.weskill.org/2026/04/view-transitions-api-building-native.html)

---

*Compiled by Morgan for Joshua's review, Sprint 160 planning.*
