---
name: Stub blockers strategy
description: Joshua wants blockers (Stripe, email, etc.) stubbed with full UI but no live connectors — keep costs near zero until launch
type: feedback
---

Build the full UI and infrastructure for blocked features (Stripe billing, email, Apple Developer account), but don't connect to live paid services. Friends and family testing first, then flip switches at launch.

**Why:** Joshua wants to avoid burning runway before launch. Keep costs near zero until the last possible second, then connect everything when ready to go to market. Friends and family get the full end-to-end experience, just without real charges.

**How to apply:** When building features that require paid third-party services (Stripe, Resend, etc.), build the complete UI, API routes, and data flow. Use demo/stub mode where the service would connect. Make the switch from stub → live a config change, not a rebuild.
