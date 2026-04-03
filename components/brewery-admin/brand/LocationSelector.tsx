"use client";

import { motion } from "framer-motion";

interface LocationOption {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

interface LocationSelectorProps {
  locations: LocationOption[];
  selectedLocationId: string | null;
  onLocationChange: (id: string | null) => void;
  locationScope?: string[] | null;
}

export function LocationSelector({
  locations,
  selectedLocationId,
  onLocationChange,
  locationScope,
}: LocationSelectorProps) {
  // If locationScope is provided, only show locations in scope
  const visibleLocations = locationScope
    ? locations.filter((l) => locationScope.includes(l.id))
    : locations;

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {/* All Locations pill */}
      <button
        onClick={() => onLocationChange(null)}
        className="relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
        style={{
          background: selectedLocationId === null ? "var(--accent-gold)" : "var(--surface)",
          color: selectedLocationId === null ? "var(--bg)" : "var(--text-secondary)",
          border: `1px solid ${selectedLocationId === null ? "var(--accent-gold)" : "var(--border)"}`,
        }}
      >
        All Locations
        {selectedLocationId === null && (
          <motion.div
            layoutId="location-selector-active"
            className="absolute inset-0 rounded-xl"
            style={{ background: "var(--accent-gold)", zIndex: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </button>

      {visibleLocations.map((loc) => {
        const isActive = selectedLocationId === loc.id;
        return (
          <button
            key={loc.id}
            onClick={() => onLocationChange(loc.id)}
            className="relative px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0"
            style={{
              background: isActive ? "var(--accent-gold)" : "var(--surface)",
              color: isActive ? "var(--bg)" : "var(--text-secondary)",
              border: `1px solid ${isActive ? "var(--accent-gold)" : "var(--border)"}`,
            }}
          >
            {loc.name}
            {loc.city && loc.state && (
              <span
                className="ml-1 font-normal"
                style={{ color: isActive ? "var(--bg)" : "var(--text-muted)", opacity: isActive ? 0.8 : 1 }}
              >
                {loc.city}, {loc.state}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="location-selector-active"
                className="absolute inset-0 rounded-xl"
                style={{ background: "var(--accent-gold)", zIndex: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
