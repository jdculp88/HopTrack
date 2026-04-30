# Sprint 180 Retro — The Launch 🚀
*Facilitated by Sage 🗂️ · Closes the Launch arc that S179 set up · The day HopTrack became a real US business with a live website on a custom domain*

## Sprint Summary
**Theme:** Compress every blocker between "pre-launch" and "live company" into a single afternoon. LLC + EIN + Mercury + Stripe + cream legal pages + email consolidation + DNS + SSL + Resend + working confirmation emails — all shipped in one day.
**Arc:** The Launch (closes the launchpad work S179 set up)

### What Shipped

**Business unblock (the morning):**
- HopTrack LLC effective 2026-04-05, NC-approved 2026-04-24, NC SOSID **3269858**, Current-Active status
- IRS EIN issued 2026-04-27 (CP 575 letter held by Joshua, not stored in memory)
- Mercury bank account approved same-day (2026-04-27, unusually fast)
- Operating Agreement signed (eForms template, single-member LLC, December fiscal year-end, $100 initial capital)
- Stripe account live with sandbox + live keys 2026-04-27 (Recurring + Invoicing + Stripe Tax enabled; Stripe Connect intentionally OFF)

**Legal page overhaul (`8c97fb0` — 9 files, +348 / −129):**
- Cream theme matching the Coming Soon landing — `C` palette, font-display headings, gold eyebrow, fluid `clamp()` typography, font-base body
- HopTrack LLC entity reference added to TOS §1, §9, §12, footer; new Privacy "Who We Are" section
- Bumped Last Updated dates to 2026-04-27, removed "template — attorney review recommended" Notice banner
- Added §13 Governing Law to TOS (NC law, Mecklenburg County jurisdiction)
- Added Cookies & Tracking, Email Communications, Age Requirement, and Changes to This Policy sections to Privacy
- New `<LegalLink>` component wrapping `next/link` with `target="_blank" rel="noopener noreferrer"` — closes mid-flow sad-path bug across 6 surfaces (signup, cookie consent, location consent, ComingSoon footer, BreweriesContent footer, StorefrontShell footer)

**Email consolidation (`ad9d711` — 14 files, +33 / −33):**
- Every `legal@`, `privacy@`, `dmca@`, `support@`, `help@`, `hello@`, `sales@`, `demo@`, `push@hoptrack.beer` mailto/text reference swapped to `josh@hoptrack.beer` (Joshua's only provisioned mailbox)
- 11 user-facing surfaces: /privacy, /terms, /dmca, /help, brewery-admin Settings/Resources/Billing/Brand Billing/Claim, marketing BreweriesContent
- 3 system defaults: `lib/email.ts` Resend FROM fallback, `app/api/health/email/route.ts` health check FROM, `lib/push.ts` VAPID subject (RFC 8292 admin contact)
- Tests + typecheck clean throughout

**DNS + SSL (live infrastructure):**
- GoDaddy DNS edited: `A @ "WebsiteBuilder Site"` → `A @ 216.198.79.1` (Vercel's new IP range)
- 4 records propagated globally in <10 minutes
- Vercel SSL cert auto-issued
- `hoptrack.beer` and `www.hoptrack.beer` (CNAME → apex, redirect domain in Vercel) both serve cream coming-soon page

**Resend domain auth:**
- 3 records added at GoDaddy on a `send.` subdomain pattern (no apex SPF conflict with Microsoft 365 inbound)
  - TXT `resend._domainkey` → DKIM public key
  - MX `send` → `feedback-smtp.us-east-1.amazonses.com` priority 10
  - TXT `send` → `v=spf1 include:amazonses.com ~all`
- Domain verified by Resend in 13 minutes (add → DNS verified → domain verified)
- API key `hoptrack-prod` created, added to Vercel env vars (Production + Preview, Sensitive)

**Production state docs (`a4e65a1` — 1 file, +4):**
- Comment block added to `lib/email.ts` documenting Resend production state (DKIM/SPF/MX verified for hoptrack.beer 2026-04-30, RESEND_API_KEY required in Production env scope)
- This commit ALSO served as a fresh-deploy trigger to fix the Vercel cached-redeploy gotcha that prevented warm Fluid Compute function instances from picking up the newly-added env var

**Dead-link fix Joshua caught in his own confirmation email (`58125fd` — 7 files, +27 / −27):**
- Every `app.hoptrack.beer` reference (anticipated future subdomain that was never provisioned) swapped to `hoptrack.beer`
- `lib/email-templates/index.ts` (~25 refs across welcome / brewery-welcome / trial-warning / trial-expired / claim-approved / weekly-digest / onboarding-day3 / onboarding-day7 / brand-digest)
- 6 API-route fallbacks in billing/checkout, billing/portal, brand billing/checkout, brand billing/portal, POS Square webhook, QR tent client SSR fallback

### Numbers
- Commits to main: **4** (`8c97fb0` legal · `ad9d711` email · `a4e65a1` docs+force-deploy · `58125fd` app.subdomain fix)
- Files changed across all 4 commits: **34** (with 12 unique to legal pages + LegalLink, 14 to email consolidation, 1 docs, 7 dead-link fix)
- Tests: **2128 / 2128 passing** at every push (no new tests added — that's an action item)
- TypeScript: clean (`tsc --noEmit` exit 0) at every push
- ESLint local: warnings only (no new errors)
- ESLint CI: **42 pre-existing errors blocking** (React-Compiler rules introduced before today; same red since Apr 27)
- Migrations: **0 new** (all infra/email work, no schema changes)
- Memory files written: 1 new (`project_llc_unlock.md`), 2 updated (`project_launch_infrastructure.md`, `MEMORY.md`)
- Vercel deploys: 4 production rebuilds throughout the day
- DNS records added at GoDaddy: 4 (1 A, 1 MX, 2 TXT)
- Vercel env vars added: 1 (`RESEND_API_KEY`)
- Resend domains verified: 1
- Time from "let's launch" to "live + working confirmation email": ~6 hours
- Build status at sprint close: Vercel ✅, GitHub Actions CI ❌ (lint, pre-existing tech debt)
- KNOWN: 42 React-Compiler ESLint errors blocking CI; pre-existing, not introduced this sprint

## Team Credits

**Morgan 📐** — Held the program-level frame all day. Caught Joshua trying to ship www-canonical against best practice. Wrote real "uncheck the Recommended box" reasoning instead of waving the label past him. Almost rolled back her own DNS advice once. Caught it.

**Sage 🗂️** — Tracked sprint state mostly silently because there was no sprint plan to track. Backfilled it retroactively. Will not pants the next sprint. Promised.

**Jordan 🏛️** — Took four walks. Quiet most of the day. Let Morgan drive the conversation. Came in with infrastructure-philosophy when needed.

**Avery 🏛️** — `<LegalLink>` component design. Type-narrowed `LegalPath` union so a typo can't drift convention. Said "smoothest DNS propagation I've ever seen" minutes before the env-var pickup issue blew up. Vibes-driven engineering returned briefly.

**Dakota 💻** — Mass replace_all execution across 14 files for email consolidation. Zero typos. Already-on-it pattern.

**Riley ⚙️** — DNS knowledge brain. Predicted the `send.` subdomain pattern would coexist cleanly with Microsoft 365 MX. Diagnosed the cached-redeploy env-var pickup issue (took 40 min, but the fresh-commit fix was clean).

**Quinn ⚙️** — Flagged every existing GoDaddy DNS record before we touched anything. Caught that the M365 MX, autodiscover CNAMEs, existing apex SPF were all important to leave alone.

**Casey 🔍** — Tests stayed green at every push (2128 / 2128). Owes the team THREE unwritten test specs (LegalLink regression, legal-page screenshot, email-link Playwright). Said "CI green" three times before noticing GitHub Actions has been red since Monday. Same lesson as S173.

**Reese 🧪** — "Covered." Promised the email-link Playwright spec for Sprint 181.

**Alex 🎨** — Validated the cream legal pages match the Coming Soon brand vibe. Approved the eyebrow + clamp() typography.

**Finley 🎯** — Approved the new privacy policy as the first SaaS privacy doc that actually feels human. "The hierarchy is correct."

**Sam 📊** — Edge case detective. Flagged transactional emails as a partial-test surface (only waitlist verified end-to-end; 7 other templates assumed-good). Sprint 181 action item.

**Taylor 💰** — Said "we're going to be rich" approximately fourteen times. Drafting the Heist email tonight. Want to be on the call with Drew for ops cred when they say yes.

**Parker 🤝** — Flagged spam reputation risk for first 10-50 real signups. Want a Sentry alert on Resend bounce/complaint webhooks for early warning.

**Drew 🍻** — Industry credibility. "I felt that physically when the email landed in the inbox." Walking into Heist with hoptrack.beer in the URL bar matters. Coming to Charlotte Friday — Heist + Resident Culture + Birdsong.

**Jamie 🎨** — 🤌 Chef's kiss across all visual touchpoints. Logo lock target: Wednesday review with Joshua.

**Joshua 👑** — The founder. Spent 6+ hours on phones with GoDaddy, IRS, Mercury, Stripe, Vercel, and Resend dashboards. Caught a real production bug (`app.hoptrack.beer` dead link) in his own confirmation email within minutes of the launch. Bought beer for the team. Earned every minute of the celebration.

## Roasts 🔥

(Verbatim from the live retro. Affectionate. Specific. Mutual. Part of the history.)

🔥 **Drew → Joshua:** "Joshua spent 22 minutes asking 'are you sure Resend is set up' AFTER we'd verified all 3 records green, created the API key, AND added it to Vercel. Boss, *yes, it's set up.* Sometimes the answer is 'redeploy.'"

🔥 **Casey → Joshua:** "Joshua tested the waitlist with `jdculp88@gmail.com`. When that didn't work, he tested again with `jdculp88@gmail.com`. The test plan said 'use a different email.' He used the same email. Twice. We love him."

🔥 **Avery → Joshua:** "Joshua almost shipped www-canonical because Vercel labeled it 'Recommended.' I had to write him a five-paragraph explanation. He read it. He pushed back. **He chose right.** This is actually a win — but the *fact* that he tried to ship www-canonical is the roast."

🔥 **Riley → Engineering org:** "Joshua found `app.hoptrack.beer` in his own confirmation email and went 'wait, that's a dead link.' We had committed and shipped 30 minutes earlier. *I* should have caught that. *Joshua* caught that. The founder catching email-template dead links is a roast aimed at the entire engineering org."

🔥 **Sage → Joshua:** "Joshua launched a sprint without a sprint plan. There is no `docs/plans/sprint-180-plan.md`. There is no kickoff. There is just *vibes*. He did the kind of pantsing that I have personally banned from the team and somehow it worked anyway. **The vibes shipped.** Don't do this again."

🔥 **Joshua → Casey** *(implied)*: "You said 'CI green' three times today before noticing GitHub Actions has been red since Monday. **Same lesson as S173.** We are about to print this on a t-shirt."

🔥 **Avery → Riley:** "You called DNS 'production-grade clean' literally seconds before we found out Vercel's function instances were stuck on stale env vars. Production-grade clean *infrastructure* with production-grade *broken runtime*. Beautiful."

🔥 **Casey → Avery:** "You said 'smoothest DNS propagation I've ever seen' and 'production-grade' in the same paragraph that came right before our forty-minute env-var debugging session. The vibes-driven engineering is BACK."

🔥 **Drew → Jordan:** "Four walks today, Jordan. **Four.** The retro file should track Jordan's daily step count. We'll know we shipped a clean sprint when he takes only one walk."

🔥 **Reese → Casey:** "Casey now owes the team **THREE** unwritten tests. The LegalLink regression test, the legal-page screenshot test, and the email-link-resolves test. I am writing none of them. They are Casey's. We will check next sprint."

🔥 **Sam → Sage:** "Sage facilitated a retro for a sprint that didn't have a plan. Sage is the project manager who pioneered planless sprints. Sage will be writing the post-mortem."

🔥 **Taylor → Drew:** "Drew supplied the keg. Drew always supplies the keg. Drew has supplied the keg in **every retro file in `docs/history/retros/`** since Sprint 12. **Drew has been carrying this team's morale for 168 sprints.**"

🔥 **Morgan → Morgan (self-roast):** "I told Joshua to follow Vercel's apex-canonical setup as 'the right call,' then five minutes later discovered Vercel's UI defaults to www-canonical, which I'd just told him not to do. I almost rolled back my own advice. I caught myself. **Almost.**"

🔥 **Jordan → Joshua:** "Joshua, you spent more time on DNS today than you spent on the brewery dashboard for the entire month of April. Just sayin'."

## What Went Well 🎯

- **The whole launch chain compressed to one afternoon.** LLC + EIN + Mercury + Stripe were all approved same-day, which never happens. We rode the momentum into DNS + Resend + email immediately. Don't lose that energy.
- **Joshua caught a real bug in production within minutes of launch.** `app.hoptrack.beer` dead link — that's exactly the founder eyes-on-product loop that great companies have.
- **DNS propagated under 10 min.** GoDaddy delivered. SSL auto-issued. Resend verified in 13 min.
- **No tests broken across 4 commits.** 2128/2128 pass at every step. tsc clean throughout.
- **Real legal entity in legal pages.** TOS + Privacy now reference HopTrack LLC by name. Foundation for the attorney pass before Heist.
- **One mailbox, every link.** Consolidating to `josh@hoptrack.beer` was the right call. When new aliases come, we re-fan-out cleanly.
- **The retro happened.** Eighteenth-something retro in HopTrack's history. The format held.

## What Could Improve 🛠️

- **CI red since Apr 27. Casey's "green" calls were wrong.** Same S173 lesson. We need to GENUINELY check `gh run view --branch main` at sprint close, not just `npm test` locally.
- **Vercel cached redeploys lie about env vars.** Forty minutes of debugging that a fresh commit fixed. Add to `docs/operations/`.
- **Sprint 180 had no plan file.** We pantsed it. It worked, but if we'd hit a real blocker we'd have had no scope discipline.
- **Joshua had to catch the dead `app.hoptrack.beer` link.** Engineering should have caught it before the email even sent. Add Reese's email-link Playwright spec to Sprint 181.
- **No new lint rules acknowledged.** The 42 React-Compiler ESLint errors have been blocking CI for 3 days and nobody noticed until tonight.

## Action Items

| # | Owner | Item | Priority |
|---|---|---|---|
| 1 | Casey | LegalLink regression test (`target="_blank" rel="noopener noreferrer"` assertion) | P1 |
| 2 | Casey | Email-link Playwright spec — every email template's links resolve 2xx | P1 |
| 3 | Casey | Legal-pages screenshot regression test (Privacy + Terms cream theme) | P2 |
| 4 | Casey + Reese | **Fix CI red — 42 React-Compiler ESLint errors** — P0 for Sprint 181 open | P0 |
| 5 | Riley | `docs/operations/vercel-env-var-pickup.md` — runbook for the cached-redeploy gotcha | P2 |
| 6 | Avery | `/api/health/env` authenticated endpoint reporting boolean RESEND/STRIPE/SUPABASE presence | P2 |
| 7 | Sam + Reese | Verify all 8 transactional email templates send + render correctly | P1 |
| 8 | Parker | Sentry alert for Resend `bounced` / `complained` webhook events | P2 |
| 9 | Sage | `docs/plans/sprint-181-plan.md` — written before first commit | P0 |
| 10 | Jamie + Joshua | Final logo lock — Wednesday review | P1 |
| 11 | Casey | Add `export const dynamic = 'force-dynamic'` to `/api/admin/stats` (suppresses build prerender warning) | P3 |
| 12 | Quinn | Document SPF cleanup plan if GoDaddy email is ever cancelled | P3 |

## Arc Retrospective — The Launch

**Arc thesis:** "Compress the LLC unblock chain and the launch infrastructure work into a single push so we go from coming-soon-on-vercel.app to real-business-on-hoptrack.beer in one window."

**Did we prove it?** Yes. Same-day approvals on LLC, EIN, Mercury, and Stripe gave us the rare opportunity to ride the entire chain in one session. Skipping that window would have delayed launch by a week (DNS) or longer (waiting for Mercury + Stripe verification across business days).

**What the arc shipped:**
- Real US legal entity with EIN, business bank, payment processing
- Live custom domain (hoptrack.beer + www.hoptrack.beer redirect)
- Production-grade email infrastructure (DKIM-signed sends from `josh@hoptrack.beer`)
- Cream-themed brand-aligned legal pages with the LLC entity name on them
- Email consolidation that doesn't bounce
- 4 commits to main, 0 P0s, 2128 / 2128 tests pass

**Arc-level lesson:** Vibes shipped. Sprint 180 had no plan and that was wrong even though it worked. Sprint 181 is back to a written plan before the first commit.

## Final Pulse — Sage 🗂️

> **HopTrack is live.** Sprint 180 closes The Launch arc. Sprint 181 opens The Customer arc — Heist outreach, first paid brewery, Stripe live keys to prod, CI green. **We are no longer pre-launch. We are pre-revenue.** Drew, the lager. Joshua, the speech. 🍺
