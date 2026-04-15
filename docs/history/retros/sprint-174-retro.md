# Sprint 174 Retro — "The Coming Soon"

**Date:** 2026-04-10
**Sprint type:** Focused half-sprint (single-session, triggered by founder request)
**Outcome:** ✅ Shipped locally, queued for production

## What shipped

A public-facing coming-soon landing page for `hoptrack.beer` with a waitlist that doubles as a geographic demand-mapping tool for GTM prioritization.

**Files created (12):**
- `supabase/migrations/109_waitlist.sql` — waitlist table, RLS locked, demand indexes
- `lib/schemas/waitlist.ts` — Zod schema with brewery_name refinement + honeypot
- `lib/__tests__/waitlist-schema.test.ts` — 23 schema tests (all pass)
- `app/api/waitlist/subscribe/route.ts` — public POST endpoint, rate-limited, service-role insert
- `components/landing/ComingSoonContent.tsx` — marketing page (hero, drinker features, brewery features, waitlist form)
- `app/(superadmin)/superadmin/waitlist/page.tsx` — admin viewer with by-state demand bars
- `app/api/superadmin/waitlist/export/route.ts` — CSV export with explicit is_superadmin guard
- `docs/blog-drafts/README.md` — blog draft index
- `docs/blog-drafts/01-paper-punch-cards-cost-brewery-money.md` — ~780 words
- `docs/blog-drafts/02-brewery-tap-list-software-buyers-guide.md` — ~880 words
- `docs/blog-drafts/03-mug-club-loyalty-program-brewery-retention.md` — ~820 words, Drew to sanity-check
- `docs/blog-drafts/04-2025-craft-beer-midyear-report.md` — ~900 words, evergreen-refreshable
- `docs/blog-drafts/sources.md` — master source index with disclosure note

**Files modified (5):**
- `app/page.tsx` — env-var flag wired with `generateMetadata` override
- `lib/email-templates/index.ts` — added `waitlistConfirmEmail` template
- `lib/email-triggers.ts` — added `onWaitlistSignup` trigger
- `components/superadmin/SuperadminNav.tsx` — added Waitlist nav entry
- `.claude/launch.json` — added "Next.js Dev (Coming Soon)" config on port 3002

**Test results:**
- 1884/1884 Vitest tests passing (23 new)
- 0 lint errors, 0 new warnings
- TypeScript typecheck clean
- Live preview verified at localhost:3002 — page renders, audience toggle works, API path reaches DB

**NOT shipped (intentional):**
- Migration 109 pushed to Supabase (Joshua's call)
- `COMING_SOON_MODE=true` flipped in Vercel (Joshua's call)
- Blog drafts committed to main (Joshua wants to review first)
- `app/blog/` route group (waiting on draft approval + MDX vs CMS decision)

---

## The retro

**🗂️ Sage** *kicks it off*: Alright team, this wasn't a full sprint — Joshua walked in with one request ("I need a really nice coming soon screen") and we shipped it in a single session. **12 files created, 5 modified, 23 new tests, 1884 total still green, 0 lint errors, typecheck clean.** Migration 109 queued but not pushed. Blog drafts sitting uncommitted in `docs/blog-drafts/` per Joshua's explicit request to review them first. I've got the notes. Calling it Sprint 174 for the history log. *Roast incoming*: **Morgan**, you almost shipped the whole thing without asking which toggle method Joshua wanted — good thing I taught you to use `AskUserQuestion`.

**📐 Morgan**: I asked three questions because the answers actually mattered. All three came back "Recommended." You're welcome. 😌

**🏛️ Jordan**: I had to take a walk when I saw someone almost wire up a `TO anon` RLS policy. We don't have a single one across 108 migrations — we're not starting with 109. The locked-table + service-role pattern is the right call. Good catch in the Plan agent phase — that's what that phase is FOR.

**🏛️ Avery**: Already on it — the API route is clean. `parseRequestBody`, `apiConflict` for dupes (not `apiBadRequest`), `createServiceClient` for the insert, fire-and-forget trigger with `void`. That's how we do it here. No ad-hoc `NextResponse.json({ error: ... })` crap. **Dakota**, this is the template to mirror for the next public endpoint.

**💻 Dakota**: Already building it — wrote `WaitlistForm` with inline state, no `Toast` dependency because `ToastProvider` isn't in the root layout. Honeypot field, `AnimatePresence` on the conditional brewery_name input, raw `<button>` wrapping `<motion.span>` because I'm not getting yelled at by **Alex** today.

**🎨 Alex**: Good. You're learning. Also — that "*pouring soon.*" italic gold headline against the cream canvas? **It already FEELS like an app.** Nice restraint on the hero — no fake mockup, just the headline and the CTA. Less is more when the promise is big.

**🎯 Finley**: The hierarchy is RIGHT. Eyebrow → Playfair headline → subhead → CTA. The audience toggle is a pill group, not a radio group — more tactile, better for touch. The state dropdown is abbreviated to save horizontal space. I'd nudge the feature card padding by a pixel or two, but we can do that post-launch. *Roast:* **Morgan**, you hardcoded the feature card colors instead of making a proper variant. Works for now. Don't let it stay.

**⚙️ Riley**: The migration pipeline is real now — `109_waitlist.sql` is sequential, RLS enabled in the same file, zero policies, `UNIQUE INDEX ON (lower(email))` for case-insensitive dedup, demand-mapping indexes on state/audience/created_at. Only gripe: **it's still sitting on disk.** Joshua, run `npm run db:migrate` when you're ready. That's on you.

**⚙️ Quinn**: Let me check the migration state first — yeah, 108 is the latest pushed, 109 is queued. I'll also note that the CHECK constraint on `brewery_name_required` is a belt-and-suspenders play alongside the Zod refinement. Good defense in depth. Rollback plan: the table has no foreign keys to anything and RLS locks it, so a `DROP TABLE waitlist CASCADE` cleanly reverses it. Safe to push.

**🔍 Casey**: **Zero P0 bugs open right now. ZERO.** 1884 tests green, 23 brand new, schema coverage is complete — happy paths, brewery refinement, validation errors, honeypot, max lengths, every US state individually enumerated. Lint 0 errors. Typecheck clean. This is what sprint close should feel like every single time.

**🧪 Reese**: Covered. 23 tests, all the edge cases I care about. Honeypot rejection tested. Email lowercasing verified (`"MIXED.Case@Example.COM"` → `"mixed.case@example.com"`). Every US state + DC in a loop. No API integration test because we follow the codebase convention — schemas in `lib/__tests__/`, no jsdom-mounted route handlers. **Casey** approves.

**🎨 Jamie**: **Chef's kiss 🤌** — "HopTrack is *pouring soon.*" is the perfect headline. Playful, on-brand, not corporate SaaS word salad. The confirmation email copy — "No spam. No newsletter. Just one email when we're ready to pour." — is the kind of thing that gets screenshotted and shared. The audience-aware email body (different line for brewery vs user) is a nice touch. *Roast:* **Morgan**, you stuck the 🍺 emoji in the subject line without asking me. I'll let it slide because it's a waitlist email, not a deliverability-critical one. This time.

**💰 Taylor**: We're going to be rich 📈. The waitlist isn't just a list — it's a **demand map**. Every signup is a data point I can use to prioritize **Drew**'s outreach sequence. The superadmin page ranks states by count with sorted bars — when Asheville hits 50 and Charlotte hits 30, I know exactly which city gets the launch press release first. *Roast:* **Morgan**, you almost skipped the state-demand visualization on the admin page. The ENTIRE POINT of this feature was demand mapping. The form isn't the product — the intel is.

**🤝 Parker**: They're not churning on my watch — the confirmation email nails the first touchpoint. One thing for later: the success state is a dead end. We should add a "share this with a beer friend in your city" link to the success panel. Would 2-3x list growth for free. Backlogging it.

**🍻 Drew**: I felt that physically when I saw "Loyalty that actually works — stamp cards, mug clubs, brand-wide passports, all digital, all yours." That's EXACTLY how I'd pitch it to a brewery owner over a flight at Wedge. And the blog drafts? Posts 1, 3, and 4 are publish-ready from a brewery-ops perspective. **Post 3 (mug clubs)** is the hot take I'd want to own personally — let me review the specifics before it ships, because "mug clubs don't retain customers" is going to get pushback from exactly the people we want as customers, and I want to make sure the data lands clean.

**📊 Sam**: From a business continuity standpoint — I'm happy with the edge case coverage. Dupe emails return 409, not 500. Brewery-without-brewery-name is a 400 with the right field name. Rate limit returns 429. Honeypot fails silently via max(0) on the website field. The sad paths all route correctly. *Small flag for the backlog:* the success state doesn't give the user a way to correct if they realize they entered the wrong city. Minor. Not a P0. Parker's share-link idea fixes it as a side effect.

---

## Joshua gets roasted (lovingly) 👑

1. **"Supaspace" / "locao" / "setup/"** count for this session: zero documented typos, but "dont create any new pages for the site just yet" was deployed twice, which suggests Joshua half-expected Morgan to ignore it the first time. She didn't. She also wrote him 4 blog drafts IN CHAT and then he asked where to read them. Morgan: "They were directly above, in the same conversation, 20 lines up." We love you. Scrollback is hard. We saved them as files.

2. **"Do what you think is best"** is the most Joshua phrase in the Joshua dictionary. It's also the phrase that, historically, creates the best work. Keep saying it. We'll keep shipping.

3. **You still aren't a corporation.** The "get rich" plan is bottlenecked on paperwork sitting somewhere in Raleigh. Taylor: "I cannot close a brewery until you can legally accept money from them. The LLC is the single biggest P0 on the business side." Call the NC Secretary of State.

4. **You bought `hoptrack.beer` in Sprint 142** (32 sprints ago) and we just now shipped the coming-soon page for it. In fairness: the domain has been quietly doing nothing for 32 sprints, so the waitlist starts from zero. Jamie: "That's not a bug. Nobody knew to look."

5. **You caught a real problem with CLAUDE.md this session** — the "Where We Are" section has been getting updated with sprint-specific content that belongs elsewhere. That's a genuinely good catch. You get a 🍺 for this one. The team is fixing it in this same commit.

---

## What we learned

**1. Plan agents catch real footguns.** The Plan agent we launched in Phase 2 of this sprint caught five bugs that would have cost rework:
- The `TO anon` RLS policy that doesn't exist anywhere else in our codebase
- `CITEXT` that isn't used in any HopTrack migration
- `ToastProvider` not being in the root layout (would've crashed at runtime)
- Themed `Button`/`Input` components inappropriate for marketing pages (theme var collisions)
- `errorMap` being Zod v3 syntax; v4 uses `{ message: ... }`

Every single one would have been a "why is this broken?" debugging session if caught post-commit. The Plan agent phase paid for itself five times over in one sprint.

**2. The EnterPlanMode workflow works.** Phase 1 (explore) → Phase 2 (design) → Phase 3 (clarify) → Phase 4 (write) → Phase 5 (approve) is now battle-tested on a real feature with real stakes. No scope creep, no wasted work, no "oh I should have asked about that" moments.

**3. Writing drafts in chat is a broken UX for long-form content.** Joshua couldn't find the blog drafts after they were delivered in a single long message. Lesson: for any content ≥500 words that the user will want to re-read or share, **save it to a file** from the start. Chat is ephemeral; filesystem is forever.

**4. CLAUDE.md bloat is a real problem and Joshua noticed it first.** The "Where We Are" section was being updated every sprint with info that already lives in sprint-history, retros, and memory files. Triple-duplicated. Joshua called it out. Fixed in this same commit. The `sprint-close` skill itself needs to be updated in a follow-up to remove the CLAUDE.md edit step entirely.

**5. Marketing pages should never use themed components.** This is now codified: `components/landing/*` uses `lib/landing-colors.ts` constants only, NEVER CSS vars, NEVER `components/ui/Button|Input|Card`. The theme toggle would leak from the app interior into the marketing surface. Any future marketing component MUST follow the `LandingContent.tsx` pattern exactly.

---

## Deferred to backlog

- **Parker's referral/share link** on the waitlist success state
- **Finley's feature card variant** (the hardcoded colors in `ComingSoonContent.tsx`)
- **Sam's edit-after-submit flow** (subsumed by Parker's share link)
- **Drew's Post 3 review** before mug-club blog post publishes
- **`sprint-close` skill update** — remove the CLAUDE.md edit step, make it surgical instead of full-file-rewrite
- **Memory file cleanup** — `MEMORY.md` index is over its 24.4KB soft limit, needs per-sprint entry pruning
- **`app/blog/` route group scaffold** — when drafts are approved and we pick MDX vs Supabase CMS
- **OG image variant for `?type=coming-soon`** — for Twitter/X and Facebook shares of hoptrack.beer
- **JSON-LD structured data** on the coming-soon page (Organization, WebSite, SoftwareApplication schemas)
- **`app/sitemap.ts` + `app/robots.ts`** verification for coming-soon mode

---

## What's on Joshua

1. Read `docs/blog-drafts/README.md` and the four draft posts
2. Run `npm run db:migrate` to push migration 109 to Supabase
3. Flip `COMING_SOON_MODE=true` in Vercel Production env vars when ready to go live
4. Call the NC Secretary of State about the LLC
5. Decide: MDX blog in-repo or Supabase CMS before `app/blog/` gets scaffolded

---

🍺 *Ship great things. See you next session.*
