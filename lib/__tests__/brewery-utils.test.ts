import { describe, it, expect } from "vitest";
import {
  formatPhone,
  normalizePhone,
  normalizeWebsiteUrl,
  normalizePostalCode,
  isValidState,
  isValidPostalCode,
  isValidUrl,
  isValidSocialUrl,
} from "../brewery-utils";

describe("formatPhone", () => {
  it("returns empty string for null", () => {
    expect(formatPhone(null)).toBe("");
  });
  it("returns empty string for empty string", () => {
    expect(formatPhone("")).toBe("");
  });
  it("formats 10-digit US number", () => {
    expect(formatPhone("4058160490")).toBe("(405) 816-0490");
  });
  it("formats 11-digit US number with leading 1", () => {
    expect(formatPhone("14058160490")).toBe("(405) 816-0490");
  });
  it("passes international numbers through unchanged", () => {
    expect(formatPhone("+442071234567")).toBe("+442071234567");
  });
  it("handles already-formatted number by re-formatting", () => {
    expect(formatPhone("(405) 816-0490")).toBe("(405) 816-0490");
  });
});

describe("normalizePhone", () => {
  it("returns null for null", () => {
    expect(normalizePhone(null)).toBeNull();
  });
  it("returns null for empty string", () => {
    expect(normalizePhone("")).toBeNull();
  });
  it("strips non-digits", () => {
    expect(normalizePhone("(405) 816-0490")).toBe("4058160490");
  });
  it("drops leading 1 from 11-digit US number", () => {
    expect(normalizePhone("14058160490")).toBe("4058160490");
  });
  it("preserves international digits", () => {
    expect(normalizePhone("+442071234567")).toBe("442071234567");
  });
});

describe("normalizeWebsiteUrl", () => {
  it("returns null for null", () => {
    expect(normalizeWebsiteUrl(null)).toBeNull();
  });
  it("returns null for empty string", () => {
    expect(normalizeWebsiteUrl("")).toBeNull();
  });
  it("upgrades http to https", () => {
    expect(normalizeWebsiteUrl("http://example.com")).toBe("https://example.com");
  });
  it("preserves existing https", () => {
    expect(normalizeWebsiteUrl("https://example.com")).toBe("https://example.com");
  });
  it("prepends https to bare domain", () => {
    expect(normalizeWebsiteUrl("example.com")).toBe("https://example.com");
  });
  it("trims whitespace", () => {
    expect(normalizeWebsiteUrl("  https://example.com  ")).toBe("https://example.com");
  });
});

describe("normalizePostalCode", () => {
  it("returns null for null", () => {
    expect(normalizePostalCode(null)).toBeNull();
  });
  it("returns 5-digit code unchanged", () => {
    expect(normalizePostalCode("73069")).toBe("73069");
  });
  it("trims 5+4 format to 5 digits", () => {
    expect(normalizePostalCode("73069-8224")).toBe("73069");
  });
  it("passes non-US codes through", () => {
    expect(normalizePostalCode("SW1A 1AA")).toBe("SW1A 1AA");
  });
});

describe("isValidState", () => {
  it("accepts 2-letter uppercase", () => {
    expect(isValidState("NC")).toBe(true);
  });
  it("accepts 2-letter lowercase", () => {
    expect(isValidState("nc")).toBe(true);
  });
  it("rejects full state name", () => {
    expect(isValidState("Texas")).toBe(false);
  });
  it("rejects 3 letters", () => {
    expect(isValidState("ABC")).toBe(false);
  });
});

describe("isValidPostalCode", () => {
  it("accepts 5-digit code", () => {
    expect(isValidPostalCode("28270")).toBe(true);
  });
  it("rejects 5+4 format", () => {
    expect(isValidPostalCode("28270-1234")).toBe(false);
  });
  it("rejects letters", () => {
    expect(isValidPostalCode("ABCDE")).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("accepts https URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });
  it("accepts http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });
  it("rejects bare domain", () => {
    expect(isValidUrl("example.com")).toBe(false);
  });
  it("rejects ftp", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
  });
});

describe("isValidSocialUrl", () => {
  it("accepts valid Instagram URL", () => {
    expect(isValidSocialUrl("https://instagram.com/brewery", "instagram")).toBe(true);
  });
  it("accepts www subdomain", () => {
    expect(isValidSocialUrl("https://www.instagram.com/brewery", "instagram")).toBe(true);
  });
  it("rejects wrong platform", () => {
    expect(isValidSocialUrl("https://facebook.com/brewery", "instagram")).toBe(false);
  });
  it("accepts x.com for twitter", () => {
    expect(isValidSocialUrl("https://x.com/brewery", "twitter")).toBe(true);
  });
  it("accepts twitter.com for twitter", () => {
    expect(isValidSocialUrl("https://twitter.com/brewery", "twitter")).toBe(true);
  });
  it("accepts fb.com for facebook", () => {
    expect(isValidSocialUrl("https://fb.com/brewery", "facebook")).toBe(true);
  });
  it("accepts untappd.com", () => {
    expect(isValidSocialUrl("https://untappd.com/v/brewery/123", "untappd")).toBe(true);
  });
  it("rejects non-URL", () => {
    expect(isValidSocialUrl("not-a-url", "instagram")).toBe(false);
  });
});
