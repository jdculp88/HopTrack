/**
 * Location consent logic tests — Reese, Sprint 156 (The Triple Shot)
 * Tests localStorage-based consent flow for geolocation.
 */

import { describe, it, expect, beforeEach } from "vitest";

const CONSENT_KEY = "ht-location-consent";

describe("Location consent localStorage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("consent key is not set by default", () => {
    expect(localStorage.getItem(CONSENT_KEY)).toBeNull();
  });

  it("needsConsent is true when no localStorage entry", () => {
    const needsConsent = localStorage.getItem(CONSENT_KEY) !== "granted";
    expect(needsConsent).toBe(true);
  });

  it('after grant, consent state is "granted"', () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    expect(localStorage.getItem(CONSENT_KEY)).toBe("granted");
  });

  it("after grant, needsConsent is false", () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    const needsConsent = localStorage.getItem(CONSENT_KEY) !== "granted";
    expect(needsConsent).toBe(false);
  });

  it('denied state is stored as "denied"', () => {
    localStorage.setItem(CONSENT_KEY, "denied");
    expect(localStorage.getItem(CONSENT_KEY)).toBe("denied");
    const needsConsent = localStorage.getItem(CONSENT_KEY) !== "granted";
    expect(needsConsent).toBe(true);
  });
});
