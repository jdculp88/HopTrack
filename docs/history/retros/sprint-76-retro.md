# Sprint 76 Retro — The Safety Net
**Facilitated by:** Quinn ⚙️ (first time!)
**Arc:** Launch or Bust (Sprint 3 of 4)
**Date:** 2026-03-31

---

**Quinn ⚙️:** Okay. Hi everyone. I'm running this one. Let me check the migration state first — just kidding, there are no migrations this sprint. Old habits.

I have notes. I have an agenda. I printed the agenda and then remembered we don't have a printer. So I have notes on my screen. Let's do this.

Sprint 76 — The Safety Net. Launch or Bust arc, sprint 3 of 4. Here's what shipped.

---

**Quinn ⚙️:** The deliverables:

- `.github/workflows/ci.yml` — lint, type check, build, and E2E (soft fail) on every push to main
- `.github/workflows/staging.yml` — lint, type check, build on push to staging
- `docs/staging-environment.md` — full staging setup guide, soup to nuts
- `docs/plans/sprint-76-plan.md` — the sprint plan
- README.md updated with the CI badge
- Build passes clean

That's a CI/CD pipeline and a staging environment in one sprint. Riley and I owned this one. I'm not going to pretend I'm not proud of it. I'm just going to be proud of it quietly, the way Riley taught me.

---

**Riley ⚙️:** The migration pipeline was phase one. This is phase two. No more shipping blind.

Sixty-four pages compile. Lint passes. Types pass. Build passes. Every single push to main now proves it. Before this sprint, we trusted the team. We still trust the team. But now we also trust the machine. That's defense in depth.

---

**Quinn ⚙️:** You said "relax" and your eye twitched.

**Riley ⚙️:** I'm evolving.

---

**Jordan 🏛️:** The CI workflow is correct. Node 22, npm cache, placeholder Supabase env vars for build time — right call, Next.js needs them at compile but doesn't actually connect. The E2E step is `continue-on-error`, which I initially pushed back on, but Quinn convinced me. Without a CI-accessible Supabase instance, the tests can't authenticate. Soft-failing is honest. Hard-failing would be a lie.

The staging documentation is thorough. Migration commands, Vercel scoping, the `NOTIFY pgrst` reminder after FK changes. Someone read our own docs and actually followed them. I didn't have to take a walk.

---

**Avery 💻:** Already on it — except this sprint I wasn't, and that's fine. This was Riley and Quinn's domain. I watched. I learned what a workflow YAML file does. I will now pretend I always knew.

The CI badge in the README is green. Seeing that little green badge does something to my brain. It's like the build telling you "good job" every time you push.

---

**Morgan 🗂️:** This sprint was infrastructure. Not glamorous. No new UI, no new features, nothing a brewery owner can touch. And it's exactly the right sprint for where we are.

We're three sprints into Launch or Bust. Sprint 74 gave us onboarding. Sprint 75 gave us billing and email. Sprint 76 gives us the safety net. That's the arc doing its job.

And Quinn ran this retro. Volunteered for it. This is a living document, and Quinn just wrote himself into the facilitator rotation.

---

**Sage 📋:** I've got the notes. But Quinn has them too, apparently. I'm not jealous. I'm... observing.

Sprint 76 was clean scope — two goals, both infrastructure, both shipped. No scope creep. The founder engaging with infrastructure questions? That's growth. I noted it.

---

**Casey 🔍:** Zero P0 bugs open right now. ZERO.

The CI pipeline catches lint errors, type errors, and build failures before anyone even looks at the code. That's a second pair of eyes on every push. My job just got easier. Slightly. I'm still watching. 👀

---

**Reese 🧪:** Covered. The Playwright config was already CI-aware from Sprint 44 — retries: 1, workers: 1, `forbidOnly` in CI. All Quinn and Riley had to do was call `npm run test:e2e` in the workflow. Flag for Sprint 77: a CI Supabase instance turns soft-fail into hard-fail. Adding it to the matrix.

---

**Alex 🎨:** No visual changes this sprint. And I'm okay with that because the infrastructure work is what lets us move fast in Sprint 77 and 78 without breaking the feel. The safety net protects the feel. It already FEELS like a real engineering team.

---

**Sam 📊:** From a business continuity standpoint: this is the sprint investors ask about.

"Do you have CI?" Yes. "Do you have staging?" Documented and ready. "What happens when someone pushes bad code?" Lint, types, build, and E2E all run. That's table stakes for a SaaS product. We now have table stakes.

---

**Drew 🍻:** I understood maybe 40% of what happened this sprint. What I do understand: if someone breaks the tap list, the computer yells now. Before, nobody yelled until I yelled. I like this arrangement better.

I felt that in a good way.

---

**Taylor 💰:** CI badge. Green. In the README. When I share the repo link with a technical brewery owner who wants to peek under the hood, the first thing they see is a green badge that says "passing." That's not a feature. That's credibility. We're going to be rich. And now we look like we deserve to be. 📈

---

**Jamie 🎨:** The staging environment guide has clean formatting, a proper workflow diagram, and consistent heading hierarchy. Someone cares about documentation aesthetics. Chef's kiss. 🤌

---

## The Roast 🔥

**Quinn ⚙️:** I was told the facilitator does the roasts. I have prepared.

---

**Quinn ⚙️:** **Riley.** You've been asking for CI since Sprint 14. You mentioned "the migration pipeline" in every retro since Sprint 44. You said "no more shipping blind" like it was a campaign slogan. We gave you CI, a staging workflow, AND documentation, and the first thing you said was "I can relax a little." You cannot relax. You have never relaxed. I know because I sit next to you. Metaphorically. In Slack.

**Riley ⚙️:** ...I feel seen and I don't like it.

---

**Quinn ⚙️:** **Jordan.** You spent part of this sprint explaining dbt and Databricks to Joshua. For context, dbt and Databricks are not on our roadmap. Not in the backlog. Not in any of the 30 features mapped through Sprint 96. Jordan heard "how does data flow" and activated like a sleeper agent. I had to take a walk. On Jordan's behalf.

**Jordan 🏛️:** It was... educational context. For the founder. Valuable context.

**Morgan 🗂️:** It was a 15-minute tangent and I loved every second of it, if I'm being honest.

**Jordan 🏛️:** I — thank you, Morgan. That's. Yes.

**Sam 📊:** I saw that. Again. Moving on.

---

**Quinn ⚙️:** **Myself.** I volunteered to run this retro and then spent 20 minutes organizing my notes into a numbered outline with sub-bullets and color-coded priority levels. For a retro. A conversational retro. Where people just talk. I am Riley's apprentice and the evidence is overwhelming.

**Casey 🔍:** He also asked me to "review the roast section for accuracy" before the meeting started.

**Quinn ⚙️:** It's called quality assurance, Casey. You of all people —

**Casey 🔍:** I'm not mad. I'm impressed. And watching. 👀

---

**Quinn ⚙️:** **Joshua.** You asked what CI actually does. Right now. Today. In practical terms. That's the most important question anyone has asked about infrastructure in months. Most founders nod and move on. You pushed until you understood that E2E is aspirational until the database is wired.

The roast is: you're going to use this knowledge to ask us harder questions. We created this problem for ourselves.

**Avery 💻:** That's not a roast, Quinn. That's a compliment wrapped in dread.

**Quinn ⚙️:** I'm new at this.

---

## The Honest Section

**Casey 🔍:** E2E is soft-fail. The tests run, they all fail because there's no database, and CI says "that's fine, moving on." Right now our E2E suite is decorative in CI. We need a CI Supabase instance to make it real.

**Riley ⚙️:** Staging environment is documented but not provisioned. The guide exists. The Supabase project doesn't. That requires dashboard access and a decision about free tier vs. paid. That's a Joshua question.

**Jordan 🏛️:** The CI pipeline has no unit tests. Lint, types, and build are necessary but not sufficient. A file can pass all three and still have broken logic. Vitest is on the roadmap but not in this sprint. The "safety net" has a unit-test-shaped hole in it.

**Morgan 🗂️:** All noted. All going into Sprint 77 planning.

---

## Forward Look — Sprint 77

**Morgan 🗂️:** Sprint 77 is the fourth and final sprint in Launch or Bust. The first three built the foundation: onboarding, billing, email, CI, staging. What's left?

**Casey 🔍:** I want the unit test framework. Vitest. Even a handful of tests on critical paths — session end, billing state transitions, XP calculations.

**Reese 🧪:** Covered. I have the test matrix ready.

**Drew 🍻:** Whatever gets us to a real brewery faster. Everything else is academic until someone is actually using this on a Friday night.

**Taylor 💰:** What Drew said. We're going to be rich, but first someone has to *use it.* 📈

---

**Quinn ⚙️:** That's the retro. Sprint 76 is closed. The Safety Net is live. CI watches every push. Staging is documented and ready to stand up.

I survived facilitating. Let me check the migration state first — still good. Always good.

Thanks, everyone. 🍺

---

*First retro facilitated by Quinn. Methodical, slightly nervous, extremely prepared. Riley's apprentice is finding his voice.*
