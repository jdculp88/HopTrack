/**
 * AI Promotion Suggestions Engine — Sprint 146 (The AI Sprint)
 *
 * Generates actionable business suggestions for brewery owners using
 * their KPI data, CRM segments, and tap list metrics.
 *
 * Model: claude-haiku-4-5-20251001 (cheapest option — ~$0.0004/call)
 * Owner: Dakota (Dev Lead)
 */

import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/service";
import { calculateBreweryKPIs, type BreweryKPIs } from "@/lib/kpi";
import { computeSegment, computeEngagementScore } from "@/lib/crm";

// ── Types ──────────────────────────────────────────────────────────────

export type SuggestionCategory = "loyalty" | "promotion" | "event" | "tap-list" | "pricing";

export interface AISuggestion {
  title: string;
  description: string;
  reasoning: string;
  category: SuggestionCategory;
  confidence: number; // 0-1
  estimatedImpact: string;
}

export interface AISuggestionsResult {
  suggestions: AISuggestion[];
  tokensUsed: number;
  costUsd: number;
}

// ── Constants ──────────────────────────────────────────────────────────

const MODEL = "claude-haiku-4-5-20251001";
// Haiku pricing: $0.80/M input, $4.00/M output
const INPUT_COST_PER_TOKEN = 0.80 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 4.00 / 1_000_000;

// ── Core Generation Function ───────────────────────────────────────────

export async function generateAISuggestions(breweryId: string): Promise<AISuggestionsResult> {
  const supabase = createServiceClient();

  // ── Gather data (all existing queries, zero new tables) ──
  const [
    { data: brewery },
    { data: sessions },
    { data: beerLogs },
    { data: breweryVisits },
    { data: loyaltyCards },
    { data: loyaltyRedemptions },
    { data: loyaltyProgram },
    { data: followers },
    { data: beers },
    { data: allVisitors },
  ] = await Promise.all([
    supabase.from("breweries").select("id, name, city, state, subscription_tier").eq("id", breweryId).single() as any,
    supabase.from("sessions").select("id, user_id, started_at, ended_at, is_active").eq("brewery_id", breweryId).eq("is_active", false) as any,
    supabase.from("beer_logs").select("id, beer_id, user_id, rating, quantity, logged_at, beer:beers(name, style)").eq("brewery_id", breweryId) as any,
    supabase.from("brewery_visits").select("user_id, total_visits").eq("brewery_id", breweryId) as any,
    supabase.from("loyalty_cards").select("user_id").eq("brewery_id", breweryId) as any,
    supabase.from("loyalty_redemptions").select("id, redeemed_at").eq("brewery_id", breweryId) as any,
    supabase.from("loyalty_programs").select("id, is_active, stamps_required, reward_name").eq("brewery_id", breweryId).eq("is_active", true).maybeSingle() as any,
    supabase.from("brewery_follows").select("id, created_at").eq("brewery_id", breweryId) as any,
    supabase.from("beers").select("id, name, style, is_on_tap, created_at").eq("brewery_id", breweryId) as any,
    supabase.from("sessions").select("user_id").eq("brewery_id", breweryId).eq("is_active", false) as any,
  ]);

  if (!brewery) throw new Error(`Brewery ${breweryId} not found`);

  // Calculate KPIs using existing engine
  const kpis = calculateBreweryKPIs({
    sessions: (sessions as any[]) ?? [],
    beerLogs: (beerLogs as any[]) ?? [],
    breweryVisits: (breweryVisits as any[]) ?? [],
    loyaltyCards: (loyaltyCards as any[]) ?? [],
    loyaltyRedemptions: (loyaltyRedemptions as any[]) ?? [],
    followers: (followers as any[]) ?? [],
    beers: (beers as any[]) ?? [],
    periodDays: 30,
  });

  // Build CRM segment distribution
  const visits = (breweryVisits as any[]) ?? [];
  const segmentCounts = { vip: 0, power: 0, regular: 0, new: 0 };
  for (const v of visits) {
    const segment = computeSegment(v.total_visits);
    segmentCounts[segment]++;
  }

  // Tap list summary
  const beerList = (beers as any[]) ?? [];
  const onTap = beerList.filter((b: any) => b.is_on_tap).length;
  const styles = [...new Set(beerList.map((b: any) => b.style).filter(Boolean))];

  // Top styles from beer logs
  const styleCounts: Record<string, number> = {};
  for (const log of (beerLogs as any[]) ?? []) {
    const style = log.beer?.style;
    if (style) styleCounts[style] = (styleCounts[style] || 0) + 1;
  }
  const topStyles = Object.entries(styleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([style, count]) => ({ style, count }));

  // ── Build prompt ──────────────────────────────────────────────────────

  const context = {
    brewery: { name: brewery.name, city: brewery.city, state: brewery.state, tier: brewery.subscription_tier },
    kpis: {
      avgSessionDuration: kpis.avgSessionDuration,
      beersPerVisit: kpis.beersPerVisit,
      returningVisitorPct: kpis.returningVisitorPct,
      retentionRate: kpis.retentionRate,
      loyaltyConversionRate: kpis.loyaltyConversionRate,
      loyaltyRedemptions: kpis.loyaltyRedemptions,
      peakHour: kpis.peakHour,
      avgRatingTrend: kpis.avgRatingTrend,
      followerGrowthRate: kpis.followerGrowthRate,
      tapListFreshness: kpis.tapListFreshness,
    },
    customers: {
      totalVisitors: visits.length,
      segments: segmentCounts,
    },
    tapList: {
      totalBeers: beerList.length,
      onTap,
      styles: styles.slice(0, 10),
      topOrderedStyles: topStyles,
    },
    loyalty: loyaltyProgram ? {
      active: true,
      stampsRequired: loyaltyProgram.stamps_required,
      rewardName: loyaltyProgram.reward_name,
      totalCards: (loyaltyCards as any[])?.length ?? 0,
      totalRedemptions: (loyaltyRedemptions as any[])?.length ?? 0,
    } : { active: false },
    totalSessions: ((sessions as any[]) ?? []).length,
    totalFollowers: ((followers as any[]) ?? []).length,
  };

  const systemPrompt = `You are an expert craft beer business advisor for HopTrack, a brewery check-in and loyalty platform. You analyze brewery performance data and provide specific, actionable suggestions to help brewery owners increase revenue, engagement, and customer loyalty.

Your suggestions must be:
- Specific and actionable (not generic advice)
- Based on the actual data provided
- Realistic for a craft brewery to implement
- Focused on measurable outcomes

Respond with exactly 3 suggestions as a JSON array. Each suggestion must have:
- title: short action title (max 60 chars)
- description: what to do and expected outcome (2-3 sentences)
- reasoning: why this suggestion based on the data (1-2 sentences)
- category: one of "loyalty", "promotion", "event", "tap-list", "pricing"
- confidence: 0.0-1.0 how confident you are this will help
- estimatedImpact: brief impact estimate like "10-15% more repeat visits" or "$200-400/mo revenue"

Return ONLY a JSON array, no markdown or other text.`;

  const userPrompt = `Here is the brewery data for ${context.brewery.name} (${context.brewery.city}, ${context.brewery.state}):

${JSON.stringify(context, null, 2)}

Generate 3 actionable promotion/engagement suggestions based on this data.`;

  // ── Call Claude Haiku ─────────────────────────────────────────────────

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const tokensUsed = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);
  const costUsd = (response.usage?.input_tokens ?? 0) * INPUT_COST_PER_TOKEN +
                  (response.usage?.output_tokens ?? 0) * OUTPUT_COST_PER_TOKEN;

  // Parse response — extract JSON from potential markdown wrapping
  let suggestions: AISuggestion[];
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    console.error("[ai-promotions] Failed to parse Claude response:", text.slice(0, 200));
    suggestions = [];
  }

  // Validate and cap at 3
  suggestions = suggestions
    .filter((s: any) => s.title && s.description && s.category)
    .slice(0, 3)
    .map((s: any) => ({
      title: String(s.title).slice(0, 60),
      description: String(s.description),
      reasoning: String(s.reasoning || ""),
      category: ["loyalty", "promotion", "event", "tap-list", "pricing"].includes(s.category)
        ? s.category as SuggestionCategory
        : "promotion" as SuggestionCategory,
      confidence: Math.min(1, Math.max(0, Number(s.confidence) || 0.5)),
      estimatedImpact: String(s.estimatedImpact || "Moderate impact expected"),
    }));

  // ── Store in DB ───────────────────────────────────────────────────────

  await supabase.from("ai_suggestions").insert({
    brewery_id: breweryId,
    suggestions,
    status: "pending",
    model_used: MODEL,
    tokens_used: tokensUsed,
    cost_usd: costUsd,
  } as any);

  return { suggestions, tokensUsed, costUsd };
}
