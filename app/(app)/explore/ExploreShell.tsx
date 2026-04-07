"use client";

// ExploreShell — Sprint 171 (The Overhaul)
// Mode-switching shell. Mode selection moved into ExploreClient's filter panel
// instead of floating pills. Near Me is default — other modes render their own content.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTabUrlSync } from "@/hooks/useTabUrlSync";
import { transition } from "@/lib/animation";
import { ExploreClient } from "./ExploreClient";
import { TrendingMode } from "./modes/TrendingMode";
import { FollowingMode } from "./modes/FollowingMode";
import { StylesMode } from "./modes/StylesMode";
import type { BreweryWithStats } from "@/types/database";

export type ExploreMode = "near" | "trending" | "following" | "styles";

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

  return (
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
            currentMode={mode}
            onModeChange={setMode}
          />
        )}
        {mode === "trending" && (
          <ExploreClient
            breweries={props.breweries}
            totalBreweryCount={props.totalBreweryCount}
            currentMode={mode}
            onModeChange={setMode}
            modeContent={
              <div className="px-4 sm:px-6">
                <TrendingMode defaultCity={props.defaultCity} />
              </div>
            }
          />
        )}
        {mode === "following" && (
          <ExploreClient
            breweries={props.breweries}
            totalBreweryCount={props.totalBreweryCount}
            currentMode={mode}
            onModeChange={setMode}
            modeContent={
              <div className="px-4 sm:px-6">
                <FollowingMode />
              </div>
            }
          />
        )}
        {mode === "styles" && (
          <ExploreClient
            breweries={props.breweries}
            totalBreweryCount={props.totalBreweryCount}
            currentMode={mode}
            onModeChange={setMode}
            modeContent={
              <div className="px-4 sm:px-6">
                <StylesMode />
              </div>
            }
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
