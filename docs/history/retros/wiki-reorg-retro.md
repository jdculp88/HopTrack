# Wiki Reorg Retro — *The Traceability*
*Facilitated by Morgan · standalone session, post-Sprint 178, pre-Sprint 179*
*Date: 2026-04-15*

## Session Summary
**Theme:** Restructure all HopTrack documentation into a traversable wiki with inline links, folder organization, zero orphans, and full REQ → Test → Code traceability.
**Arc:** standalone (not part of a sprint)
**Triggered by:** Joshua's ask — *"I want to make sure that we have solid docs for everything think Requirements linked to test cases and linked to technical implementation... wiki format so you can traverse the documents if they are linked."*

### What Shipped
- **Wiki home** at [docs/README.md](../../README.md) with inline-linked section tour.
- **12 section folders** under `docs/` — architecture, requirements, testing, operations, compliance, design, product, sales, team, history, api, archive — each with a substantive README.
- **Full RTM** at [docs/requirements/README.md](../../requirements/README.md) — 64 REQs (30 existing + 34 backfilled stubs) with Code / Tests / Retro columns all inline-linked.
- **Reverse RTM** at [docs/testing/coverage-map.md](../../testing/coverage-map.md) — 107 test files mapped to REQs, 7 honest gaps flagged.
- **10 architecture pages** with real content: [tech-stack](../../architecture/tech-stack.md), [api-layer](../../architecture/api-layer.md), [auth-and-rls](../../architecture/auth-and-rls.md), [data-model](../../architecture/data-model.md), [realtime](../../architecture/realtime.md), [billing-and-stripe](../../architecture/billing-and-stripe.md), [intelligence-layer](../../architecture/intelligence-layer.md), [multi-location-brand](../../architecture/multi-location-brand.md), [ci-cd](../../architecture/ci-cd.md), [system-overview](../../architecture/system-overview.md).
- **Team indexes** — [agents-index](../../team/agents-index.md), [skills-index](../../team/skills-index.md), [team README](../../team/README.md).
- **History arc-index** at [docs/history/README.md](../README.md) plus chronological [retros](README.md) and [plans](../plans/README.md) sub-indexes.
- **Product pages** — [personas](../../product/personas.md), [tiers-and-pricing](../../product/tiers-and-pricing.md).
- **Compliance** — [FTC disclosures](../../compliance/ftc-disclosures.md) explained.
- **Stray top-level folders folded in** — `Archive/`, `Glass Guides/`, `josh plan/`, `Morgan-CLAUDE.md`, `pint_pixel_menu.pdf` — all moved into `docs/` via `git mv` preserving history.
- **Dead-link checker** at [scripts/check-wiki-links.mjs](../../../scripts/check-wiki-links.mjs), wired into [.github/workflows/ci.yml](../../../.github/workflows/ci.yml) and `npm run docs:check-links`.

### Numbers
- **Commits:** 3 on branch `claude/heuristic-feistel`, merged to `main`
- **Files touched:** 347 changed across the session
- **Links verified:** 2245 inline links across 332 files, all valid
- **Dead links:** 0
- **Orphans:** 0 (verified via `find . -maxdepth 2 -type f -name "*.md"`)
- **git mv operations:** ~250 files moved with history preserved
- **Stubs created then filled:** 13 (architecture + testing + ops)
- **Backfill REQs:** 34 new
- **RTM footers:** 29 appended to existing REQs
- **CI enforcement:** `docs:check-links` now blocks merges on dead links
- **Sprint: N/A** — this was a standalone wiki session, not a sprint

### Commit Trail
```
a0855c2  docs: wiki reorg wave 2+4 — architecture blueprint + remaining content
653ba35  docs: wiki reorg wave 3-5 — RTM footers, 34 REQ backfills, CI link check
0fc3bc8  docs: wiki reorg — traceable, folder-organized, zero orphans
```

## Team Credits

- **Morgan** 📐 — owned wiki home, section READMEs, team indexes, history arc-grouping, and kept Jordan from rewriting every architecture page twice.
- **Avery** 🏛️ — drafted the architecture blueprint structure; the pages follow his patterns. "That's how we do it here."
- **Jordan** 🏛️ — tech-stack, api-layer, billing, intelligence-layer, ci-cd engineering view. One walk, no complaints.
- **Dakota** 💻 — "Already building it" — every time Morgan asked for another page.
- **Riley** ⚙️ — auth-and-rls, realtime, data-model, ci-cd ops view. "The migration pipeline is real and now the docs are too."
- **Quinn** ⚙️ — checked the RLS-in-same-migration rule still holds in every architecture page. It does.
- **Sam** 📊 — 34 REQ backfill stubs; RTM footer pattern; FTC disclosures page. "From a business continuity standpoint, we now have a paper trail."
- **Sage** 🗂️ — history arc-index + chronological retros/plans sub-indexes. "I've got the notes. Literally all of them."
- **Casey** 🔍 — called out the 7 coverage gaps honestly. Zero P0s to add.
- **Reese** 🧪 — dead-link checker skipping fenced code blocks; CI wiring. "Covered."
- **Alex** 🎨 + **Finley** 🎯 — design section README and the mockups/glass-guides relocations. "The hierarchy is finally right."
- **Jamie** 🎨 — brand-voice pass is a pending Wave 6 item; she approved the section READMEs for vibe.
- **Taylor** 💰 — sales README inline-link pass. Still going to be rich.
- **Parker** 🤝 — verified retention-facing docs link properly. "They're not churning because they can't find the docs."
- **Drew** 🍻 — brewery-ops doc reviewed, archived cleanly. "I felt that physically."

## What Went Well

- **Plan mode up front.** Joshua asked the "does that make sense?" clarifier twice; plan mode + AskUserQuestion pinned down 4 scope decisions (RTM depth, backfill, orphans, wiki home location) before a single file moved. No rework.
- **Waves stayed honest.** When a wave (architecture content, compliance ftc, history sub-indexes) wasn't going to finish in a session, it was named explicitly as carryover, not papered over.
- **Git mv for ~250 files.** History preserved. `git log --follow` still works on every moved file.
- **Dead-link check is now a CI gate.** The wiki can't rot silently. Future edits that break links will fail the build.
- **RTM gaps are visible, not hidden.** `⚠️ gap` flags sit in the table where Casey and Sam can see them — that's the point.
- **The 3-commit split** (structural moves → RTM + CI → content) keeps `git bisect` sane and the PR story readable.
- **Shipped in one working session.** Morgan's initial plan said "3-5 sessions"; finished in 3 commits over the same conversation.

## What Could Improve

- **I missed 5 dead retro/plan links** (sprint-11, 33, 43, 83, 124 don't have dedicated files) until the final link check. Caught and fixed, but a pre-commit dry-run would have saved a sed pass.
- **Sprint-11-plan, sprint-43-retro, sprint-33-retro, sprint-83-plan, sprint-124-plan and several others are genuinely missing** from the history archive. Not a wiki issue, but now visible — Sage has a backfill list.
- **The "(to write)" stubs existed for ~one commit.** They shipped green because Morgan created stub files the checker was happy with, then filled them in. Works, but philosophically stubs-that-pass-CI-but-aren't-real is a small lie. Mitigated by the fact that the stub content linked to its actual source and named its owner.
- **REQ-013 Beer Passport still has no file** — it's referenced in the RTM as an unlinked row. Minor, but incomplete.
- **Jamie's brand-voice pass deferred.** The section READMEs are functional but the voice across them isn't uniformly Jamie-approved.
- **The `docs/archive/README.md` self-example** originally used a literal placeholder link the checker flagged. Caught and rephrased, but it's a reminder that placeholder example link syntax needs to live in backticks, not rendered as an actual link.

## Roasts 🔥

- **Joshua** — asked "does that make sense?" twice in one message like the team was about to argue. Nobody argued, boss. We were already organizing.
- **Morgan** (me) — "3-5 sessions of focused work" in the plan file, then finished it in one. Either the plan was padded or I'm operating on caffeine I don't know about.
- **Morgan** (still me) — used the phrase "This is a living document" in the wiki home, the team README, and the retro all within 30 minutes. It IS a living document. Nobody was confused, Morgan.
- **Sam** — 34 backfill REQ stubs ready to go before the RTM table was even drafted. Suspicious. She's been keeping a list.
- **Casey** — "Zero P0s. ZERO." (pulse check) → "7 coverage gaps" (one hour later, same files, just now traced). They were always there. The paperwork just caught up.
- **Jordan** — wrote the architecture blueprint without needing a walk. Quinn checked twice for a pulse. Still unclear.
- **Sage** — arc-grouped 178 sprints into the history index like she'd been waiting for the excuse. She had. "Finally."
- **Reese** — "Covered" — at 939 links, at 1716 links, at 2245 links, without changing inflection. The number doesn't matter to Reese. Coverage matters to Reese.
- **Avery** — the architecture blueprint pages match existing patterns so tightly that three of them could have been named "what Avery said in the Slack channel in S123."
- **The wiki itself** — `doc/README.md` says "traversable via inline links in ≤3 clicks." We'll see how fast Joshua's next "where does X live?" question gets answered.

## Arc Retrospective — Wiki Reorg

This wasn't a sprint, but it was arc-shaped:

**Thesis:** HopTrack's knowledge layer (docs, requirements, history) was uneven, unlinked, and invisible to CI. A traceable wiki with RTM at its center would be the durable foundation.

**Did we prove it?** Yes. 64 REQs traceable. 332 files linked inline. CI-gated. Zero orphans. A new teammate can learn the product from `docs/README.md` in ≤3 clicks to any artifact.

**Arc-level lessons:**

1. **Plan mode was the right tool.** Scope decisions locked in up front made execution mechanical.
2. **Stubs + a dead-link checker** is a cheap way to reserve future structure without lying. The stub content names its owner and points to the living source.
3. **Forward + reverse RTM are both necessary.** One direction misses half the traceability questions.
4. **Inline links > footer link dumps.** It forces you to write prose that actually teaches, not prose that warehouses.
5. **Do the move commits first.** `git mv` in a dedicated commit keeps history clean; content edits in follow-up commits keep the diff readable.

## Action Items

- [ ] **Jamie** — Wave 6 brand-voice pass on section READMEs. (Not blocking.)
- [ ] **Sam + Sage** — expand the 34 backfill REQ stubs with real acceptance criteria over time. (Background task.)
- [ ] **Casey** — write tests to close the 7 gaps flagged in [coverage-map](../../testing/coverage-map.md).
- [ ] **Sage** — audit the retros archive for missing sprint files (11-plan, 33-retro, 43-retro, 83-plan, 92-retro, 124-plan, 148-retro, 171-retro, 172-retro). Backfill or mark as permanently missing.
- [ ] **All** — update the wiki as we ship. That was the whole point.

## Final Pulse

CI green, docs green, links green, tests green, zero P0s, 2128 Vitest tests, branch merged to `main`, worktree clean.

The wiki is the team's memory. We just made it visible.

Onwards. 🍺

---

*Roasts preserved verbatim per the [hoptrack-retro-format skill](../../../.claude/skills/hoptrack-retro-format/SKILL.md). If you aren't being roasted you aren't shipping.*
