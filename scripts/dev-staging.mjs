#!/usr/bin/env node
/**
 * dev-staging.mjs — start Next.js dev server pointed at staging Supabase
 *
 * Reads STAGING_* vars from .env.local and re-exports them as NEXT_PUBLIC_* /
 * SUPABASE_SERVICE_ROLE_KEY so the running app connects to hoptrack-staging.
 *
 * The raw shell-expansion pattern in the old `dev:staging` script
 * (`NEXT_PUBLIC_SUPABASE_URL=$STAGING_SUPABASE_URL next dev`) silently failed
 * because Next.js reads .env.local INTO its own process — the shell never
 * sees those variables.
 */

import { readFileSync, existsSync } from "fs";
import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");

if (!existsSync(envPath)) {
  console.error(`❌  .env.local not found at ${envPath}`);
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return [line, ""];
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const required = [
  "STAGING_SUPABASE_URL",
  "STAGING_SUPABASE_ANON_KEY",
  "STAGING_SUPABASE_SERVICE_ROLE_KEY",
  "STAGING_SUPABASE_PROJECT_REF",
];

const missing = required.filter((k) => !env[k]);
if (missing.length > 0) {
  console.error(`❌  Missing staging vars in .env.local: ${missing.join(", ")}`);
  console.error(`    Add them to .env.local under the "Staging Supabase" section.`);
  process.exit(1);
}

const overrides = {
  NEXT_PUBLIC_SUPABASE_URL: env.STAGING_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.STAGING_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: env.STAGING_SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_REF: env.STAGING_SUPABASE_PROJECT_REF,
  NEXT_PUBLIC_ENV: "staging",
};

console.log("🍺  HopTrack dev — pointing at STAGING");
console.log(`    ${overrides.NEXT_PUBLIC_SUPABASE_URL}\n`);

const proc = spawn("next", ["dev", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, ...overrides },
  shell: false,
});

proc.on("exit", (code) => process.exit(code ?? 0));
proc.on("error", (err) => {
  console.error("Failed to start Next.js:", err);
  process.exit(1);
});
