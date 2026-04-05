"use client";

// TrendingMode — Sprint 160 (The Flow)
// Wraps TrendingSection (beers/breweries/friends tabs, city scope, style filters).

import { TrendingSection } from "@/components/social/TrendingSection";

export function TrendingMode({ defaultCity }: { defaultCity?: string }) {
  return (
    <div className="space-y-6">
      <TrendingSection defaultCity={defaultCity} />
    </div>
  );
}
