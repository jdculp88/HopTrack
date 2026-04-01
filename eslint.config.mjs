import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Project convention: `as any` is required for Supabase join shapes
      // where PostgREST types don't match runtime data (see CLAUDE.md)
      "@typescript-eslint/no-explicit-any": "off",
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
