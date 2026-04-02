"use client";

import dynamic from "next/dynamic";

const BreweryMap = dynamic(
  () => import("@/components/map/BreweryMap").then((mod) => mod.BreweryMap),
  { ssr: false, loading: () => (
    <div className="h-[300px] sm:h-[400px] rounded-2xl animate-pulse" style={{ background: "var(--surface-2)" }} />
  )}
);

interface BrandMapClientProps {
  locations: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    latitude: number | null;
    longitude: number | null;
  }>;
  userLocation?: { latitude: number; longitude: number } | null;
}

export function BrandMapClient({ locations, userLocation }: BrandMapClientProps) {
  const mappable = locations.filter(l => l.latitude != null && l.longitude != null);
  if (mappable.length === 0) return null;

  return (
    <BreweryMap
      breweries={mappable.map(loc => ({
        ...loc,
        brewery_type: null,
      })) as any}
      className="h-[300px] sm:h-[400px]"
      userLocation={userLocation}
    />
  );
}
