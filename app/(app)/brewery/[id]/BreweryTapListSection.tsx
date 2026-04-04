"use client";

import { RealtimeTapList } from "@/components/brewery/RealtimeTapList";

interface BreweryTapListSectionProps {
  beers: any[];
  breweryId: string;
  breweryName: string;
  menuImageUrl: string | null;
}

/**
 * Thin wrapper that delegates to RealtimeTapList for live tap list updates.
 * Server component passes initial beers down; RealtimeTapList subscribes
 * to Supabase Realtime for INSERT/UPDATE/DELETE on the beers table.
 *
 * Sprint 156 — The Triple Shot (realtime tap list)
 */
export function BreweryTapListSection({
  beers,
  breweryId,
  breweryName,
  menuImageUrl,
}: BreweryTapListSectionProps) {
  return (
    <RealtimeTapList
      initialBeers={beers}
      breweryId={breweryId}
      breweryName={breweryName}
      menuImageUrl={menuImageUrl}
    />
  );
}
