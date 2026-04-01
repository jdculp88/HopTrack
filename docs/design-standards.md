# HopTrack Design Standards
**Owner:** Alex (UI/UX) + Jordan (Architecture)
**Last updated:** Sprint 100

---

## Spacing Scale

All spacing follows Tailwind's 4px base. Canonical values:

| Token | Tailwind | Pixels | Usage |
|-------|----------|--------|-------|
| **xs** | `gap-1` / `p-1` | 4px | Icon-to-text inside pills, tight inline groups |
| **sm** | `gap-1.5` | 6px | Text-to-pill vertical spacing, compact lists |
| **md** | `gap-2` | 8px | Between pills/badges in a row, between inline elements |
| **base** | `gap-3` | 12px | Section internal spacing (cards, stat grids) |
| **lg** | `gap-4` | 16px | Between cards, major UI groups, card padding |
| **xl** | `gap-6` | 24px | Between sections on a page |
| **2xl** | `gap-8` | 32px | Page-level section spacing (used in `space-y-8`) |

### Rules
- **Between pills in a row:** `gap-2` (8px)
- **Text label to pill row:** `gap-1.5` (6px) or `mt-1` (4px)
- **Card internal padding:** `p-4` (16px) default, `p-3` (12px) compact, `p-5` (20px) spacious
- **Between cards in a list:** `gap-2` (8px) for compact, `gap-3` (12px) for default
- **Page sections:** `space-y-8` (32px between major sections)
- **Section header to content:** `mb-3` (12px) for h2, `mb-2` (8px) for h3

---

## Component Standards

### Pills / Badges
Use `<Pill>` from `components/ui/Pill.tsx`:
- **Sizes:** `xs` (10px font), `sm` (12px font), `md` (12px font, more padding)
- **Variants:** `gold`, `muted`, `success`, `danger`, `ghost`, `style`
- Always `font-mono` for consistency
- Never inline `rounded-full px-2 py-0.5` — use Pill component

### Cards
Use `<Card>` from `components/ui/Card.tsx`:
- Always `rounded-2xl` with `border border-[var(--border)]`
- Padding: `compact` (p-3), `default` (p-4), `spacious` (p-5)
- Use `bgClass` for semantic backgrounds (`card-bg-stats`, `card-bg-reco`, etc.)
- Use `hoverable` for interactive cards

### Buttons
- Gold CTA: `background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-amber) 100%); color: var(--bg);`
- Ghost: `border border-[var(--border)] text-[var(--text-secondary)]`
- Always `rounded-xl` for buttons
- Never `motion.button` — use `<button>` with inner `<motion.div>` for animations

---

## Color Rules

### App Interior
- Always use CSS variables (`var(--surface)`, `var(--text-primary)`, etc.)
- Allowed hardcoded: `#0F0E0C` (bg) and `#D4A843` (gold) where CSS vars are unavailable
- For color-mixing: use `color-mix(in srgb, var(--accent-gold) 15%, transparent)` pattern

### Landing / Marketing Pages
- Use `C` constants from `lib/landing-colors.ts`
- These are intentionally hardcoded (design decision from Sprint 11)
- Never mix CSS vars and landing constants on the same page

---

## Typography

| Element | Font | Class |
|---------|------|-------|
| Beer names, brewery names, section headings | Playfair Display | `font-display` |
| Body text, labels, buttons | DM Sans | `font-sans` (default) |
| Stats, numbers, badges, pills | JetBrains Mono | `font-mono` |

---

*This is a living document — updated by Alex and Jordan as patterns evolve.*
