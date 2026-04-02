import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

/**
 * RLS Safety Tests
 *
 * Catches self-referencing RLS policies in migrations before they ship.
 * A self-referencing SELECT policy (querying table X inside a SELECT
 * policy on table X) causes PostgreSQL to silently return no rows —
 * the exact bug that broke brewery_accounts (Sprint 115) and
 * brand_accounts (Sprint 122 → fixed Sprint 123).
 *
 * The fix is always the same: use a SECURITY DEFINER helper function
 * that bypasses RLS for the membership check.
 */

const MIGRATIONS_DIR = join(__dirname, "../../supabase/migrations");

function getMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

describe("RLS Safety — no self-referencing SELECT policies", () => {
  it("should not have SELECT policies that query their own table", () => {
    const violations: string[] = [];

    for (const file of getMigrationFiles()) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");

      // Find all CREATE POLICY ... FOR SELECT ... USING blocks
      // and check if they reference the same table in the USING clause
      const policyRegex =
        /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(\w+)\s+FOR\s+SELECT[\s\S]*?USING\s*\(([\s\S]*?)\);/gi;

      let match;
      while ((match = policyRegex.exec(sql)) !== null) {
        const policyName = match[1];
        const tableName = match[2];
        const usingClause = match[3];

        // Check if the USING clause references the same table via FROM/JOIN
        // but exclude SECURITY DEFINER function calls (which are the fix)
        const selfRefRegex = new RegExp(
          `\\bFROM\\s+${tableName}\\b|\\bJOIN\\s+${tableName}\\b`,
          "i"
        );
        if (selfRefRegex.test(usingClause)) {
          // Check if this was already fixed by migration 081 (DROP + recreate)
          const dropRegex = new RegExp(
            `DROP\\s+POLICY\\s+IF\\s+EXISTS\\s+"${policyName}"\\s+ON\\s+${tableName}`,
            "i"
          );
          // Look for a later migration that drops this policy
          const fileIndex = getMigrationFiles().indexOf(file);
          const laterFiles = getMigrationFiles().slice(fileIndex + 1);
          const isFixed = laterFiles.some((laterFile) => {
            const laterSql = readFileSync(
              join(MIGRATIONS_DIR, laterFile),
              "utf-8"
            );
            return dropRegex.test(laterSql);
          });

          if (!isFixed) {
            violations.push(
              `${file}: Policy "${policyName}" on "${tableName}" has self-referencing SELECT (queries ${tableName} inside its own USING clause). Use a SECURITY DEFINER function instead.`
            );
          }
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Self-referencing RLS policies detected:\n\n${violations.join("\n\n")}\n\n` +
          `Fix: Create a SECURITY DEFINER function for the membership check, ` +
          `then reference it in the policy. See migration 081 for the pattern.`
      );
    }
  });

  it("should have is_brand_manager_or_owner helper function in migration 081", () => {
    const migration081 = getMigrationFiles().find((f) => f.startsWith("081"));
    expect(migration081).toBeDefined();

    const sql = readFileSync(join(MIGRATIONS_DIR, migration081!), "utf-8");
    expect(sql).toContain("SECURITY DEFINER");
    expect(sql).toContain("is_brand_manager_or_owner");
  });
});
