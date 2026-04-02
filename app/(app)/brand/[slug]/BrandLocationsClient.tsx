"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeolocation } from "@/hooks/useGeolocation";
import { haversineDistance, formatDistance } from "@/lib/geo";
import { BrandMapClient } from "./BrandMapClient";

interface BrandLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  logo_url: string | null;
  description: string | null;
}

interface BrandLocationsClientProps {
  locations: BrandLocation[];
  brandId: string;
}

export function BrandLocationsClient({ locations, brandId }: BrandLocationsClientProps) {
  const geo = useGeolocation();

  useEffect(() => {
    geo.requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute distances and sort
  const { sortedLocations, nearestLocation } = useMemo(() => {
    if (!geo.latitude || !geo.longitude) {
      return { sortedLocations: locations, nearestLocation: null };
    }

    const withDistance = locations.map(loc => {
      if (loc.latitude == null || loc.longitude == null) {
        return { ...loc, distance: null, distanceDisplay: null };
      }
      const distance = haversineDistance(geo.latitude!, geo.longitude!, loc.latitude, loc.longitude);
      return { ...loc, distance, distanceDisplay: formatDistance(distance) };
    });

    // Sort: locations with distance first (nearest first), then no-coords at end
    const sorted = [...withDistance].sort((a, b) => {
      if (a.distance == null && b.distance == null) return 0;
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });

    const nearest = sorted.length > 0 && sorted[0].distance != null ? sorted[0] : null;

    return { sortedLocations: sorted, nearestLocation: nearest };
  }, [locations, geo.latitude, geo.longitude]);

  const userLocation = geo.latitude && geo.longitude
    ? { latitude: geo.latitude, longitude: geo.longitude }
    : null;

  const mappableLocations = locations.filter(l => l.latitude != null && l.longitude != null);

  return (
    <>
      {/* Location Map */}
      {mappableLocations.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Find a Location
          </h2>
          <BrandMapClient locations={locations} userLocation={userLocation} />
        </div>
      )}

      {/* Locations Grid */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Nearest Location Banner */}
        <AnimatePresence>
          {nearestLocation && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="mb-4 rounded-2xl border p-4 flex items-center gap-3"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 8%, var(--surface))",
                borderColor: "color-mix(in srgb, var(--accent-gold) 25%, var(--border))",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
              >
                <Navigation size={18} style={{ color: "var(--accent-gold)" }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>
                  You&apos;re closest to
                </p>
                <p className="font-display font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {nearestLocation.name}
                  <span className="font-mono text-xs font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                    {(nearestLocation as any).distanceDisplay}
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Locations
        </h2>

        {locations.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <MapPin size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No locations yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sortedLocations.map((loc: any) => (
              <Link
                key={loc.id}
                href={`/brewery/${loc.id}`}
                className="group rounded-2xl border overflow-hidden transition-all"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* Cover */}
                <div className="h-32 relative overflow-hidden">
                  {loc.cover_image_url || loc.logo_url ? (
                    <Image
                      src={loc.cover_image_url || loc.logo_url}
                      alt={loc.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, var(--surface-2))" }}>
                      <MapPin size={32} style={{ color: "var(--text-muted)" }} />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)" }} />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                    {loc.name}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                      <MapPin size={13} />
                      {loc.city}, {loc.state}
                    </p>
                    {loc.distanceDisplay && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          color: "var(--text-muted)",
                          background: "color-mix(in srgb, var(--text-muted) 10%, transparent)",
                        }}>
                        {loc.distanceDisplay}
                      </span>
                    )}
                  </div>
                  {loc.description && (
                    <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {loc.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
