import { NextResponse } from "next/server";

// Legacy checkins API — deprecated in Sprint 14
// All check-in functionality has moved to sessions + beer_logs
// See: docs/checkins-deprecation-plan.md

export async function POST() {
  return NextResponse.json(
    { error: "Gone. Use /api/sessions and /api/sessions/[id]/beers instead." },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Gone. Use /api/sessions instead." },
    { status: 410 }
  );
}
