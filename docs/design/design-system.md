# HopTrack Design System v2.0 — The Modernization

**April 2026 | Morgan | v2.0**

The complete visual language for building HopTrack. Colors, typography, components, patterns, and principles — everything the team needs to ship a polished product.

---

## 01 - Design Principles

Six rules that govern every pixel decision. When in doubt, come back here.

### 1. Warmth Over Sterility
HopTrack should feel like your favorite bar — warm, inviting, lived-in. Cream surfaces, amber accents, rounded corners. Never clinical. Never cold. Think *candlelight*, not *fluorescent*.

### 2. Content Earns Color
Beer style colors appear ONLY on beer/beverage content — never on UI chrome, navigation, or structural elements. Max 2-3 style colors visible per viewport. Color is a reward, not wallpaper.

### 3. People First, Beer Second
The social layer leads. Who's drinking > what they're drinking. Avatars before labels. Names before ratings. Activity before data. Inspired by Strava's activity feed hierarchy.

### 4. Depth Creates Hierarchy
Flat design is the enemy. Cards need shadows, backgrounds need texture, selected states need weight. Every element should sit at a clear elevation. Inspired by Robinhood's layered surfaces.

### 5. Data Tells Stories
Numbers alone are boring. Stats need context, trends, and personality. "46 sessions" becomes "You've been busy — 46 sessions and counting." Inspired by Spotify Wrapped's narrative data.

### 6. Earn the Delight
Microinteractions and playful moments are earned through solid fundamentals. Get the spacing, hierarchy, and readability right first. Then add the sparkle. Inspired by Duolingo's layered reward system.

---

## 02 - What the Best Apps Get Right

Patterns we're borrowing — adapted to our warm, beer-forward aesthetic.

### Spotify — Dynamic Color Extraction
**Our take:** Beer style colors drive gradient backgrounds on cards and session bubbles. The UI mood shifts based on what you're drinking. Stats get the "Wrapped" narrative treatment — "Your Beer Thursday" is our version.

### Robinhood — Elegant Data Density
**Our take:** Stat cards get a top-accent bar for color interest. Numbers use JetBrains Mono at large sizes. Functional colors (gamification only) are completely separate from beer style colors.

### Duolingo — Gamification That Doesn't Cheapen
**Our take:** Achievement badges need better visual design — richer illustrations, glow effects for unlocked vs muted for locked. The XP/level bar should have more personality. Streak counter gets prominence like Duolingo's.

### Strava — Social Activity Feeds Done Right
**Our take:** The Friends feed needs card diversity — session cards, achievement cards, review cards, check-in cards should all look visually distinct. Right now it's a wall of identical achievement badges.

### Letterboxd — Content-First Review Cards
**Our take:** Beer cards should let style color do the visual lifting the way Letterboxd uses poster art. Reviews need more visual interest — rating stars should be prominent, tasting notes should use our badge system.

### Arc Browser / Linear — Refined Craft Software
**Our take:** Consistent 14px border radius on cards, 12px on buttons/badges. Subtle background textures on surfaces. Every hover state should feel intentional. The sidebar needs the same level of care as the content area.

---

## 03 - Color System

Three color layers: surfaces (always), functional (UI states), and beer styles (content only). They never cross.

### Surface Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--surface` | Warm Cream | `#FDFAF5` | Page background. The base layer everything sits on. |
| `--card` / `--card-bg` | White | `#FFFFFF` | Card backgrounds. Elevated above the surface layer. |
| `--warm-bg` / `--surface-2` | Warm Mist | `#F7F1E8` | Input backgrounds, pills, subtle fills. The "recessed" layer. |
| `--border` | Parchment | `#EDE5D8` | Borders, dividers, separators. Never stark — always warm. |
| `--warm-bg-deep` / `--surface-3` | Parchment Deep | `#EDE3D4` | Active tab backgrounds, pressed states, deeper recesses. |
| `--amber` / `--accent-gold` | HopTrack Amber | `#C4883E` | Primary brand accent. CTA buttons, active indicators, links. |

### Text Colors

Three tiers. Primary for headings and body. Secondary for supporting. Tertiary for timestamps, labels, and metadata.

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--text-primary` | Espresso | `#2C1810` | Headings, body text, primary content. Not pure black — warm dark brown. |
| `--text-secondary` | Bark | `#7A6B5A` | Descriptions, supporting text, secondary information. |
| `--text-tertiary` / `--text-muted` | Sandstone | `#A89880` | Timestamps, labels, placeholders, metadata. The quietest text. |

### Functional Colors

Used ONLY for UI states and gamification. Completely separate system from beer style colors.

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--func-success` / `--success` | Success Green | `#2D8F4E` | Completed states, positive changes, confirmations. |
| `--func-warning` | Warning Gold | `#E8A838` | Streak indicators, active challenges, attention states. |
| `--func-error` / `--danger` | Error Red | `#C0392B` | Errors, destructive actions, broken streaks. |
| `--func-info` | Info Blue | `#3498DB` | New badges, notifications, informational callouts. |

> **Critical Rule:** Functional colors and beer style colors NEVER appear in the same context. If a card uses IPA green for the style badge, it must NOT also use success green for a checkmark. Use a neutral indicator instead.

---

## 04 - Border Radius Scale

| Token | Size | Usage |
|-------|------|-------|
| `--radius-badge` | 4px | Small badges, dots |
| `--radius-tag` | 8px | Inner elements, tags, small pills |
| `--radius-button` | 12px | Buttons, inputs, search bars |
| `--radius-card` | 14px | Cards (THE standard card radius) |
| `--radius-large` | 16px | Large cards, modals |
| `--radius-sheet` | 22px | Session bubbles, drawer sheets |
| `--radius-pill` | 100px | Full-round pills, avatars |

---

## 05 - Beer Style Palette (Content-Layer Color System)

Each beer style maps to a color family with four values: primary, light, soft, and tint. These appear ONLY on beer/beverage content elements — never on UI chrome or navigation.

### 10 Beer Style Families

| Family | Style Label | Primary | Light | Soft | Tint | CSS Prefix |
|--------|-------------|---------|-------|------|------|------------|
| Stout | Espresso | `#3D2B1F` | `#5C4033` | `#8B6F5E` | `#F5F0EC` | `--stout-espresso-*` |
| Porter | Barrel Plum | `#5B3A6B` | `#7B5A8B` | `#9B7AAB` | `#F4F0F6` | `--porter-plum-*` |
| IPA | Hop Green | `#4A7C2E` | `#6B9D4F` | `#8BBD6F` | `#F0F5EC` | `--ipa-green-*` |
| Sour | Wild Berry | `#9B2D5E` | `#BB4D7E` | `#DB6D9E` | `#F6EFF3` | `--sour-berry-*` |
| Lager | Crisp Sky | `#2E6B8A` | `#4E8BAA` | `#6EABCA` | `#EDF4F7` | `--lager-sky-*` |
| Wheat | Harvest Peach | `#C4853E` | `#D4A55E` | `#E4C57E` | `#F9F3EC` | `--saison-peach-*` |
| Pilsner | Golden Grain | `#D4A830` | `#E4C850` | `#F4E870` | `#FAF6EA` | `--pilsner-grain-*` |
| Amber | Copper Fire | `#B5651D` | `#D5852D` | `#F5A53D` | `#F8F1E9` | `--amber-fire-*` |
| DIPA | Deep Hop | `#3A6B1E` | `#5A8B3E` | `#7AAB5E` | `#EFF5EB` | `--dipa-hop-*` |
| Pale Ale | Meadow | `#7A9B3E` | `#9ABB5E` | `#BAD87E` | `#F3F6EE` | `--pale-meadow-*` |

### 4 Beverage Category Colors

| Category | Name | Primary | CSS Prefix |
|----------|------|---------|------------|
| Cider | Orchard Rose | `#C4526C` | `--cider-rose-*` |
| Wine | Burgundy | `#6B1A3E` | `--wine-burgundy-*` |
| Cocktail | Tropical Teal | `#2A8F89` | `--cocktail-teal-*` |
| Non-Alcoholic | Fresh Lemon | `#E4C34E` | `--na-lemon-*` |

### Style-to-Family Mapping (DS v2 splits)

- **DIPA** split from IPA: Double IPA, Imperial IPA, Triple IPA
- **Pale Ale** split from IPA: Pale Ale, American Pale Ale, English Pale Ale
- **Pilsner** split from Lager: Pilsner, Czech Pilsner, German Pilsner
- **Amber** split from Saison: Amber, Red Ale, Irish Red, Marzen, Oktoberfest

### How Style Colors Apply to Cards

Selected beer cards get a style-tinted background: subtle radial gradient + noise texture + left accent bar in the family's primary color. The pattern is the same for every family — only the color changes.

**Do:** Use style colors on beer badges, selected card backgrounds, tap list accents, session bubble gradients. These are content-layer elements where the beer's identity should be expressed.

**Don't:** Use style colors on navigation, sidebar, buttons, tabs, form inputs, or structural borders. UI chrome uses only surface colors and amber brand accent. Beer colors never touch structure.

CSS class: `.card-bg-reco[data-style="ipa"]` (swap family name). Applied via `getStyleDataAttr()` from `lib/beerStyleColors.ts`.

---

## 06 - Dark Theme Palette

Not an inversion — a reinterpretation. Dark mode uses rich, warm dark browns, not pure black. Beer style colors become more vivid against dark surfaces.

### Dark Surface Tokens

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--surface-dark` | Deep Barrel | `#1A0F08` | Page background. Rich dark brown, NOT pure black. |
| `--card-dark` | Charred Oak | `#241810` | Card surfaces. Slightly elevated from the background. |
| `--warm-bg-dark` | Roasted | `#2E1F14` | Input fills, pill backgrounds, recessed areas. |
| `--border-dark` | Leather | `#3D2B1F` | Borders and dividers. Warm, never grey. |

### Dark Text

Primary text becomes `#FDFAF5`, secondary becomes `#B5A898`, tertiary becomes `#7A6B5A`. Beer style colors shift to their **light** variant for better contrast against dark surfaces.

**Do:** Use warm dark browns (#1A0F08 base) — like a dimly lit taproom. The dark theme should feel warm and inviting, not cold and techy. Think whiskey bar, not code editor.

**Don't:** Use pure black (#000000), cool greys, or desaturated backgrounds. Cool dark modes feel clinical. We're a beer app, not a terminal. Every dark surface needs warmth.

---

## 07 - Typography: Font System

Three fonts, three roles. No exceptions. Consistent usage creates the HopTrack voice.

### General Sans — Display Font

**Role:** Headers and titles only. CSS: `font-display` / `--font-display`

Bold, confident, geometric. Used for page titles, section headers, and display text. Never for body copy. Weight 600-700 only. Loaded from Fontshare CDN.

### Satoshi — UI Font

**Role:** Body and interface. CSS: `font-sans` / `--font-sans` / default body font

Warm, readable, versatile. The workhorse. Used for all body text, buttons, card content, navigation, descriptions. Weights 400-700. Loaded from Fontshare CDN.

### JetBrains Mono — Data Font

**Role:** Numbers, metadata, and code. CSS: `font-mono` / `--font-mono`

Precise, technical, trustworthy. Used for ABV percentages, ratings, timestamps, stat values, section labels, and all uppercase metadata. The "data voice" of HopTrack. Loaded via Google Fonts.

### Type Scale

Every text element in the app maps to one of these sizes. No freelancing.

| Level | Font | Size | Weight | Tracking |
|-------|------|------|--------|----------|
| Page Title | General Sans | 28px | 700 | -0.02em |
| Section Title | General Sans | 22px | 600 | -0.01em |
| Card Title | Satoshi | 16px | 600 | -0.01em |
| Body Text | Satoshi | 14px | 400 | 0 |
| Small Body | Satoshi | 13px | 400 | 0 |
| Stat Value | JetBrains Mono | 28px | 700 | — |
| Data Label | JetBrains Mono | 11px | 500 | — |
| Section Label | JetBrains Mono | 10px | 600 | 0.14em + UPPER |
| Badge / Pill | JetBrains Mono | 10.5px | 600 | — |

### Typography Rules

**Do:** Use negative letter-spacing on headings (-0.01 to -0.03em). Tighter tracking makes large text feel premium and intentional.

**Do:** Use JetBrains Mono for ALL numeric data, even inline. Monospace numbers have consistent width, which keeps stat grids aligned and rating displays clean.

**Don't:** Use General Sans for body text or Satoshi for page titles. Each font has a lane. General Sans is display-only (600-700 weight). Satoshi is the interface voice. Crossing them breaks the hierarchy.

---

## 08 - Spacing & Layout: Spatial Rhythm

An 8px base grid with specific tokens. Consistent spacing is what makes the difference between "wireframe with colors" and "designed product."

### Spacing Scale

| px | Token | Tailwind |
|----|-------|----------|
| 4 | 2xs | `p-1` / `gap-1` |
| 8 | xs | `p-2` / `gap-2` |
| 12 | sm | `p-3` / `gap-3` |
| 16 | md | `p-4` / `gap-4` |
| 20 | lg | `p-5` / `gap-5` |
| 24 | xl | `p-6` / `gap-6` |
| 32 | 2xl | `p-8` / `gap-8` |
| 48 | 3xl | `p-12` / `gap-12` |
| 64 | 4xl | `p-16` / `gap-16` |

### Card Shadow Tiers

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.03)` | Subtle lift, default cards |
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.05)` | Hover state, interactive cards |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.07)` | Elevated cards, popovers |
| `--shadow-lg` | `0 8px 28px rgba(0,0,0,0.10)` | Modals, drawers, floating UI |
| `--shadow-colored` | `0 4px 16px var(--shadow-color)` | Beer-tinted shadow on selected cards |

To use `shadow-colored`, set `--shadow-color` inline: `style={{ '--shadow-color': styleVars.primary + '20' }}`.

---

## 09 - Component Library: UI Building Blocks

Every interactive element, specced and rendered.

### Buttons

**Primary / Style Buttons** (`variant="primary"` or `variant="style"`)
- Primary uses brand amber. "I'm having this" uses the beer's style primary color via `styleColor` prop.
- Always 600 weight, 12px radius, subtle colored shadow.
- Usage: `<Button variant="style" styleColor={getStyleVars(beer.style).primary}>I'm having this</Button>`

**Secondary Buttons** (`variant="secondary"`)
- Outlined, neutral. For secondary actions (Cancel, Add a note).
- Border darkens on hover, text darkens. Never competes with primary.

### Badges & Pills

**Style Badges** (`<BeerStyleBadge />`)
- Tint background + subtle border + color dot + style name.
- JetBrains Mono 10.5px/600. THE primary way beer style color enters the UI.
- Component: `components/ui/BeerStyleBadge.tsx`

**Achievement / Status Badges** (`<Pill variant="gold" />` etc.)
- Functional color system. These use gamification colors (bronze/silver/gold), NEVER beer style colors.
- Separate visual language from the content layer.

### Tabs

**Profile / Page Tabs** (`<PillTabs variant="underline" />`)
- Active = amber underline + primary text + 600 weight.
- Inactive = tertiary text + 500 weight.
- Counts rendered in JetBrains Mono.

**Feed Segmented Control** (`<PillTabs variant="segmented" />`)
- Active = white card with shadow. Inactive = transparent + tertiary text.
- 3px padding in warm-bg container.

### Stat Cards

**Stat Cards — Redesigned** (`<StatsGrid />`)
- Top accent bar (3px, amber gradient). Large monospace number (JetBrains Mono 28px/700). Uppercase small label (JetBrains Mono 9px/600, 0.12em tracking).
- Adds hierarchy and a touch of color without violating the content-layer-only rule.
- Component: `components/ui/StatsGrid.tsx`

### Section Headers

Two variants, used throughout the app.

**Label + Rule** (`<SectionHeader variant="label">ALREADY HAD</SectionHeader>`)
- JetBrains Mono 10px / 600 / 0.14em tracking / uppercase
- Extending hairline rule to the right. For list subgroups.

**Title + Action** (`<SectionHeader action={{ label: "See all", onClick }}>Upcoming Events</SectionHeader>`)
- General Sans 20px / 600 / -0.01em tracking
- Optional amber action link aligned right. For major content sections.

Component: `components/ui/SectionHeader.tsx`

---

## 10 - Card System: Card Variety Creates Life

The #1 problem in the current UI: every card looks the same. Different content types need visually distinct card treatments. 11 card backgrounds, each with a specific purpose.

| # | Type | Component Usage | When to Use |
|---|------|----------------|-------------|
| 1 | Default | `<Card>` | Lists, reviews, basic content |
| 2 | Warm Gradient | `<Card bgClass="card-bg-featured">` | Personality cards, Beer DNA, featured content |
| 3 | Golden Glow | `<Card mesh>` | Beer of the Week, featured promotions |
| 4 | Style-Tinted | `<Card bgClass="card-bg-reco" data-style="ipa">` | Selected beer cards (set `data-style` via `getStyleDataAttr()`) |
| 5 | Dark Fill | `<Card bgClass="card-bg-dark">` | Profile headers, session bubbles, brewery banners |
| 6 | Empty State | `<EmptyState>` component | "Create your first list", zero-data states |
| 7 | Achievement | `<Card bgClass="card-bg-achievement">` | Earned badges, streaks, XP |
| 8 | Textured Stripe | `<Card bgClass="card-bg-hoproute">` | Brewery passport, loyalty cards |
| 9 | Elevated | `<Card elevated>` | Modals, popovers, floating UI |
| 10 | Amber Accent Top | `<Card bgClass="card-bg-stats">` | Stats, summary cards (also `<StatsGrid>`) |
| 11 | Muted Panel | `<Card bgClass="card-bg-muted">` | Recessed panels, implementation notes, secondary content |

**Key rule:** By assigning specific card types to specific content, the eye can distinguish sections without reading a single word. Beer DNA gets type 2, achievements get type 7, stats get type 10.

Component: `components/ui/Card.tsx` — CSS classes in `app/globals.css`

---

## 11 - Iconography: Icon System

24x24 viewBox, 2px rounded stroke, amber/warm color language. All icons from Lucide React (`lucide-react`) — no external dependencies.

### Icon Specifications

| Property | Value |
|----------|-------|
| ViewBox | `0 0 24 24` |
| Stroke width | `2px` (1.5px for smaller contexts like badges) |
| Stroke linecap | `round` |
| Stroke linejoin | `round` |
| Fill | `none` (outline style by default) |
| Color | Inherits via `currentColor` |

### Render Sizes

| Size | px | Usage |
|------|-----|-------|
| Inline | 13px | Inside text, badges |
| Button | 16px | Inside buttons, pills |
| Nav | 20px | Navigation icons |
| Feature | 24px | Standalone feature icons |

### Icon Categories

**Core Navigation:** Home, Search, Users, Globe, Zap, Bell, Settings, User

**Beer & Session:** Beer, PlusSquare, Star, ThumbsUp, Clock, MapPin, Flag, Gift

All icons imported from `lucide-react`. No custom SVGs unless Lucide doesn't have the concept.

---

## 12 - UI Patterns: Recurring Design Patterns

### Empty States

Every empty state needs: an illustration or icon (not emoji), a headline explaining value, a description, and a CTA button. Use card type 6 (dashed border). Component: `<EmptyState>` from `components/ui/EmptyState.tsx`.

### Loading States

Skeleton screens over spinners. Every card, list, and section should have a shimmer skeleton matching the content layout. Use warm-bg (`#F7F1E8`) as skeleton base with subtle shimmer animation. Never show blank white space. Component: `<Skeleton>` from `components/ui/SkeletonLoader.tsx`.

### Feed Card Diversity

Each activity type in the feed must have a distinct visual treatment:

- **Session Card:** Avatar + brewery + beer list + duration. Left accent bar in dominant beer style color. Subtle style-tinted background gradient. Card type 1 + style tint.
- **Achievement Card:** Badge icon + username + achievement name + XP. Card type 7 (`card-bg-achievement`). More compact than session cards.
- **Review Card:** Beer name + rating (large stars) + review excerpt + tasting note badges. Card type 1.
- **Check-in Card:** Avatar + "checked in at [brewery]" + beer. Minimal height — single line with metadata.

Each card type should have noticeably different visual weight and height (Strava model).

### List vs Grid Toggle

- **Grid card:** Top = photo (or style-colored gradient placeholder). Bottom = white with brewery name, location, rating, top beer. Bottom gradient fade on photos.
- **List card:** Horizontal layout. Small square thumbnail on left, info on right. More compact, more scannable.

Components: `<BreweryCard variant="grid">` / `<BreweryCard variant="list">` and `<BeerCard>` variants.

### Review Display

- Reviews without text/tasting notes: collapsed into compact "rated this star 4.5" line
- Reviews with text: full card treatment
- Group identical "Josh rated this" entries into a single aggregated row
- Visual distinction between your own reviews and others'

---

## 13 - Engineering Standards: Implementation Rules

Non-negotiable standards for consistent implementation.

### CSS Architecture

**Use CSS custom properties for ALL design tokens.** Colors, spacing, radii, shadows, and font stacks — all via `--var`. Theme switching (light/dark/oled) is a single class swap on `<body>`.

**Transitions:** `--transition-micro: 0.2s` (hover, focus), `--transition-layout: 0.3s` (expand/collapse), `--transition-gradient: 0.6s` (session bubble color). Easing: `--ease-default: cubic-bezier(0.25, 0.46, 0.45, 0.94)`. Ease-out for entrances, ease-in for exits.

**No inline styles in production components.** The only exception is dynamic beer-style-color application (where CSS vars can't be used for gradient stops or dynamic color-mix).

### Accessibility

**WCAG AA contrast ratios:** 4.5:1 for normal text, 3:1 for large text. All beer style primary colors pass on their tint backgrounds. White text on dark gradients needs `text-shadow` for safety.

**Focus-visible outlines on all interactive elements.** 2px amber (`#C4883E`) outline with 2px offset. Never remove focus indicators — restyle to match HopTrack's aesthetic. Defined globally in `globals.css`.

**Semantic HTML:** `<button>` for actions, `<a>` for navigation, heading hierarchy (h1 to h6) on every page. Tab order follows visual layout. All images need descriptive alt text — beer photos should describe the style and color, not just "beer image."

### Performance

**Lazy load beer/brewery images below the fold.** Use IntersectionObserver with skeleton placeholders. Images fade in (opacity 0 to 1 over 0.3s) once loaded. Use `next/image` with `loading="lazy"`.

**CSS-only card backgrounds — no image assets for the 11 card treatments.** All card backgrounds use CSS gradients, `repeating-linear-gradient` for textures, and `box-shadow` for depth. Zero image requests for card chrome.

### Responsive Breakpoints

Mobile first. Design for 375px, adapt up.

| Breakpoint | Layout |
|-----------|--------|
| 375px | Mobile — single column, bottom nav |
| 768px | Tablet — 2-column grids, sidebar collapses |
| 1024px | Desktop — sidebar visible, 3-column grids |
| 1280px | Wide — max content width: 960px with centered layout |

### QA Checklist — Casey's Pre-Flight

Every component ships with these verified:

- [ ] Light mode renders correctly
- [ ] Dark mode renders correctly (when implemented)
- [ ] All text passes contrast ratio
- [ ] Focus states visible on keyboard nav
- [ ] Empty state handles gracefully
- [ ] Loading skeleton matches content layout
- [ ] Beer style colors map correctly from `beerStyleColors.ts`
- [ ] No style colors on UI chrome
- [ ] Fonts load correctly (General Sans, Satoshi, JetBrains Mono)
- [ ] Border radius matches spec (14px cards, 12px buttons)
- [ ] Shadow tier matches component type
- [ ] Responsive at 375px, 768px, 1024px

---

*This is a living document. — Morgan*
