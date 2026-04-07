"use client";

// ExploreShell — Sprint 160 (The Flow)
// Mode-switching shell around ExploreClient. Four modes: Near Me, Trending,
// Following, Styles. URL-synced via ?mode=near|trending|following|styles.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PillTabs, type PillTab } from "@/components/ui/PillTabs";
import { useTabUrlSync } from "@/hooks/useTabUrlSync";
import { transition } from "@/lib/animation";
import { ExploreClient } from "./ExploreClient";
import { TrendingMode } from "./modes/TrendingMode";
import { FollowingMode } from "./modes/FollowingMode";
import { StylesMode } from "./modes/StylesMode";
import type { BreweryWithStats } from "@/types/database";

type ExploreMode = "near" | "trending" | "following" | "styles";

const MODES: readonly ExploreMode[] = ["near", "trending", "following", "styles"] as const;

export interface ExploreShellProps {
  breweries: BreweryWithStats[];
  hasBeerOfTheWeek?: string[];
  hasUpcomingEvents?: string[];
  followerCounts?: Record<string, number>;
  recentBreweryIds?: string[];
  totalBreweryCount?: number;
  defaultCity?: string;
}

export function ExploreShell(props: ExploreShellProps) {
  const [mode, setMode] = useTabUrlSync<ExploreMode>({
    param: "mode",
    defaultTab: "near",
    tabs: MODES,
  });
  const reducedMotion = useReducedMotion();

  const modePills: PillTab<ExploreMode>[] = [
    { key: "near", label: "📍 Near Me" },
    { key: "trending", label: "🔥 Trending" },
    { key: "following", label: "👥 Following" },
    { key: "styles", label: "🎨 Styles" },
  ];

  return (
    <div>
      {/* Sprint 171: Mode navigation — segmented, full-width, inside content area */}
      <div className="px-4 sm:px-6 mb-6">
        <PillTabs
          tabs={modePills}
          value={mode}
          onChange={setMode}
          ariaLabel="Explore modes"
          variant="segmented"
          fullWidth
        />
      </div>

      {/* Mode content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={reducedMotion ? { duration: 0 } : transition.fast}
        >
          {mode === "near" && (
            <ExploreClient
              breweries={props.breweries}
              hasBeerOfTheWeek={props.hasBeerOfTheWeek}
              hasUpcomingEvents={props.hasUpcomingEvents}
              followerCounts={props.followerCounts}
              recentBreweryIds={props.recentBreweryIds}
              totalBreweryCount={props.totalBreweryCount}
            />
          )}
          {mode === "trending" && (
            <div className="px-4 sm:px-6">
              <TrendingMode defaultCity={props.defaultCity} />
            </div>
          )}
          {mode === "following" && (
            <div className="px-4 sm:px-6">
              <FollowingMode />
            </div>
          )}
          {mode === "styles" && (
            <div className="px-4 sm:px-6">
              <StylesMode />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
