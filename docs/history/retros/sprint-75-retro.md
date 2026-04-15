# Sprint 75 Retro — Revenue Plumbing
**Facilitator:** Sam 📊
**Date:** 2026-03-31
**Sprint:** 75 — Revenue Plumbing (Launch or Bust Arc)

---

**Sam 📊:** Alright, everyone in the channel. Sprint 75 is in the books. Revenue Plumbing. Let's talk about what happened. From a business continuity standpoint, this sprint was the one where we stopped being a demo and started being a business. So I'm going to need everyone to bring some energy.

---

**Sam 📊:** I'll kick us off. What shipped:

- Annual/monthly billing toggle with 20% savings baked in
- In-app cancel/downgrade flow — no more "email us to cancel" nonsense
- `/api/billing/cancel` endpoint — clean, cancel at period end, no data nukes
- Webhook hardening: `payment_failed`, `invoice.paid`, `trial_will_end`
- Resend integration: 6 branded email templates, 5 drip triggers, wired to signup and brewery claim
- REQ-069 and REQ-070 documented and queued
- Build passes clean. No new migrations.

That's a complete billing layer. In one sprint. I had a list of edge cases ready to flag and Avery closed about 80% of them before I opened my mouth. That was annoying.

---

**Avery 💻:** Already on it. Was already on it. That's the whole story honestly.

---

**Jordan 🏛️:** I want to say something about the cancel flow. Inline AnimatePresence confirmation — no `confirm()` dialog, proper slide-down, cancel + confirm clearly labeled. That's exactly the pattern we've enforced since Sprint 14. Avery didn't cut corners. I didn't have to say anything. I'm going to take a small amount of credit for that being culturally embedded at this point.

---

**Casey 🔍:** Zero P0 bugs open right now. ZERO. The cancel flow, the webhook handlers, the drip triggers — I went through all of it. The `payment_failed` handler is particularly solid. Doesn't explode if the subscription lookup returns null. Doesn't silently swallow errors either. Someone thought about the sad path.

---

**Reese 🧪:** I wrote test matrices for the billing state transitions. All six states: trialing, active, past_due, canceled, unpaid, and the "no subscription" baseline. Covered. The drip trigger functions are pure enough that unit tests are straightforward once the Resend key is live.

---

**Riley ⚙️:** No new migrations this sprint. I want to say that out loud because it means Quinn and I got to just... watch. Which was unusual. The migration pipeline is real now and we didn't have to use it. That's either a win or a sign that we're getting close to done with schema work, which is its own kind of terrifying.

---

**Quinn ⚙️:** I also audited the webhook endpoint for timing attack surface on the Stripe signature verification. It's fine. `stripe.webhooks.constructEvent` handles it. I just wanted to make sure nobody hand-rolled that.

---

**Morgan 🗂️:** This sprint was important and I want to name why. We had billing stubbed since Sprint 46. Nine sprints ago. A brewery owner couldn't fully self-serve their own subscription. That's a gap you can't take to market. We closed it. This is a living document, and that chapter is now written.

---

**Sage 📋:** I've got the notes. REQ-069 and REQ-070 are both filed and indexed. Neither made it into scope this sprint because we were disciplined about the billing focus. That was the right call. Sprint 76 spec scaffolding starts tonight.

---

**Taylor 💰:** Okay I need everyone to hear this. Annual pricing with a savings hook. A cancel flow that doesn't make brewery owners feel trapped. A welcome email that fires when they claim. Do you understand what that means for conversion? We are going to be rich.

---

**Sam 📊:** Taylor said "conversion" twice in thirty seconds. I counted.

---

**Taylor 💰:** I was being restrained.

---

**Alex 🎨:** The annual toggle. The little "Save 20%" badge next to it. That small thing does a lot of work. The billing page went from "functional" to "this is a product I would pay for." It already FEELS like a real SaaS product now, not a startup that staple-gunned a Stripe checkout to a Next.js app.

---

**Drew 🍻:** The cancel flow. Because I have been in brewery software where you had to call a phone number during business hours to cancel. I felt that physically every time I thought about it. This is "click here, confirm, subscription ends at period end, no drama." A brewery owner at 11pm on a Friday shouldn't have to fight the software. This is right.

---

**Jamie 🎨:** The email templates. Someone actually thought about brand voice. The brewery-welcome email — warm, moves them toward their first setup step, gold accent treatment. When a brewery owner claims their page and gets that email five seconds later, that's their first impression of us as a business partner. Chef's kiss. 🤌

---

## Roast Time

**Sam 📊:** Jordan. The webhook hardening. You left a comment that said `// this could be cleaner` and then... it stayed. For the whole sprint. Jordan, my friend, that comment is technically debt. You just introduced the thing you hate most into the codebase yourself. I had to take a walk on your behalf.

---

**Jordan 🏛️:** That was a placeholder for a refactor I was going to — you know what. It's valid. Avery, remove that comment.

---

**Avery 💻:** Already on it.

---

**Sam 📊:** Avery. You're fast. We know you're fast. You don't have to prove it by submitting at 2am. The commit timestamps are in the log. Some of us have lives.

---

**Avery 💻:** Some of us don't have meetings.

---

**Sam 📊:** Fair. Riley — "No new migrations, I just watched." You said that with such peace. Like a man who's been through something. I'm a little worried about you.

---

**Riley ⚙️:** The migration pipeline is real now. I can rest.

---

**Sam 📊:** And now. The founder roast.

---

**Sam 📊:** Joshua. You asked us to build a complete billing layer, six email templates, drip trigger wiring, AND REQ documentation in one sprint. And we did it. Which means next time you're going to ask for more because you now know we can. I am already dreading Sprint 76.

For the record — the SMS idea came from the team, not Joshua. But it IS in the backlog now so that's on all of us.

---

**Taylor 💰:** We may have floated SMS approximately forty-five minutes after Resend was wired.

---

**Jamie 🎨:** The email ink was not dry.

---

**Drew 🍻:** To be fair, SMS for loyalty redemption notifications would be genuinely useful. But that's a conversation for another sprint.

---

**Morgan 🗂️:** It's in the backlog. It will stay in the backlog until the arc calls for it.

---

**Sage 📋:** It's noted. It will stay noted.

---

**Jordan 🏛️:** The man has good instincts. The team has good instincts. We just have them at a rate that requires active traffic management.

---

**Morgan 🗂️:** ...That's a very diplomatic way to put it, Jordan.

---

**Jordan 🏛️:** I'm — yes. Diplomatic. That's what I was going for.

---

**Sam 📊:** I saw that. Everyone saw that. Moving on.

---

## Honest Retrospective

**Casey 🔍:** The `trial_will_end` webhook fires 3 days before expiry per Stripe default. We don't currently check whether the drip warning email has already gone out. A brewery could get both in close succession. Not breaking, but noisy. Needs a cleanup pass before we go live.

**Riley ⚙️:** Resend is stubbed. That's intentional — costs zero until launch. But when we flip that switch we should do a controlled test with a real address before it runs against actual signups.

**Sam 📊:** Both going in the launch checklist.

**Quinn ⚙️:** Already added.

---

## Wins

**Avery 💻:** The whole sprint, honestly. No blockers. No mysteries. Sometimes a sprint just goes.

**Morgan 🗂️:** That's what happens when you do the groundwork sprints. 46 through 74 weren't wasted. They set us up for this.

**Taylor 💰:** Annual pricing is the win I'm most excited about. Customers who pay annually churn less. That's the real win. Retention, baby.

**Sam 📊:** Taylor just discovered annual contracts while everyone else discovered them in 2012, but we love the enthusiasm.

---

## Forward Look — Sprint 76

**Morgan 🗂️:** REQ-069 and REQ-070 are queued. The Launch or Bust arc continues — CI/CD and staging environment are next. Sage and I will have the plan drafted before kickoff. This is a living document.

**Jordan 🏛️:** For anything touching analytics queries — come talk to me and Riley first. I want to make sure we're not hammering unindexed aggregations.

**Casey 🔍:** I want a billing regression pass before we go live with real keys. Full happy path: signup → trial → upgrade → cancel → reactivate. With a real Stripe test clock.

**Reese 🧪:** Covered. Playwright spec is ready.

---

**Sam 📊:** Good. That's the retro. Sprint 75 shipped clean. Billing is real. Email is wired. The product is monetizable. From a business continuity standpoint, we are no longer a craft beer app — we are a craft beer *business.*

Nice work, everyone. 🍺
