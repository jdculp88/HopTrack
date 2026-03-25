/**
 * HopTrack — One-time Supabase "Getting Started" setup script
 *
 * Completes the remaining Supabase dashboard checklist items:
 *   ✅ Sign up your first user
 *   ✅ Upload a file (to beer-photos bucket)
 *
 * Prerequisites:
 *   1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local
 *      (Dashboard → Project Settings → API → service_role key)
 *   2. Run: npm run setup
 *
 * Safe to run multiple times — all operations are idempotent.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load env from .env.local ───────────────────────────────────────────────
const envPath = resolve(__dirname, "../.env.local");
if (!existsSync(envPath)) {
  console.error("❌  .env.local not found. Create it first.");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(line => line && !line.startsWith("#"))
    .map(line => {
      const [k, ...v] = line.split("=");
      return [k.trim(), v.join("=").trim()];
    })
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required in .env.local");
  process.exit(1);
}

// Admin client — requires the real service_role JWT (starts with "eyJ")
// Ignores placeholder values like "your_service_role_key_here"
const isRealKey = SERVICE_ROLE_KEY && SERVICE_ROLE_KEY.trim().startsWith("eyJ");
const adminClient = isRealKey
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY.trim(), { auth: { persistSession: false } })
  : null;

if (!isRealKey && SERVICE_ROLE_KEY) {
  console.log("ℹ️   SUPABASE_SERVICE_ROLE_KEY looks like a placeholder. Some tasks will be skipped.");
  console.log("    Get the real key: Supabase dashboard → Project Settings → API → service_role secret\n");
}

// Anon client (for auth signup)
const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });

console.log("\n🍺  HopTrack Supabase Setup\n" + "─".repeat(40));

// ─── Task 1: Sign up first user ─────────────────────────────────────────────
async function signUpFirstUser() {
  console.log("\n[1/3] Signing up first user via Auth API...");

  // Use admin API (service role) if available — no email domain restrictions
  // Fall back to anon signUp which may have email validation
  if (adminClient) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: "setup@hoptrack.app",
      password: "HopTrack2026!",
      user_metadata: { display_name: "HopTrack Setup" },
      email_confirm: true,
    });
    if (error) {
      if (error.message.includes("already") || error.message.includes("exists")) {
        console.log("   ✅  Setup user already exists — task complete.");
      } else {
        console.log(`   ⚠️  Auth createUser: ${error.message}`);
      }
    } else {
      console.log(`   ✅  User signed up: ${data?.user?.email}`);
    }
    return;
  }

  // Anon fallback — requires a real email domain
  const { data, error } = await anonClient.auth.signUp({
    email: "setup@hoptrack.app",
    password: "HopTrack2026!",
    options: {
      data: { display_name: "HopTrack Setup" },
    },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already been registered")) {
      console.log("   ✅  User setup@hoptrack.app already exists — task complete.");
    } else if (error.message.includes("invalid") || error.message.includes("Invalid")) {
      console.log("   ⚠️  Email rejected by Supabase — add SUPABASE_SERVICE_ROLE_KEY to .env.local and re-run.");
      console.log("   ℹ️  Or: Supabase dashboard → Authentication → Users → Add user");
    } else {
      console.log(`   ⚠️  Auth signup: ${error.message}`);
    }
  } else {
    console.log(`   ✅  User signed up: ${data?.user?.email ?? "setup@hoptrack.app"}`);
    console.log("   ℹ️  Check your Supabase Auth dashboard to see the new user.");
  }
}

// ─── Task 2: Create storage buckets ─────────────────────────────────────────
async function createStorageBuckets() {
  console.log("\n[2/3] Creating storage buckets...");

  if (!adminClient) {
    console.log("   ⚠️  SUPABASE_SERVICE_ROLE_KEY not set — skipping bucket creation.");
    console.log("   ℹ️  Add it to .env.local and re-run, or create buckets in the Supabase dashboard.");
    console.log("        Dashboard → Storage → New bucket");
    console.log("        • beer-photos  (public, 5MB limit)");
    console.log("        • brewery-covers  (public, 10MB limit)");
    return false;
  }

  const buckets = [
    { id: "beer-photos", name: "beer-photos", public: true, fileSizeLimit: 5 * 1024 * 1024 },
    { id: "brewery-covers", name: "brewery-covers", public: true, fileSizeLimit: 10 * 1024 * 1024 },
  ];

  for (const bucket of buckets) {
    const { data, error } = await adminClient.storage.createBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });

    if (error) {
      if (error.message.includes("already exists") || error.message.includes("Duplicate")) {
        console.log(`   ✅  Bucket "${bucket.id}" already exists.`);
      } else {
        console.log(`   ⚠️  Bucket "${bucket.id}": ${error.message}`);
      }
    } else {
      console.log(`   ✅  Bucket "${bucket.id}" created.`);
    }
  }

  return true;
}

// ─── Task 3: Upload a file ───────────────────────────────────────────────────
async function uploadPlaceholderFile() {
  console.log("\n[3/3] Uploading placeholder file to beer-photos...");

  if (!adminClient) {
    console.log("   ⚠️  SUPABASE_SERVICE_ROLE_KEY not set — skipping upload.");
    return;
  }

  // Create a minimal 1×1 transparent PNG as placeholder
  const transparentPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
  );

  const { data, error } = await adminClient.storage
    .from("beer-photos")
    .upload("hoptrack/.hoptrack-setup", transparentPng, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.log(`   ⚠️  Upload: ${error.message}`);
    console.log("   ℹ️  The \"Upload a file\" task can also be completed from the Supabase Storage dashboard.");
  } else {
    console.log(`   ✅  File uploaded: beer-photos/hoptrack/.hoptrack-setup`);
    console.log("   ✅  \"Upload a file\" checklist task complete!");
  }
}

// ─── Run ─────────────────────────────────────────────────────────────────────
async function run() {
  await signUpFirstUser();
  await createStorageBuckets();
  await uploadPlaceholderFile();

  console.log("\n" + "─".repeat(40));
  console.log("✅  Setup complete!\n");
  console.log("Remaining manual dashboard tasks:");
  console.log("  9. Monitor usage  →  Supabase dashboard → Project → Usage tab");
  console.log("  10. Connect GitHub →  Supabase dashboard → Project Settings → Integrations\n");

  if (!SERVICE_ROLE_KEY) {
    console.log("💡  To complete storage tasks, add your service_role key to .env.local:");
    console.log("     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here");
    console.log("     (Dashboard → Project Settings → API → service_role secret)\n");
  }

  console.log("Next steps for the team:");
  console.log("  npm run db:migrate          → push migrations to production");
  console.log("  npm run db:migrate:staging  → push to staging (requires STAGING_SUPABASE_PROJECT_REF)");
  console.log("  npm run functions:deploy    → deploy all edge functions");
  console.log("  npm run dev:staging         → run app against staging Supabase\n");
}

run().catch(console.error);
