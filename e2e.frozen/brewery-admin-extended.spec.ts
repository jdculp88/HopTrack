import { test, expect } from "@playwright/test";
import { login, BREWERIES } from "./helpers/auth";

// ─── Brewery Admin Extended E2E Tests ───────────────────────────────────────
// Deeper admin dashboard coverage — KPI cards, tap list entries, analytics
// charts, and customer management.
// Owner: Reese (QA & Test Automation)
// Reviewer: Casey (QA Engineer)

test.describe("Brewery Admin — Dashboard Deep", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}`);
    await page.waitForURL(`**/brewery-admin/${BREWERIES.mountainRidge}`, {
      timeout: 15_000,
    });
  });

  test("dashboard page loads with overview heading", async ({ page }) => {
    // Dashboard should render with an overview or "Today" heading
    await expect(
      page
        .getByText(/overview|dashboard|today/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("KPI stat cards render on dashboard", async ({ page }) => {
    // Dashboard should show stat/KPI cards (visits, beers poured, followers, etc.)
    await expect(
      page
        .getByText(/visits|sessions|poured|followers|check-ins/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    // Should have multiple stat cards — look for numbers
    await expect(
      page.locator('[class*="stat"], [class*="kpi"], [class*="card"]').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("recent activity feed renders on dashboard", async ({ page }) => {
    // Scroll down to find activity feed
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight / 2),
    );
    await page.waitForTimeout(500);

    // Activity feed or recent activity should be visible
    await expect(
      page
        .getByText(/recent activity|activity|latest/i)
        .or(page.getByText(/no recent activity/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Brewery Admin — Tap List", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("tap list page renders beer entries or empty state", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/tap-list`);

    // Should show either beer rows or an empty state
    await expect(
      page
        .getByText(/tap list/i)
        .or(page.getByText(/no beers/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });

    // If beers exist, cards should show style or name info
    const hasBeerCards = await page
      .getByText(/ipa|pale ale|stout|lager|wheat|amber|pilsner|on tap/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (hasBeerCards) {
      // Beer cards render with style info
      await expect(
        page
          .getByText(/ipa|pale ale|stout|lager|wheat|amber|pilsner|on tap/i)
          .first(),
      ).toBeVisible();
    } else {
      // Empty state should show an add/get started CTA
      await expect(
        page
          .getByText(/add.*beer|get started|no beers/i)
          .first(),
      ).toBeVisible({ timeout: 10_000 });
    }
  });
});

test.describe("Brewery Admin — Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("analytics page renders with time range selector", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/analytics`);

    // Time range pills should be present
    await expect(
      page.getByText(/7d|30d|90d|all time/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("analytics page shows chart or visualization area", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/analytics`);

    // Wait for page to load
    await expect(
      page.getByText(/7d|30d|90d/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Should render chart elements (Recharts SVGs, canvas, or stat sections)
    await expect(
      page
        .locator("svg, canvas, [class*='chart'], [class*='recharts']")
        .or(
          page.getByText(
            /sessions|visits|retention|customer|loyalty|duration/i,
          ),
        )
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Brewery Admin — Customers", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("customers page renders with segment filters or table", async ({
    page,
  }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/customers`);

    // Should show customer content (segment pills, table, or empty state)
    await expect(
      page
        .getByText(/customer|visitor|vip|power|regular|new/i)
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("customers page shows count or list entries", async ({ page }) => {
    await page.goto(`/brewery-admin/${BREWERIES.mountainRidge}/customers`);

    // Wait for page content
    await expect(
      page.getByText(/customer|visitor/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Should show either a customer table/list or an informative empty state
    await expect(
      page
        .locator("table, [class*='list'], [class*='customer'], [class*='row']")
        .or(page.getByText(/no customers|no visitors|no data/i))
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
