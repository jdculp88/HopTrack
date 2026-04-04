/**
 * Review report API validation tests — Reese, Sprint 156 (The Triple Shot)
 * Tests the validation logic for user-submitted review reports.
 */

import { describe, it, expect } from "vitest";
import { MODERATION_REASONS } from "@/lib/moderation";

interface ReviewReport {
  review_id: string;
  review_type: "beer_review" | "brewery_review";
  reason: string;
  details?: string;
}

function validateReviewReport(
  data: Partial<ReviewReport>
): { valid: boolean; error: string | null } {
  if (!data.review_id) {
    return { valid: false, error: "review_id is required" };
  }
  if (!data.review_type) {
    return { valid: false, error: "review_type is required" };
  }
  if (!["beer_review", "brewery_review"].includes(data.review_type)) {
    return { valid: false, error: "Invalid review_type" };
  }
  if (!data.reason) {
    return { valid: false, error: "reason is required" };
  }
  return { valid: true, error: null };
}

describe("Review report validation", () => {
  it("rejects missing review_id", () => {
    const result = validateReviewReport({
      review_type: "beer_review",
      reason: "Spam or advertising",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("review_id");
  });

  it("rejects missing review_type", () => {
    const result = validateReviewReport({
      review_id: "abc-123",
      reason: "Spam or advertising",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("review_type");
  });

  it("rejects invalid review_type", () => {
    const result = validateReviewReport({
      review_id: "abc-123",
      review_type: "comment" as "beer_review",
      reason: "Spam",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid review_type");
  });

  it("rejects missing reason", () => {
    const result = validateReviewReport({
      review_id: "abc-123",
      review_type: "beer_review",
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain("reason");
  });

  it("accepts valid beer_review report", () => {
    const result = validateReviewReport({
      review_id: "abc-123",
      review_type: "beer_review",
      reason: MODERATION_REASONS[0],
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it("accepts valid brewery_review report", () => {
    const result = validateReviewReport({
      review_id: "xyz-789",
      review_type: "brewery_review",
      reason: "Offensive or inappropriate content",
      details: "Contains profanity",
    });
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });
});
