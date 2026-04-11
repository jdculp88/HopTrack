"use client";

/**
 * SensoryNotesPicker — multi-select chip input with a free-text escape hatch.
 *
 * Used three times in the BeerFormModal for Aroma, Taste, and Finish notes.
 * Given a catalog of standardized notes (see `lib/beer-sensory.ts`), the user
 * can:
 *
 *   1. Type to filter the catalog
 *   2. Click a suggestion to add it as a chip
 *   3. Press Enter on a query that doesn't match the catalog to add a custom
 *      note (the `normalizeNote` helper title-cases free text so it displays
 *      consistently with the preset options)
 *   4. Click the × on a chip or press Backspace in an empty input to remove
 *      the most recently added chip
 *
 * The component holds no state of its own except the current query string —
 * selected values are always the controlled `value` prop. That keeps it
 * trivially testable and makes it easy to wire into the existing
 * BeerFormModal dirty-tracking pattern.
 */

import { useMemo, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { isKnownNote, normalizeNote } from "@/lib/beer-sensory";

interface SensoryNotesPickerProps {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  options: readonly string[];
  placeholder?: string;
  /** Max suggestions rendered in the dropdown — defaults to 8 */
  maxSuggestions?: number;
  /** Max total selections — defaults to 8 (matches the Slideshow 3-column layout) */
  maxSelections?: number;
}

export function SensoryNotesPicker({
  label,
  value,
  onChange,
  options,
  placeholder = "Type to search or add custom...",
  maxSuggestions = 8,
  maxSelections = 8,
}: SensoryNotesPickerProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Case-insensitive selected-set so filtering respects whatever casing the
  // preset list uses (e.g. user-added "pine" and catalog "Pine" collide).
  const selectedLower = useMemo(
    () => new Set(value.map(v => v.toLowerCase())),
    [value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const unused = options.filter(o => !selectedLower.has(o.toLowerCase()));
    if (!q) return unused.slice(0, maxSuggestions);
    return unused
      .filter(o => o.toLowerCase().includes(q))
      .slice(0, maxSuggestions);
  }, [query, options, selectedLower, maxSuggestions]);

  const canAddCustom =
    query.trim().length > 0 &&
    !isKnownNote(query, options) &&
    !selectedLower.has(query.trim().toLowerCase()) &&
    value.length < maxSelections;

  function addNote(raw: string) {
    const normalized = normalizeNote(raw);
    if (!normalized) return;
    if (selectedLower.has(normalized.toLowerCase())) return;
    if (value.length >= maxSelections) return;
    onChange([...value, normalized]);
    setQuery("");
  }

  function removeNote(noteToRemove: string) {
    onChange(value.filter(v => v !== noteToRemove));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      // Prefer the first filtered suggestion if there is one, else add custom
      if (filtered.length > 0) {
        addNote(filtered[0]!);
      } else if (canAddCustom) {
        addNote(query);
      }
      return;
    }
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      e.preventDefault();
      removeNote(value[value.length - 1]!);
    }
  }

  const atMax = value.length >= maxSelections;

  return (
    <div>
      <label
        className="text-xs font-mono uppercase tracking-wider block mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
        {value.length > 0 && (
          <span
            className="ml-2 lowercase"
            style={{ letterSpacing: 0, textTransform: "none", color: "var(--text-muted)" }}
          >
            ({value.length}/{maxSelections})
          </span>
        )}
      </label>

      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map(note => (
            <button
              key={note}
              type="button"
              onClick={() => removeNote(note)}
              className="group flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "rgba(212,168,67,0.12)",
                border: "1px solid rgba(212,168,67,0.3)",
                color: "var(--accent-gold)",
              }}
              aria-label={`Remove ${note}`}
            >
              <span>{note}</span>
              <X
                size={12}
                className="opacity-60 group-hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </div>
      )}

      {/* Search input */}
      {!atMax && (
        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              // Small delay so suggestion clicks register before we hide
              setTimeout(() => setFocused(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-2 rounded-xl border text-sm focus:outline-none"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          />

          {/* Dropdown */}
          {focused && (filtered.length > 0 || canAddCustom) && (
            <div
              className="absolute left-0 right-0 mt-1 rounded-xl border shadow-lg overflow-hidden z-10"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {filtered.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault(); // keep focus on the input
                    addNote(suggestion);
                  }}
                  className="w-full text-left px-4 py-2 text-sm transition-colors hover:opacity-80"
                  style={{
                    color: "var(--text-primary)",
                    background: "transparent",
                  }}
                >
                  {suggestion}
                </button>
              ))}
              {canAddCustom && (
                <button
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    addNote(query);
                  }}
                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 border-t"
                  style={{
                    color: "var(--accent-gold)",
                    background: "rgba(212,168,67,0.05)",
                    borderColor: "var(--border)",
                  }}
                >
                  <Plus size={12} />
                  Add &quot;{normalizeNote(query)}&quot;
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {atMax && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Maximum of {maxSelections} notes reached.
        </p>
      )}
    </div>
  );
}
