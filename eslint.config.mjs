import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Warn on `as any` — use types/db-joins.ts for Supabase join shapes instead.
      // A small number of legitimate casts remain (Supabase auth admin API, edge cases).
      // If you must use `as any`, add an eslint-disable comment explaining why.
      "@typescript-eslint/no-explicit-any": "warn",
      // Project convention: `_`-prefixed variables are intentionally unused
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      // Disable — React handles literal quotes and apostrophes in JSX text just fine.
      // The rule is a legacy concern from pre-React 16 HTML entity escaping.
      "react/no-unescaped-entities": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // One-time data scripts — not app code
    "scripts/**",
    // Sprint 173 — Playwright E2E tests are frozen. See e2e.frozen/README.md.
    "e2e.frozen/**",
  ]),
]);

export default eslintConfig;
