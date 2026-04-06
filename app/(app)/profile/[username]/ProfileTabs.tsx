"use client";

// ProfileTabs — Sprint 160 (The Flow)
// Client container for profile 4-tab restructure. Syncs active tab to URL
// (?tab=X), preserves scroll position per tab, crossfades between tab bodies.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PillTabs, type PillTab } from "@/components/ui/PillTabs";
import { useTabUrlSync } from "@/hooks/useTabUrlSync";
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { transition } from "@/lib/animation";
import { ActivityTab, type ActivityTabProps } from "./tabs/ActivityTab";
import { StatsTab, type StatsTabProps } from "./tabs/StatsTab";
import { ListsTab, type ListsTabProps } from "./tabs/ListsTab";
import { BreweriesTab, type BreweriesTabProps } from "./tabs/BreweriesTab";

type ProfileTab = "activity" | "stats" | "lists" | "breweries";

const TABS: readonly ProfileTab[] = ["activity", "stats", "lists", "breweries"] as const;

export interface ProfileTabsProps {
  activityData: ActivityTabProps;
  statsData: StatsTabProps;
  listsData: ListsTabProps;
  breweriesData: BreweriesTabProps;
}

export function ProfileTabs({ activityData, statsData, listsData, breweriesData }: ProfileTabsProps) {
  const [value, setValue] = useTabUrlSync<ProfileTab>({
    param: "tab",
    defaultTab: "activity",
    tabs: TABS,
  });
  useScrollMemory(value);
  const reducedMotion = useReducedMotion();

  const beerListCount = listsData.beerLists.length + (listsData.isOwnProfile ? listsData.wishlist.length : 0);
  const breweriesCount = breweriesData.topBreweries.length;

  const pillTabs: PillTab<ProfileTab>[] = [
    { key: "activity", label: "Activity" },
    { key: "stats", label: "Stats" },
    { key: "lists", label: "Lists", count: beerListCount > 0 ? beerListCount : undefined },
    { key: "breweries", label: "Breweries", count: breweriesCount > 0 ? breweriesCount : undefined },
  ];

  return (
    <div>
      <PillTabs
        tabs={pillTabs}
        value={value}
        onChange={setValue}
        ariaLabel="Profile sections"
        variant="underline"
        fullWidth
        sticky={{ top: 0 }}
        className="shadow-[var(--shadow-card)]"
      />

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={reducedMotion ? { duration: 0 } : transition.fast}
          >
            {value === "activity" && <ActivityTab {...activityData} />}
            {value === "stats" && <StatsTab {...statsData} />}
            {value === "lists" && <ListsTab {...listsData} />}
            {value === "breweries" && <BreweriesTab {...breweriesData} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
