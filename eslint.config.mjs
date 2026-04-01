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
  ]),
]);

export default eslintConfig;
