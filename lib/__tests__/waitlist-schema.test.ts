/**
 * Waitlist schema tests — Sprint 174 (The Coming Soon)
 *
 * Covers brewery_name conditional requirement, email normalization,
 * state enum, max lengths, and honeypot rejection.
 */

import { describe, it, expect } from "vitest";
import { waitlistSchema } from "@/lib/schemas/waitlist";

const validUser = {
  name: "Joshua Culp",
  email: "josh@example.com",
  city: "Asheville",
  state: "NC",
  audience_type: "user" as const,
};

const validBrewery = {
  name: "Drew Owner",
  email: "drew@hopdrop.beer",
  city: "Asheville",
  state: "NC",
  audience_type: "brewery" as const,
  brewery_name: "Hop Drop Brewing",
};

describe("waitlistSchema", () => {
  describe("happy paths", () => {
    it("accepts a valid user signup", () => {
      const result = waitlistSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("accepts a valid brewery signup with brewery_name", () => {
      const result = waitlistSchema.safeParse(validBrewery);
      expect(result.success).toBe(true);
    });

    it("lowercases the email", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        email: "MIXED.Case@Example.COM",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("mixed.case@example.com");
      }
    });

    it("trims whitespace from name and city", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        name: "  Joshua  ",
        city: "  Asheville  ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Joshua");
        expect(result.data.city).toBe("Asheville");
      }
    });

    it("accepts every US state plus DC", () => {
      const states = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC",
        "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY",
        "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT",
        "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
        "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
        "VT", "VA", "WA", "WV", "WI", "WY",
      ];
      for (const state of states) {
        const result = waitlistSchema.safeParse({ ...validUser, state });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("brewery_name conditional requirement", () => {
    it("rejects brewery audience without brewery_name", () => {
      const result = waitlistSchema.safeParse({
        ...validBrewery,
        brewery_name: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues[0];
        expect(issue.path).toEqual(["brewery_name"]);
        expect(issue.message).toBe("Brewery name is required");
      }
    });

    it("rejects brewery audience with empty brewery_name", () => {
      const result = waitlistSchema.safeParse({
        ...validBrewery,
        brewery_name: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects brewery audience with whitespace-only brewery_name", () => {
      const result = waitlistSchema.safeParse({
        ...validBrewery,
        brewery_name: "   ",
      });
      expect(result.success).toBe(false);
    });

    it("accepts user audience without brewery_name", () => {
      const result = waitlistSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("accepts user audience with brewery_name set (ignored downstream)", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        brewery_name: "Some Brewery",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("rejects an invalid email", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty name", () => {
      const result = waitlistSchema.safeParse({ ...validUser, name: "" });
      expect(result.success).toBe(false);
    });

    it("rejects empty city", () => {
      const result = waitlistSchema.safeParse({ ...validUser, city: "" });
      expect(result.success).toBe(false);
    });

    it("rejects an unknown state code", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        state: "ZZ",
      });
      expect(result.success).toBe(false);
    });

    it("rejects a state name instead of abbreviation", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        state: "North Carolina",
      });
      expect(result.success).toBe(false);
    });

    it("rejects an unknown audience_type", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        audience_type: "investor",
      });
      expect(result.success).toBe(false);
    });

    it("rejects name longer than 100 chars", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        name: "x".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("rejects city longer than 100 chars", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        city: "x".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("rejects email longer than 254 chars", () => {
      const longLocal = "x".repeat(245);
      const result = waitlistSchema.safeParse({
        ...validUser,
        email: `${longLocal}@example.com`,
      });
      expect(result.success).toBe(false);
    });

    it("rejects brewery_name longer than 100 chars", () => {
      const result = waitlistSchema.safeParse({
        ...validBrewery,
        brewery_name: "x".repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("honeypot", () => {
    it("rejects when website honeypot is filled", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        website: "https://spam.example.com",
      });
      expect(result.success).toBe(false);
    });

    it("accepts when website is empty string", () => {
      const result = waitlistSchema.safeParse({
        ...validUser,
        website: "",
      });
      expect(result.success).toBe(true);
    });

    it("accepts when website is omitted", () => {
      const result = waitlistSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });
  });
});
