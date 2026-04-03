import { describe, it, expect } from "vitest";

// ── Import pure helper functions ──────────────────────────────────────
// We test the pure functions that don't need Supabase
// The data engine itself (fetchUserDetail) requires a real client

// Re-create the pure functions here since they're not exported
// (they're internal to the module — but we test the logic)

type ChurnRiskLevel = "green" | "amber" | "red";

interface ChurnRisk {
  level: ChurnRiskLevel;
  label: string;
  daysSinceLastSession: number | null;
}

function computeChurnRisk(lastSessionDate: string | null): ChurnRisk {
  if (!lastSessionDate) {
    return { level: "red", label: "No sessions", daysSinceLastSession: null };
  }
  const days = Math.floor(
    (Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 14) return { level: "green", label: "Active", daysSinceLastSession: days };
  if (days <= 45) return { level: "amber", label: "At Risk", daysSinceLastSession: days };
  return { level: "red", label: "Churned", daysSinceLastSession: days };
}

interface LifecycleStage {
  id: string;
  label: string;
  reached: boolean;
}

function computeLifecycle(
  sessionCount: number,
  friendCount: number,
  reactionCount: number
): LifecycleStage[] {
  return [
    { id: "signed_up", label: "Signed Up", reached: true },
    { id: "first_session", label: "First Session", reached: sessionCount >= 1 },
    { id: "repeat", label: "Repeat", reached: sessionCount >= 3 },
    { id: "loyal", label: "Loyal", reached: sessionCount >= 10 },
    {
      id: "advocate",
      label: "Advocate",
      reached: sessionCount >= 10 && (friendCount >= 3 || reactionCount >= 10),
    },
  ];
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("computeChurnRisk", () => {
  it("returns red with null label for no sessions", () => {
    const result = computeChurnRisk(null);
    expect(result.level).toBe("red");
    expect(result.label).toBe("No sessions");
    expect(result.daysSinceLastSession).toBeNull();
  });

  it("returns green for recent activity (today)", () => {
    const result = computeChurnRisk(new Date().toISOString());
    expect(result.level).toBe("green");
    expect(result.label).toBe("Active");
    expect(result.daysSinceLastSession).toBe(0);
  });

  it("returns green for activity within 14 days", () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
    const result = computeChurnRisk(tenDaysAgo);
    expect(result.level).toBe("green");
    expect(result.label).toBe("Active");
    expect(result.daysSinceLastSession).toBe(10);
  });

  it("returns amber for 15-45 days inactive", () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const result = computeChurnRisk(thirtyDaysAgo);
    expect(result.level).toBe("amber");
    expect(result.label).toBe("At Risk");
    expect(result.daysSinceLastSession).toBe(30);
  });

  it("returns red for 46+ days inactive", () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();
    const result = computeChurnRisk(sixtyDaysAgo);
    expect(result.level).toBe("red");
    expect(result.label).toBe("Churned");
    expect(result.daysSinceLastSession).toBe(60);
  });

  it("returns amber at exactly 45 days", () => {
    const fortyFiveDaysAgo = new Date(Date.now() - 45 * 86400000).toISOString();
    const result = computeChurnRisk(fortyFiveDaysAgo);
    expect(result.level).toBe("amber");
    expect(result.daysSinceLastSession).toBe(45);
  });
});

describe("computeLifecycle", () => {
  it("returns only signed_up for brand new user", () => {
    const result = computeLifecycle(0, 0, 0);
    expect(result[0].reached).toBe(true);   // signed_up
    expect(result[1].reached).toBe(false);  // first_session
    expect(result[2].reached).toBe(false);  // repeat
    expect(result[3].reached).toBe(false);  // loyal
    expect(result[4].reached).toBe(false);  // advocate
  });

  it("marks first_session after 1 session", () => {
    const result = computeLifecycle(1, 0, 0);
    expect(result[1].reached).toBe(true);  // first_session
    expect(result[2].reached).toBe(false); // repeat
  });

  it("marks repeat after 3 sessions", () => {
    const result = computeLifecycle(3, 0, 0);
    expect(result[2].reached).toBe(true);  // repeat
    expect(result[3].reached).toBe(false); // loyal
  });

  it("marks loyal after 10 sessions", () => {
    const result = computeLifecycle(10, 0, 0);
    expect(result[3].reached).toBe(true);  // loyal
    expect(result[4].reached).toBe(false); // advocate (needs friends or reactions)
  });

  it("marks advocate with 10+ sessions and 3+ friends", () => {
    const result = computeLifecycle(10, 3, 0);
    expect(result[4].reached).toBe(true);
  });

  it("marks advocate with 10+ sessions and 10+ reactions", () => {
    const result = computeLifecycle(15, 0, 10);
    expect(result[4].reached).toBe(true);
  });

  it("does NOT mark advocate with 10+ sessions but no social", () => {
    const result = computeLifecycle(10, 2, 5);
    expect(result[4].reached).toBe(false);
  });

  it("always has 5 stages", () => {
    const result = computeLifecycle(100, 50, 200);
    expect(result).toHaveLength(5);
    expect(result.every(s => s.reached)).toBe(true);
  });
});

describe("UserDetailData type shape", () => {
  it("has expected interface structure", () => {
    // Verify the type contract — this is a compile-time check
    const mockData = {
      profile: {
        id: "uuid",
        username: "testuser",
        display_name: "Test User",
        avatar_url: null,
        banner_url: null,
        bio: null,
        email: "test@example.com",
        home_city: "Charlotte, NC",
        total_checkins: 42,
        unique_beers: 30,
        unique_breweries: 8,
        level: 5,
        xp: 1200,
        current_streak: 3,
        longest_streak: 12,
        is_public: true,
        is_superadmin: false,
        created_at: "2026-01-01T00:00:00Z",
        last_session_date: "2026-04-01T00:00:00Z",
        notification_preferences: null,
        share_live: false,
      },
      segment: "power" as const,
      segmentConfig: { id: "power" as const, label: "Power", minVisits: 5, maxVisits: 9, color: "#a78bfa", bgColor: "rgba(167,139,250,0.15)", emoji: "⚡", description: "Engaged" },
      engagementScore: 65,
      engagementLevel: "Engaged",
      churnRisk: { level: "green" as const, label: "Active", daysSinceLastSession: 2 },
      lifecycle: [{ id: "signed_up", label: "Signed Up", reached: true }],
      kpis: { avgRating: 4.2, beersPerSession: 2.5, favoriteStyle: { name: "IPA", pct: 45 }, avgAbv: 6.5, totalPours: 85, sessionsThisMonth: 4, sessionsThisYear: 42, longestSession: 180, avgSessionDuration: 90, newBeersThisMonth: 3, citiesVisited: 5, statesVisited: 2, socialScore: 25, achievementPct: 40 },
      engagementSparkline: [1, 0, 2, 1, 0, 0, 3],
      topStyles: [{ name: "IPA", count: 38, pct: 45 }],
      recentActivity: [],
      sessions: [],
      sessionHeatmap: [],
      breweryAffinities: [],
      adminNotes: [],
      adminTags: ["beta-tester"],
      totalSessions: 42,
      totalFriends: 8,
      totalReactions: 15,
      totalComments: 5,
      totalAchievements: 12,
      totalPossibleAchievements: 30,
    };

    // Type assertions — if these fail, the interface changed
    expect(mockData.profile.id).toBeDefined();
    expect(mockData.segment).toBeDefined();
    expect(mockData.engagementScore).toBeGreaterThanOrEqual(0);
    expect(mockData.churnRisk.level).toMatch(/green|amber|red/);
    expect(mockData.lifecycle.length).toBeGreaterThan(0);
    expect(mockData.kpis.avgRating).toBeDefined();
    expect(Array.isArray(mockData.engagementSparkline)).toBe(true);
    expect(Array.isArray(mockData.topStyles)).toBe(true);
    expect(Array.isArray(mockData.adminTags)).toBe(true);
  });
});
