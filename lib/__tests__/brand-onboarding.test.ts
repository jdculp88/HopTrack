// Brand onboarding wizard guardrail tests — Casey + Reese, Sprint 130
// Structural tests: verify all wizard step components export correctly.
// Does NOT render components — just checks module exports exist.

import { describe, it, expect, vi } from "vitest";

// Mock Supabase so any transitive imports don't crash
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
  }),
}));

// Mock next/navigation for client components
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useParams: () => ({}),
  usePathname: () => "/",
}));

describe("Brand Onboarding Wizard — module exports", () => {
  it("BrandOnboardingWizard exports a default or named function", async () => {
    const mod = await import(
      "@/components/brewery-admin/brand/onboarding/BrandOnboardingWizard"
    );
    const exported = mod.default ?? mod.BrandOnboardingWizard;
    expect(typeof exported).toBe("function");
  });

  it("BrandOnboardingStepLocations exports a function", async () => {
    const mod = await import(
      "@/components/brewery-admin/brand/onboarding/BrandOnboardingStepLocations"
    );
    const exported = mod.default ?? mod.BrandOnboardingStepLocations;
    expect(typeof exported).toBe("function");
  });

  it("BrandOnboardingStepLoyalty exports a function", async () => {
    const mod = await import(
      "@/components/brewery-admin/brand/onboarding/BrandOnboardingStepLoyalty"
    );
    const exported = mod.default ?? mod.BrandOnboardingStepLoyalty;
    expect(typeof exported).toBe("function");
  });

  it("BrandOnboardingStepTeam exports a function", async () => {
    const mod = await import(
      "@/components/brewery-admin/brand/onboarding/BrandOnboardingStepTeam"
    );
    const exported = mod.default ?? mod.BrandOnboardingStepTeam;
    expect(typeof exported).toBe("function");
  });

  it("BrandOnboardingStepPreview exports a function", async () => {
    const mod = await import(
      "@/components/brewery-admin/brand/onboarding/BrandOnboardingStepPreview"
    );
    const exported = mod.default ?? mod.BrandOnboardingStepPreview;
    expect(typeof exported).toBe("function");
  });
});
