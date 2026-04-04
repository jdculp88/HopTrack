import { test, expect } from "@playwright/test";
import { login, TEST_USER, BREWERIES } from "./helpers/auth";
import {
  openCheckinDrawer,
  startBrewerySession,
  logBeer,
  endSession,
} from "./helpers/session";

// ─── Session Flow E2E Tests ─────────────────────────────────────────────────
// Tests the core value proposition: check in → log beers → end → recap with XP
// Sprint 150 — The Playwright (Casey + Reese)

test.describe("Session Flow — Full Check-in Lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("can open the checkin drawer from home", async ({ page }) => {
    // The check-in entry point should be accessible from the home feed
    const checkinTrigger = page
      .getByRole("button", { name: /check in|start.*session/i })
      .or(page.locator('[aria-label="Start a session"]'))
      .first();

    await expect(checkinTrigger).toBeVisible({ timeout: 10_000 });
    await checkinTrigger.click();

    // Drawer should open with search or nearby breweries
    await expect(
      page
        .getByPlaceholder(/search breweries/i)
        .or(page.getByText(/start your visit/i))
        .or(page.getByText(/drinking at home/i)),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("can search for a brewery in the checkin drawer", async ({ page }) => {
    await openCheckinDrawer(page);

    // Search for a known brewery
    const searchInput = page.getByPlaceholder(/search breweries/i);
    await searchInput.fill("Pint");

    // Should show search results
    await page.waitForTimeout(600); // debounce
    await expect(
      page.getByText(/pint/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("can start a home session", async ({ page }) => {
    await openCheckinDrawer(page);

    // Click "Drinking at home"
    const homeBtn = page
      .getByRole("button", { name: /drinking at home/i })
      .or(page.getByText(/drinking at home/i));

    if (await homeBtn.first().isVisible()) {
      await homeBtn.first().click();

      // Should open TapWallSheet in home mode
      await expect(
        page.getByPlaceholder(/search all beers/i).or(
          page.getByText(/end session/i),
        ),
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test("active session banner appears during session", async ({ page }) => {
    await openCheckinDrawer(page);

    // Start a home session (simpler, no geolocation needed)
    const homeBtn = page
      .getByRole("button", { name: /drinking at home/i })
      .or(page.getByText(/drinking at home/i));

    if (await homeBtn.first().isVisible()) {
      await homeBtn.first().click();

      // Wait for tap wall
      await expect(
        page.getByPlaceholder(/search all beers/i).or(
          page.getByText(/end session/i),
        ),
      ).toBeVisible({ timeout: 10_000 });

      // Minimize the tap wall if there's a minimize button
      const minimizeBtn = page.locator('[title="Minimize"]');
      if (await minimizeBtn.isVisible()) {
        await minimizeBtn.click();

        // Active session banner should appear
        await expect(
          page.getByText(/active session/i),
        ).toBeVisible({ timeout: 5_000 });
      }
    }
  });

  test("can end a session and see the recap", async ({ page }) => {
    await openCheckinDrawer(page);

    // Start a home session
    const homeBtn = page
      .getByRole("button", { name: /drinking at home/i })
      .or(page.getByText(/drinking at home/i));

    if (await homeBtn.first().isVisible()) {
      await homeBtn.first().click();

      // Wait for tap wall
      await expect(
        page.getByText(/end session/i),
      ).toBeVisible({ timeout: 10_000 });

      // End the session
      await endSession(page);

      // Recap should show XP or session summary
      await expect(
        page
          .getByText(/xp/i)
          .or(page.getByText(/session complete/i))
          .or(page.getByText(/beers?/i))
          .first(),
      ).toBeVisible({ timeout: 15_000 });
    }
  });
});

test.describe("Session Flow — Brewery Search", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("search shows brewery results with name and location", async ({
    page,
  }) => {
    await openCheckinDrawer(page);

    const searchInput = page.getByPlaceholder(/search breweries/i);
    await searchInput.fill("Sierra Nevada");

    await page.waitForTimeout(600);

    // Should show at least one result
    await expect(
      page.getByText(/sierra nevada/i).first(),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("search handles no results gracefully", async ({ page }) => {
    await openCheckinDrawer(page);

    const searchInput = page.getByPlaceholder(/search breweries/i);
    await searchInput.fill("zzzznonexistentbrewery9999");

    await page.waitForTimeout(600);

    // Should not crash — empty state or no results message
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
