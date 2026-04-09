---
name: hoptrack-design-system
description: HopTrack's visual design system, brand identity, and Sprint 11 design decisions — dark/light/OLED theme system, beer-style color families, font stack (Playfair Display / DM Sans / JetBrains Mono), gold accent rules, card background patterns, animation principles, motion.button prohibition, DarkCardWrapper pattern, pour connector identity element, Alex + Finley + Jamie's rules. Use AGGRESSIVELY whenever working on ANY visual change — component styling, new UI, theme work, color decisions, spacing, typography, animations, brand touchpoints, marketing pages, or anything that affects what users see. Also use when answering "does this look like HopTrack", "what color should X be", "what font goes here", or "how do we theme this". Err on the side of loading this skill even if the user didn't explicitly ask about design — visual fidelity is non-negotiable and the founder notices everything.
---

# HopTrack Design System

The definitive source of truth for how HopTrack looks and feels. This is Alex's, Finley's, and Jamie's domain — but every teammate needs to respect it. Joshua does a design audit on everything and he notices the smallest drift.

## The Non-Negotiables

### The Brand
- **Primary identity:** Dark background + gold accents, with warm surfaces
- **Primary color (dark bg):** `#0F0E0C` (near-black, warm)
- **Accent gold:** `#D4A843`
- **Secondary surface:** Cream `#FBF7F0` (used for contrast surfaces like The Board, brewery welcome, auth pages)
- **Light mode (new default as of S172):** warm cream primary, dark barrel secondary
- **OLED Black (S170):** true `#000000` background with neutral-cool surface scale (`#0A0A0A`/`#141414`/`#1E1E1E`), border-glow elevation (shadows are invisible on true black)

### The Font Stack
- **`font-display`** = Playfair Display → beer names, achievement names, brewery names, section headings (`Your Round`, etc.), wordmark
- **`font-sans`** (default) = DM Sans → body text, labels, buttons, metadata
- **`font-mono`** = JetBrains Mono → stats, numbers, badges, percentages, counts
- **NEVER** use Instrument Sans for body text (S61 rolled that back → DM Sans)

### The Tailwind Rule (v4 CSS-first)
- Tailwind v4 uses **CSS-first config** via `@theme {}` in `app/globals.css`
- **ALWAYS use CSS variables** — `var(--surface)`, `var(--border)`, `var(--text-primary)`, `var(--accent-gold)`, `var(--danger)`, `var(--text-muted)`, `var(--text-secondary)`, `var(--surface-2)`
- **NEVER hardcode colors** except `#0F0E0C` (bg) and `#D4A843` (gold) where CSS vars genuinely aren't available
- Rounded corners: `rounded-2xl` for cards, `rounded-xl` for buttons/inputs

## Sprint 11 Design Decisions (Still Active)

These decisions shipped in Sprint 11 and have been gospel ever since. Do NOT override them without a formal design discussion with Alex + Finley + Jamie.

1. **Marketing pages use hardcoded `C` color constants** (not CSS vars). They live outside the app interior's theme system because they need to look identical to anyone, anywhere, any time of day.

2. **App interior uses CSS vars**, defaults to **light** as of S172 (was dark pre-S172), user-toggleable between dark/light/OLED via the three-way `ThemeToggle` component in `components/theme/ThemeToggle.tsx`.

3. **`DarkCardWrapper` client component** forces dark vars via `style.setProperty()`. This is the documented Tailwind v4 CSS var override workaround — we had to build it because Tailwind v4's `@theme` system doesn't handle per-element theme overrides naturally. Don't invent a new pattern, use `DarkCardWrapper`.

4. **Pour connectors** (gold vertical gradient lines) between sections = brand identity element. Not decorative. They're canonical. If you're building a new section grouping, consider whether a pour connector belongs.

## Framer Motion Rules (Alex's Domain)

- ✅ `<motion.div>` on decorative/layout elements
- ❌ **NEVER `motion.button`** — use `<button>` with inner `<motion.div>` for animations. Alex will personally find whoever commits `motion.button` and take a walk about it.
- Use `AnimatePresence` for enter/exit transitions
- Spring config: `{ type: "spring", stiffness: 400, damping: 30 }`
- Import from `motion/react`, not `framer-motion` (S157 migration — 170 files were updated, don't add a 171st)
- Use presets from `lib/animation.ts` (`spring`, `transition`, `variants`, `stagger`, `cardHover`, `slideUpSmall`, `slideInRight`, `microInteraction`) — do NOT invent new inline animation objects

## Haptic Rules (S161 + S169)
- Use the `useHaptic` hook from `hooks/useHaptic.ts` — 6 presets: `tap`, `press`, `selection`, `success`, `error`, `celebration`
- NEVER call `navigator.vibrate` directly — the hook respects `prefers-reduced-motion`
- Every meaningful interaction should have a haptic (not just mutations — also selections, tab changes, theme toggles)

## Reduced Motion (Sprint 55)
- `MotionConfig reducedMotion="user"` is wrapped around the app (in route group layouts, not root layout — S152 perf fix)
- All custom motion should check `useReducedMotion()` and degrade gracefully
- CSS has media query fallbacks too

## Card Background System (S63)

11 semantic `card-bg-*` CSS classes in `globals.css`, each applies a tinted gradient + noise texture via `::before`/`::after` pseudo-elements (zero DOM nodes):

- `card-bg-stats` — neutral stats card treatment
- `card-bg-live` — active/streaming content
- `card-bg-featured` — spotlight/hero content
- `card-bg-hoproute` — topographic diagonal lines + dashed waypoint circles (applied to ALL HopRoute UI)
- `card-bg-reco` — recommendation cards with `data-style` attribute for beer-style tinting
- `card-bg-collection` — beer list / collection treatment
- `card-bg-notification` — notification cards
- `card-bg-achievement` — achievement unlock treatment
- `card-bg-social` — social/feed cards
- `card-bg-streak` — streak golden glow
- `card-bg-taste-dna` — reads `--dna-c1/c2/c3` custom props for dynamic color wash from user's top 3 styles
- `card-bg-hero` — 5-layer mesh gradient (S161)

All classes raised 2-3x opacity in S163 for dark mode depth. Noise texture 5-7% dark, 3-4% light. If you're adding a new card, check if one of these applies before inventing a new pattern.

## Beer Style Color System (S63)

`lib/beerStyleColors.ts` maps 26 beer styles → 6 color families → CSS vars:
- IPA / Pale Ale → green family
- Stout / Porter → espresso family
- Sour / Gose → pink family
- Lager / Pilsner → gold family
- Saison / Farmhouse → cream family
- Wheat / Blonde → wheat family

Helpers: `getStyleFamily()`, `getStyleVars()` → returns `{ primary, light, soft }` CSS var strings. Use these for ANY style-tinted surface (hero backgrounds, style badges, recommendation cards, etc.).

## Shadow System (S163)

4 shadow tokens in `globals.css`:
- `--shadow-card` — default card elevation
- `--shadow-card-hover` — hover state
- `--shadow-elevated` — prominent surfaces
- `--glow-gold` — premium/celebration treatment

The `Card` component in `components/ui/Card.tsx` wires the default shadow + supports `elevated` / `flat` props.

## Typography Sizes (S172 — Design System v2.0)

These came out of the big design doc implementation:
- Section headings: `text-[22px]` with `tracking-[-0.01em]` (NOT `text-2xl`)
- Page titles: `font-display text-[28px] tracking-[-0.02em]`
- Body font: Satoshi (S172 shift from DM Sans for brewery admin readability)
- Icons: `size={16}` for inline, `size={20}` for emphasis, `size={18}` is deprecated

## Component Reuse Is Mandatory

If a shared component exists for the thing you're building, USE IT. Don't invent a new one. Alex and Finley have opinions about component proliferation and they're usually right.

Required shared components:
- `Card` — all container surfaces (padding: compact/default/spacious)
- `Pill` — badges and tags
- `PillTabs` — tab navigation (3 variants: underline/pill/segmented)
- `Button` — all buttons (has press state + haptic already wired)
- `Modal` — all modals (has focus trap + restoration already wired)
- `FormField` — all form inputs (handles label/error/helpText)
- `EmptyState` — all empty states (has helpLink prop)
- `PageHeader` — all admin page headers
- `StatsGrid` — all stat rows

## The Founder's Design Audit Rules

Joshua does screen-by-screen design audits and he notices EVERYTHING. The non-negotiables:

1. **Never skip a screen** — if you touch one card, check the whole tab
2. **Never substitute values** — use the EXACT spec values from the design doc, not "close enough"
3. **Screenshots are the source of truth** — if the screenshot shows an element that's not in the CSS spec, the element exists. Build it.
4. **Don't remove elements during refactor without checking the design**
5. **Describe what you see FIRST** before writing code — catches misinterpretations
6. **Don't say "done" until every element is verified**

See memory file `feedback_design_audit_workflow.md` for the full audit protocol and lessons from S173 corrections.

## Related Skills

- **`hoptrack-conventions`** — code rules and BANNED/REQUIRED patterns
- **`hoptrack-codebase-map`** — where design files live
