/**
 * Playwright Global Setup — Sprint 150 (The Playwright)
 *
 * Runs before all E2E specs. Verifies test data exists and cleans up
 * ephemeral artifacts from previous runs. Does NOT create seed data —
 * only validates that expected fixtures are present.
 *
 * Riley + Quinn
 */

import { createClient } from "@supabase/supabase-js";

const TEST_USER_EMAIL = "testflight@hoptrack.beer";

export default async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Skip setup if no real credentials (local dev without service key)
  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes("placeholder")
  ) {
    console.log("[E2E Setup] No service role key — skipping seed verification");
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("[E2E Setup] Verifying test data...");

  // 1. Verify test user exists
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users?.find((u) => u.email === TEST_USER_EMAIL);

  if (!testUser) {
    console.warn(
      `[E2E Setup] WARNING: Test user ${TEST_USER_EMAIL} not found. ` +
        "E2E auth tests will fail. Run seed migrations to create test data."
    );
    return;
  }

  console.log(`[E2E Setup] Test user found: ${testUser.id}`);

  // 2. Verify demo breweries exist
  const { data: breweries, error: breweryError } = await (supabase as any)
    .from("breweries")
    .select("id, name")
    .in("id", [
      "dd000001-0000-0000-0000-000000000001",
      "dd000001-0000-0000-0000-000000000002",
      "dd000001-0000-0000-0000-000000000003",
    ]);

  if (breweryError || !breweries?.length) {
    console.warn(
      "[E2E Setup] WARNING: Demo breweries not found. " +
        "Brewery admin E2E tests may fail."
    );
  } else {
    console.log(
      `[E2E Setup] ${breweries.length} demo breweries verified: ${breweries.map((b: any) => b.name).join(", ")}`
    );
  }

  // 3. Clean up ephemeral test data from previous runs
  // Only delete sessions/beer_logs created by the test user (not seed data)
  // Scope: sessions started after a recent cutoff (last 24h) to avoid nuking seed history
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { error: cleanupError } = await (supabase as any)
    .from("sessions")
    .delete()
    .eq("user_id", testUser.id)
    .gte("started_at", cutoff)
    .is("ended_at", null); // Only delete incomplete (abandoned) sessions

  if (cleanupError) {
    console.warn("[E2E Setup] Session cleanup warning:", cleanupError.message);
  } else {
    console.log("[E2E Setup] Cleaned up abandoned test sessions");
  }

  console.log("[E2E Setup] Ready.");
}
