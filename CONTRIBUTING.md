# Contributing to HopTrack

## Workflow

We push straight to `main`. No PR gates, no branch protection. The founder trusts the team. Earn that trust every commit.

## Code Style

- **TypeScript strict mode** — no untyped code
- **Tailwind CSS v4** — use CSS variables (`var(--surface)`, `var(--accent-gold)`), never hardcode colors
- **Framer Motion** — never `motion.button`, always `<button>` with inner `<motion.div>`
- **Supabase** — use `createClient()` from `lib/supabase/server` (RSC) or `lib/supabase/client` (browser). Cast with `as any` only when Supabase types genuinely can't represent the join shape, and add a `// supabase join shape` comment.

## Conventions

- Every data page gets a `loading.tsx` skeleton
- No `alert()` or `confirm()` — use toast or inline confirmation
- No dead buttons — gate unbuilt features with "Coming soon" tooltip
- No blank pages — every empty state gets a friendly message + CTA
- No silent failures — surface errors to the user

## Commit Messages

Use conventional format: `feat:`, `fix:`, `style:`, `docs:`, `refactor:`, `test:`, `chore:`.

## Who Reviews What

| Area | Reviewer |
|------|----------|
| Architecture & patterns | Jordan |
| UI/UX & feel | Alex |
| Quality & edge cases | Casey + Reese |
| Brewery ops realism | Drew |
| Brand & copy | Jamie |
| Revenue impact | Taylor |
| Infrastructure & migrations | Riley + Quinn |
| Priorities & scope | Morgan |

## Migrations

See `supabase/migrations/README.md` for naming conventions and how to apply.
