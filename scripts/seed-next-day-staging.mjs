#!/usr/bin/env node
/**
 * seed-next-day-staging.mjs — run seed-next-day against STAGING Supabase
 *
 * The original scripts/seed-next-day.mjs reads NEXT_PUBLIC_SUPABASE_URL from
 * .env.local — which points at PROD. Running it as-is would try to advance
 * Pint & Pixel at prod, which (a) doesn't have P&P anymore after the S179
 * cleanup and (b) is the wrong environment for demo activity anyway.
 *
 * This wrapper re-exports STAGING_* vars into the NEXT_PUBLIC_* / SERVICE_ROLE_KEY
 * names that the underlying script expects, then invokes it.
 *
 * Usage: node scripts/seed-next-day-staging.mjs
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

const required = ["STAGING_SUPABASE_URL", "STAGING_SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((k) => !env[k]);
if (missing.length > 0) {
  console.error(`❌  Missing staging vars in .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const overrides = {
  NEXT_PUBLIC_SUPABASE_URL: env.STAGING_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: env.STAGING_SUPABASE_SERVICE_ROLE_KEY,
};

console.log("🍺  seed-next-day — pointing at STAGING");
console.log(`    ${overrides.NEXT_PUBLIC_SUPABASE_URL}\n`);

const proc = spawn("node", [resolve(__dirname, "seed-next-day.mjs")], {
  stdio: "inherit",
  env: { ...process.env, ...overrides },
  shell: false,
});

proc.on("exit", (code) => process.exit(code ?? 0));
proc.on("error", (err) => {
  console.error("Failed to run seed-next-day.mjs:", err);
  process.exit(1);
});
