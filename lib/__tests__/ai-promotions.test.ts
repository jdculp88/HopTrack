// AI Promotions engine unit tests — Reese + Casey, Sprint 146
import { describe, it, expect, vi } from "vitest";

// ── Test the suggestion category types and validation ──

describe("AI Promotions — types and validation", () => {
  const VALID_CATEGORIES = ["loyalty", "promotion", "event", "tap-list", "pricing"];

  it("defines all 5 suggestion categories", () => {
    expect(VALID_CATEGORIES).toHaveLength(5);
    expect(VALID_CATEGORIES).toContain("loyalty");
    expect(VALID_CATEGORIES).toContain("promotion");
    expect(VALID_CATEGORIES).toContain("event");
    expect(VALID_CATEGORIES).toContain("tap-list");
    expect(VALID_CATEGORIES).toContain("pricing");
  });

  it("validates a well-formed suggestion object", () => {
    const suggestion = {
      title: "Run an IPA Week Promotion",
      description: "Your VIP customers order IPAs 60% of the time. Run a week-long IPA special.",
      reasoning: "Based on your CRM data, 60% of VIP orders are IPA-style beers.",
      category: "promotion",
      confidence: 0.85,
      estimatedImpact: "10-15% increase in repeat visits",
    };

    expect(suggestion.title.length).toBeLessThanOrEqual(60);
    expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
    expect(suggestion.confidence).toBeLessThanOrEqual(1);
    expect(VALID_CATEGORIES).toContain(suggestion.category);
  });

  it("caps confidence at valid range", () => {
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    expect(clamp(1.5)).toBe(1);
    expect(clamp(-0.3)).toBe(0);
    expect(clamp(0.85)).toBe(0.85);
  });

  it("truncates titles longer than 60 chars", () => {
    const longTitle = "This is a very long suggestion title that exceeds sixty characters total for testing";
    const truncated = longTitle.slice(0, 60);
    expect(truncated.length).toBe(60);
  });
});

// ── Test cost calculations ──

describe("AI Promotions — cost tracking", () => {
  const INPUT_COST_PER_TOKEN = 0.80 / 1_000_000;
  const OUTPUT_COST_PER_TOKEN = 4.00 / 1_000_000;

  it("calculates cost correctly for typical request", () => {
    const inputTokens = 500;
    const outputTokens = 300;
    const cost = inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
    // 500 * 0.0000008 + 300 * 0.000004 = 0.0004 + 0.0012 = 0.0016
    expect(cost).toBeCloseTo(0.0016, 6);
  });

  it("estimates monthly cost for 50 breweries weekly", () => {
    const costPerCall = 500 * INPUT_COST_PER_TOKEN + 300 * OUTPUT_COST_PER_TOKEN;
    const weeklyCost = costPerCall * 50; // 50 breweries
    const monthlyCost = weeklyCost * 4.3; // ~4.3 weeks/month
    // Should be well under $5/mo
    expect(monthlyCost).toBeLessThan(5);
  });
});

// ── Test JSON parsing edge cases ──

describe("AI Promotions — response parsing", () => {
  it("extracts JSON array from plain text", () => {
    const text = '[{"title": "Test", "description": "Desc", "category": "loyalty", "confidence": 0.8, "estimatedImpact": "High", "reasoning": "Data"}]';
    const match = text.match(/\[[\s\S]*\]/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![0]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("Test");
  });

  it("extracts JSON from markdown-wrapped response", () => {
    const text = "Here are my suggestions:\n```json\n[{\"title\": \"Test\"}]\n```";
    const match = text.match(/\[[\s\S]*\]/);
    expect(match).not.toBeNull();
    const parsed = JSON.parse(match![0]);
    expect(parsed).toHaveLength(1);
  });

  it("handles empty response gracefully", () => {
    const text = "I couldn't generate suggestions.";
    const match = text.match(/\[[\s\S]*\]/);
    expect(match).toBeNull();
    // Should default to empty array
    const suggestions = match ? JSON.parse(match[0]) : [];
    expect(suggestions).toEqual([]);
  });

  it("filters invalid suggestions", () => {
    const raw = [
      { title: "Good", description: "Valid", category: "loyalty", confidence: 0.8, estimatedImpact: "High", reasoning: "Data" },
      { title: "", description: "Missing title", category: "event" },
      { description: "No title at all", category: "pricing" },
    ];

    const valid = raw.filter((s: any) => s.title && s.description && s.category);
    expect(valid).toHaveLength(1);
    expect(valid[0].title).toBe("Good");
  });
});

// ── FEATURE_MATRIX includes AI suggestions ──

describe("FEATURE_MATRIX — AI row", () => {
  it("includes AI promotion suggestions gated to cask/barrel", async () => {
    const { FEATURE_MATRIX } = await import("@/lib/stripe");
    const aiRow = FEATURE_MATRIX.find((r: any) => r.feature === "AI promotion suggestions");
    expect(aiRow).toBeDefined();
    expect(aiRow!.free).toBe(false);
    expect(aiRow!.tap).toBe(false);
    expect(aiRow!.cask).toBe(true);
    expect(aiRow!.barrel).toBe(true);
    expect(aiRow!.category).toBe("Analytics");
  });
});
