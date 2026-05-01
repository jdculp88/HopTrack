// Copyright 2026 HopTrack. All rights reserved.
// COMING_SOON_MODE lockdown — proves the allowlist gate in proxy.ts
// Casey + Reese
import { describe, it, expect } from "vitest";
import { isAllowedDuringComingSoon } from "../../proxy";

describe("COMING_SOON_MODE allowlist", () => {
  describe("allowed paths", () => {
    it.each([
      "/",
      "/privacy",
      "/terms",
      "/dmca",
      "/api/waitlist/subscribe",
      "/api/health",
      "/robots.txt",
      "/sitemap.xml",
      "/manifest.webmanifest",
      "/manifest.json",
    ])("permits %s", (path) => {
      expect(isAllowedDuringComingSoon(path)).toBe(true);
    });

    it.each([
      "/og/landing",
      "/og/share/anything",
      "/icon",
      "/icon.png",
      "/apple-icon",
      "/apple-icon.png",
    ])("permits prefix-matched %s", (path) => {
      expect(isAllowedDuringComingSoon(path)).toBe(true);
    });
  });

  describe("blocked pages", () => {
    it.each([
      "/home",
      "/explore",
      "/login",
      "/signup",
      "/profile/jdculp88",
      "/superadmin",
      "/superadmin/users",
      "/brewery-welcome",
      "/for-breweries",
      "/settings",
      "/beer/123",
      "/friends",
      "/achievements",
    ])("blocks %s", (path) => {
      expect(isAllowedDuringComingSoon(path)).toBe(false);
    });
  });

  describe("blocked api routes", () => {
    it.each([
      "/api/breweries",
      "/api/beers",
      "/api/sessions",
      "/api/admin/stats",
      "/api/superadmin/users",
      "/api/billing/webhook",
      "/api/auth/callback",
      "/api/v1/breweries",
    ])("blocks %s", (path) => {
      expect(isAllowedDuringComingSoon(path)).toBe(false);
    });
  });

  describe("path-traversal and trickery resistance", () => {
    it.each([
      "/api/waitlist/subscribe/../breweries",
      "/api/waitlist/subscribe/extra",
      "/api/health/leak",
      "//login",
      "/PRIVACY",
      "/Privacy",
    ])("does not leak via %s", (path) => {
      expect(isAllowedDuringComingSoon(path)).toBe(false);
    });
  });
});
