"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Location {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

interface LocationScopePickerProps {
  locations: Location[];
  value: string[] | null; // null = all locations
  onChange: (scope: string[] | null) => void;
  disabled?: boolean;
}

export function LocationScopePicker({ locations, value, onChange, disabled }: LocationScopePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const isAll = value === null;
  const selectedCount = isAll ? locations.length : value.length;

  function toggleAll() {
    onChange(isAll ? [] : null);
  }

  function toggleLocation(id: string) {
    if (isAll) {
      // Switch from "all" to "all except this one"
      onChange(locations.filter((l) => l.id !== id).map((l) => l.id));
    } else {
      const next = value.includes(id)
        ? value.filter((v) => v !== id)
        : [...value, id];
      // If all selected, switch to null
      onChange(next.length === locations.length ? null : next);
    }
  }

  const label = isAll
    ? "All locations"
    : selectedCount === 0
      ? "No locations"
      : `${selectedCount} location${selectedCount !== 1 ? "s" : ""}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full disabled:opacity-40"
        style={{
          background: "var(--surface-2)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      >
        <MapPin size={14} style={{ color: "var(--accent-gold)" }} />
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronDown
          size={14}
          style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute z-50 left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-lg"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="max-h-48 overflow-y-auto p-1">
              {/* All locations toggle */}
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-sm hover:opacity-80 transition-opacity"
                style={{ color: "var(--text-primary)" }}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isAll ? "var(--accent-gold)" : "transparent",
                    border: isAll ? "none" : "1px solid var(--border)",
                  }}
                >
                  {isAll && <Check size={12} style={{ color: "var(--bg)" }} />}
                </div>
                <span className="font-medium">All locations</span>
              </button>

              <div className="mx-3 my-1" style={{ borderTop: "1px solid var(--border)" }} />

              {/* Individual locations */}
              {locations.map((loc) => {
                const checked = isAll || (value?.includes(loc.id) ?? false);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => toggleLocation(loc.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-sm hover:opacity-80 transition-opacity"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: checked ? "var(--accent-gold)" : "transparent",
                        border: checked ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {checked && <Check size={12} style={{ color: "var(--bg)" }} />}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="truncate">{loc.name}</p>
                      {(loc.city || loc.state) && (
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {[loc.city, loc.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
