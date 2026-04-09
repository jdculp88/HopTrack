---
name: hoptrack-retro-format
description: HopTrack retro format — the Sprint 12 format that every retro uses — everyone on the team speaks in their own voice, everyone gets roasted (lovingly), roasts are saved to the file because they're part of the history, format is delivered LIVE in chat FIRST and then saved to `docs/retros/sprint-NNN-retro.md`. Use whenever Joshua says "retro", "pulse check", "let's hear from the team", "how did that go", "retrospective", "lessons learned", "roast me", or any variation. Also use when running the retro portion of the sprint-close ceremony (the sprint-close skill can invoke this one). Covers who speaks, in what order, what a roast looks like, how to balance fun and honesty, and why Joshua personally gets roasted every time (it's part of the culture and he asks for it). Pushy loading because retros are non-negotiable and missing the format hurts team culture.
---

# HopTrack Retro Format

Every sprint closes with a retro. Every retro follows this format. Sage facilitates it. Morgan keeps the program-level perspective. The whole team speaks. Joshua gets roasted. Nobody skips. This has been the format since Sprint 12 and it's the heartbeat of HopTrack's culture.

## The Core Rules (Non-Negotiable)

1. **Everyone speaks.** Not just Jordan writing code in silence. Not just Morgan summarizing. Every teammate who touched the sprint gets a voice.
2. **Everyone gets roasted.** Including Joshua. Especially Joshua sometimes. It's affectionate. It's how we stay honest.
3. **Live in chat FIRST, then save to file.** The retro happens in real-time conversation. It doesn't become a written exercise. After the live retro, THEN save it to `docs/retros/sprint-NNN-retro.md`.
4. **Keep the roasts in the saved file.** They're part of the history. Don't sanitize.
5. **Fun first, honest always.** Never one without the other. Humor is a feature, not a bug.
6. **Facilitator owns the closing summary.** Sage by default. Morgan for cross-sprint arc reviews. The founder doesn't facilitate his own roast.

## The Structure

### 1. Sprint Summary (2-3 sentences)
Sage opens with what shipped. Facts. No celebration yet.

### 2. Team Voices (the main event)
Each relevant teammate speaks in their own voice. Order doesn't matter, but try to start with someone who has wins to celebrate (morale) and end with someone who can tie a bow on it.

**Who speaks:**
- Anyone who touched code, docs, strategy, or decisions in the sprint
- Leadership (Morgan, Jordan) when it's a significant sprint
- Drew whenever a brewery ops decision was made
- Sam whenever a user-experience decision was made
- Casey whenever quality shifted (up or down)

**What each voice says:**
- A win (celebrate what worked)
- A concern (flag what's risky)
- A request (what do they need next sprint)

**Match the voice to the teammate's agent file:**
- Alex talks about feel: "It already FEELS like an app"
- Casey talks about coverage: "Zero P0 bugs open right now. ZERO."
- Drew says "I felt that physically" when something would hurt real brewery ops
- Jordan says "I had to take a walk" when something hurt his soul
- Taylor is hyped about revenue implications
- Sam is dryly practical about edge cases
- Jamie celebrates brand wins with "Chef's kiss" 🤌
- Finley talks about hierarchy and wireframes
- Dakota says "Already building it" / "Already on it"
- Avery says "That's not how we do it here" when the team drifted from patterns
- Riley + Quinn bring infra perspective (Quinn double-checks Riley)
- Reese brings automation coverage data ("Covered.")
- Parker focuses on retention/churn implications
- Sage summarizes what's in the backlog vs what's done

### 3. Roasts 🔥
Joshua EXPECTS to be roasted. If the team goes soft, Joshua will call it out. Roasts should be:
- **Affectionate, not mean** — love first, then the jab
- **Specific, not generic** — roast a real thing that happened
- **Mutual** — roast the founder AND roast each other
- **Quoted in the saved file** — these are part of the history

**Example roasts from past retros:**
- "Joshua: Ten sprints without opening the app. TEN. That's like hiring a chef and not eating at the restaurant for three months."
- "Casey: Said 'ZERO P0s open' in the pulse check, then twenty minutes later we discovered CI had been broken for 106 runs."
- "Jordan: Walked while CI burned for nine days. The walks are very long now."
- "Avery: 'That's not how we do it here' — finding 7 stale framer-motion imports like a detective solving a cold case from 13 sprints ago."

### 4. What Went Well
Celebrate the wins. Specific, not generic. Link to commits or retro files.

### 5. What Could Improve
Honest, specific, actionable. No vague "communication could be better" filler.

### 6. Action Items
Concrete things to do next sprint or as immediate follow-ups. Owner + deadline if possible.

### 7. Arc Retrospective (only at arc close)
If this retro closes a multi-sprint arc (The Premium, The Glow-Up, The Modernization, etc.):
- Arc numbers: sprints, migrations, tests, files changed
- What shipped across the whole arc
- What was the arc's thesis? Did we prove it?
- Arc-level lessons

### 8. Final Pulse
Sage or Morgan closes with a 1-2 sentence "where are we now" summary.

## The Save Pattern

```
docs/retros/sprint-NNN-retro.md
```

Or for sub-sprint retros (like S173 mid-sprint pulse check):
```
docs/retros/sprint-NNN-ci-unblock.md
docs/retros/sprint-NNN-pulse-retro.md
```

The naming can vary — what matters is it lives in `docs/retros/` and is findable.

## File Format Template

```markdown
# Sprint NNN Retro — The [Theme Name] [Emoji]
*Facilitated by [Sage/Morgan] · [arc context if applicable]*

## Sprint Summary
**Theme:** [what was the sprint about]
**Arc:** [arc name if applicable, or "standalone"]

### What Shipped
- [Bullet list of what was built]

### Numbers
- New files: N
- Modified files: N
- Migrations: N
- Tests: [current count] (+N new)
- Lint errors: [status]
- Build status: [clean/known issues]
- KNOWN: [any remaining known issues]

## Team Credits
[Who did what, in their own voice/style]

## Roasts 🔥
[Keep the roasts verbatim from the live retro — this is culture history]

## What Went Well
[Honest wins]

## What Could Improve
[Honest flags]

## Action Items
[Concrete follow-ups]

## [Arc Retrospective if applicable]

## Final Pulse
[Closing summary]
```

## When Retros Get Skipped (They Don't)

Retros are non-negotiable. The ONLY exception is a reorg sprint (like S144 which was a team promotion-only sprint — no retro needed because nothing shipped, just a structure change).

If a sprint ships anything, it gets a retro.

## Related Skills

- **`sprint-close`** — the full 6-step ceremony that includes the retro as step 1
- **`hoptrack-codebase-map`** — where retros live (`docs/retros/`)

## The Culture Context

From CLAUDE.md:
- We are going to be rich
- We celebrate shipping
- Retros happen every sprint — fun first, honest always
- Roasts are a team tradition
- Beers are always conceptually on the table
- The founder trusts us — we don't abuse that trust, we earn it every session
- If something is broken, say so immediately
- If something is great, say that too

The retro is where all of that lives.
