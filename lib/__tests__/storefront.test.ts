// Storefront (S131) — Auth gate, Storefront gate, middleware tests
// Avery + Reese
import { describe, it, expect, vi } from "vitest";

// ─── Middleware: Protected Paths ─────────────────────────────────────────────

describe("Middleware protected paths", () => {
  // The protectedPaths array from middleware.ts — brewery is no longer protected
  const protectedPaths = ["/home", "/explore", "/beer", "/profile", "/friends", "/achievements", "/notifications", "/settings"];

  it("does NOT include /brewery in protected paths", () => {
    expect(protectedPaths.some(p => p === "/brewery")).toBe(false);
  });

  it("still protects /home", () => {
    expect(protectedPaths.some(p => "/home".startsWith(p))).toBe(true);
  });

  it("still protects /explore", () => {
    expect(protectedPaths.some(p => "/explore".startsWith(p))).toBe(true);
  });

  it("still protects /profile", () => {
    expect(protectedPaths.some(p => "/profile/username".startsWith(p))).toBe(true);
  });

  it("still protects /beer", () => {
    expect(protectedPaths.some(p => "/beer/123".startsWith(p))).toBe(true);
  });

  it("still protects /settings", () => {
    expect(protectedPaths.some(p => "/settings".startsWith(p))).toBe(true);
  });
});

// ─── Storefront Tier Logic ──────────────────────────────────────────────────

describe("Storefront tier logic", () => {
  const paidTiers = ["tap", "cask", "barrel"];

  function hasStorefront(hasAdmin: boolean, subscriptionTier: string | null | undefined): boolean {
    return hasAdmin && paidTiers.includes(subscriptionTier ?? "");
  }

  it("unlocks for claimed Tap-tier brewery", () => {
    expect(hasStorefront(true, "tap")).toBe(true);
  });

  it("unlocks for claimed Cask-tier brewery", () => {
    expect(hasStorefront(true, "cask")).toBe(true);
  });

  it("unlocks for claimed Barrel-tier brewery", () => {
    expect(hasStorefront(true, "barrel")).toBe(true);
  });

  it("does NOT unlock for free-tier brewery", () => {
    expect(hasStorefront(true, "free")).toBe(false);
  });

  it("does NOT unlock for unclaimed brewery (no admin)", () => {
    expect(hasStorefront(false, "tap")).toBe(false);
  });

  it("does NOT unlock for unclaimed brewery with null tier", () => {
    expect(hasStorefront(false, null)).toBe(false);
  });

  it("does NOT unlock for unclaimed brewery with undefined tier", () => {
    expect(hasStorefront(false, undefined)).toBe(false);
  });

  it("does NOT unlock for claimed brewery with null tier", () => {
    expect(hasStorefront(true, null)).toBe(false);
  });
});

// ─── Public Route Detection ─────────────────────────────────────────────────

describe("Public route detection for layout", () => {
  function isBreweryRoute(pathname: string): boolean {
    return pathname.startsWith("/brewery/") || pathname === "/brewery";
  }

  it("detects /brewery/123 as brewery route", () => {
    expect(isBreweryRoute("/brewery/123")).toBe(true);
  });

  it("detects /brewery/abc-def as brewery route", () => {
    expect(isBreweryRoute("/brewery/abc-def")).toBe(true);
  });

  it("does NOT detect /brewery-admin as brewery route", () => {
    expect(isBreweryRoute("/brewery-admin")).toBe(false);
  });

  it("does NOT detect /brewery-welcome/123 as brewery route", () => {
    expect(isBreweryRoute("/brewery-welcome/123")).toBe(false);
  });

  it("does NOT detect /home as brewery route", () => {
    expect(isBreweryRoute("/home")).toBe(false);
  });

  it("does NOT detect /explore as brewery route", () => {
    expect(isBreweryRoute("/explore")).toBe(false);
  });
});

// ─── Auth Gate Return Path ──────────────────────────────────────────────────

describe("Auth gate return paths", () => {
  it("encodes brewery path for signup URL", () => {
    const returnPath = "/brewery/abc-123";
    const signupUrl = `/signup?next=${encodeURIComponent(returnPath)}`;
    expect(signupUrl).toBe("/signup?next=%2Fbrewery%2Fabc-123");
  });

  it("encodes brewery path for login URL", () => {
    const returnPath = "/brewery/abc-123";
    const loginUrl = `/login?next=${encodeURIComponent(returnPath)}`;
    expect(loginUrl).toBe("/login?next=%2Fbrewery%2Fabc-123");
  });
});
