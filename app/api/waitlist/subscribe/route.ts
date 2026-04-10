// Copyright 2026 HopTrack. All rights reserved.
// POST /api/waitlist/subscribe — Sprint 174 (The Coming Soon)
//
// Public endpoint for the hoptrack.beer landing-page waitlist form.
// The waitlist table is locked (RLS enabled, zero policies) so we use the
// service-role client. RLS bypass is safe here because the route is the only
// caller and validates payloads with Zod.

import type { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimitResponse } from "@/lib/rate-limit";
import { parseRequestBody } from "@/lib/schemas";
import { waitlistSchema } from "@/lib/schemas/waitlist";
import {
  apiSuccess,
  apiConflict,
  apiServerError,
} from "@/lib/api-response";
import { onWaitlistSignup } from "@/lib/email-triggers";

export async function POST(request: NextRequest) {
  // 5 signups per IP per minute. The unique email index is the real defense
  // against spam — this is just a courtesy throttle.
  const rl = rateLimitResponse(request, "waitlist/subscribe", {
    limit: 5,
    windowMs: 60_000,
  });
  if (rl) return rl;

  const parsed = await parseRequestBody(request, waitlistSchema);
  if (parsed.error) return parsed.error;

  const { name, email, city, state, audience_type, brewery_name } = parsed.data;

  const supabase = createServiceClient();
  const { error } = await supabase.from("waitlist").insert({
    name,
    email,
    city,
    state,
    audience_type,
    brewery_name: audience_type === "brewery" ? brewery_name : null,
  });

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return apiConflict("This email is already on the waitlist");
    }
    return apiServerError("waitlist-subscribe");
  }

  // Fire-and-forget — never block the response on email delivery.
  void onWaitlistSignup(email, name, audience_type);

  return apiSuccess({ ok: true }, 201);
}
