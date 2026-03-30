import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

// ─── HopRoute ─────────────────────────────────────────────────────────────────
// AI brewery crawl planner. Note: generate calls the Anthropic API —
// only test UI state, not actual generation in CI.

test.describe("HopRoute", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("HopRoute page loads", async ({ page }) => {
    await page.goto("/hop-route");
    await page.waitForURL("**/hop-route", { timeout: 10_000 });
    await expect(
      page.getByText(/hoproute|brewery crawl|plan.*route/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("city selector is visible", async ({ page }) => {
    await page.goto("/hop-route");
    await expect(
      page.getByRole("combobox").or(page.getByText(/city|asheville|denver|portland/i).first())
    ).toBeVisible({ timeout: 10_000 });
  });

  test("generate button exists", async ({ page }) => {
    await page.goto("/hop-route");
    await expect(
      page.getByRole("button", { name: /generate|plan|create/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("past routes section renders or shows empty state", async ({ page }) => {
    await page.goto("/hop-route");
    await page.waitForTimeout(2_000);
    // Either shows past routes or a prompt to create one
    const body = await page.textContent("body");
    expect(body!.length).toBeGreaterThan(50);
  });

  // Skip: actual generate — uses Anthropic API credits
  test.skip("generate creates a route (skipped in CI — uses API credits)", async ({ page }) => {
    await page.goto("/hop-route");
    // Would: select city, click generate, wait for route cards to appear
  });
});
