/**
 * Environment variable validation — Sprint 104 (The Audit)
 *
 * Call validateEnv() at app startup to fail loudly on missing required variables
 * instead of getting cryptic runtime errors deep in the call stack.
 *
 * Server-only variables (SUPABASE_SERVICE_ROLE_KEY, etc.) are validated
 * separately from public variables to avoid leaking to the client bundle.
 */

interface EnvVar {
  key: string;
  description: string;
  serverOnly?: boolean;
}

const REQUIRED_PUBLIC: EnvVar[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", description: "Supabase project URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", description: "Supabase anon/public key" },
];

const REQUIRED_SERVER: EnvVar[] = [
  { key: "SUPABASE_SERVICE_ROLE_KEY", description: "Supabase service role key (server-side only)", serverOnly: true },
];

const OPTIONAL_WITH_WARNINGS: EnvVar[] = [
  { key: "RESEND_API_KEY", description: "Resend API key — emails will be logged to console if missing" },
  { key: "STRIPE_SECRET_KEY", description: "Stripe secret key — billing will be in demo mode if missing" },
  { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", description: "Stripe publishable key — billing UI disabled if missing" },
  { key: "ANTHROPIC_API_KEY", description: "Anthropic API key — HopRoute AI will be disabled if missing" },
  { key: "SQUARE_WEBHOOK_SECRET", description: "Square webhook secret — POS webhooks will be disabled if missing" },
  { key: "TOAST_WEBHOOK_SECRET", description: "Toast webhook secret — POS webhooks will be disabled if missing" },
  { key: "CRON_SECRET", description: "Cron job secret — weekly digest cron will be unprotected if missing" },
];

/**
 * Validate all required environment variables.
 * Throws if any required variable is missing.
 * Warns (not throws) for optional variables.
 *
 * Call this once at startup — not in hot paths.
 */
export function validateEnv(): void {
  const missing: string[] = [];

  // Always check public vars (available client + server)
  for (const { key, description } of REQUIRED_PUBLIC) {
    if (!process.env[key]) {
      missing.push(`  ${key} — ${description}`);
    }
  }

  // Server-only vars: only check in Node.js runtime, not edge/client
  if (typeof window === "undefined") {
    for (const { key, description } of REQUIRED_SERVER) {
      if (!process.env[key]) {
        missing.push(`  ${key} — ${description}`);
      }
    }

    // Warn on optional vars (don't throw)
    for (const { key, description } of OPTIONAL_WITH_WARNINGS) {
      if (!process.env[key]) {
        process.stdout.write(
          JSON.stringify({ level: "warn", message: `Optional env var missing: ${key} — ${description}`, timestamp: new Date().toISOString() }) + "\n"
        );
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `\n\n🚨 HopTrack: Missing required environment variables:\n\n${missing.join("\n")}\n\n` +
      `Copy .env.local.example to .env.local and fill in the missing values.\n`
    );
  }
}

/** Type-safe env accessor that throws if a value is missing at runtime */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
