"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Beer as BeerIcon, MapPin, X, Clock } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const RECENT_SEARCHES_KEY = "ht-recent-searches";
const MAX_RECENT = 5;

interface RecentSearch {
  type: "beer" | "brewery";
  id: string;
  name: string;
  subtitle: string;
}

function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(item: RecentSearch) {
  try {
    const existing = getRecentSearches().filter(
      (r) => !(r.type === item.type && r.id === item.id)
    );
    const updated = [item, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // localStorage unavailable
  }
}

interface BeerResult {
  id: string;
  name: string;
  style: string | null;
  abv: number | null;
  brewery?: { id: string; name: string };
}

interface BreweryResult {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  brewery_type: string | null;
}

interface SearchResponse {
  beers: BeerResult[];
  breweries: BreweryResult[];
}

interface SearchTypeaheadProps {
  placeholder?: string;
  onSelectBeer?: (beer: {
    id: string;
    name: string;
    style: string | null;
    brewery?: { id: string; name: string };
  }) => void;
  onSelectBrewery?: (brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  }) => void;
  onQueryChange?: (query: string) => void;
  autoFocus?: boolean;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function SearchTypeahead({
  placeholder = "Search beers & breweries...",
  onSelectBeer,
  onSelectBrewery,
  onQueryChange,
  autoFocus = false,
  className = "",
}: SearchTypeaheadProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query, 300);

  // Build a flat list of selectable items for keyboard navigation
  const flatItems: Array<
    | { type: "beer"; item: BeerResult }
    | { type: "brewery"; item: BreweryResult }
  > = [];
  if (results) {
    for (const beer of results.beers) {
      flatItems.push({ type: "beer", item: beer });
    }
    for (const brewery of results.breweries) {
      flatItems.push({ type: "brewery", item: brewery });
    }
  }

  // Hide recent searches when user starts typing
  useEffect(() => {
    if (query.length > 0) {
      setShowRecent(false);
    }
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    let cancelled = false;

    async function fetchResults() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!res.ok) throw new Error("Search failed");
        const data: SearchResponse = await res.json();
        if (!cancelled) {
          setResults(data);
          setIsOpen(true);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setResults(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Notify parent of query changes
  useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowRecent(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-typeahead-item]");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (entry: (typeof flatItems)[number]) => {
      if (entry.type === "beer") {
        const beer = entry.item as BeerResult;
        saveRecentSearch({
          type: "beer",
          id: beer.id,
          name: beer.name,
          subtitle: [beer.brewery?.name, beer.style].filter(Boolean).join(" · "),
        });
        onSelectBeer?.({
          id: beer.id,
          name: beer.name,
          style: beer.style,
          brewery: beer.brewery,
        });
      } else {
        const b = entry.item as BreweryResult;
        saveRecentSearch({
          type: "brewery",
          id: b.id,
          name: b.name,
          subtitle: [b.city, b.state].filter(Boolean).join(", "),
        });
        onSelectBrewery?.({
          id: b.id,
          name: b.name,
          city: b.city,
          state: b.state,
        });
      }
      setQuery("");
      setIsOpen(false);
      setShowRecent(false);
      setActiveIndex(-1);
    },
    [onSelectBeer, onSelectBrewery]
  );

  const handleSelectRecent = useCallback(
    (item: RecentSearch) => {
      if (item.type === "beer") {
        onSelectBeer?.({ id: item.id, name: item.name, style: null });
      } else {
        const parts = item.subtitle.split(", ");
        onSelectBrewery?.({
          id: item.id,
          name: item.name,
          city: parts[0] || null,
          state: parts[1] || null,
        });
      }
      setQuery("");
      setIsOpen(false);
      setShowRecent(false);
      setActiveIndex(-1);
    },
    [onSelectBeer, onSelectBrewery]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || flatItems.length === 0) {
      if (e.key === "Escape") {
        setQuery("");
        setShowRecent(false);
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < flatItems.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : flatItems.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < flatItems.length) {
          handleSelect(flatItems[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  const hasResults =
    results && (results.beers.length > 0 || results.breweries.length > 0);
  const showEmpty =
    results &&
    results.beers.length === 0 &&
    results.breweries.length === 0 &&
    !isLoading;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results && query.length >= 2) {
              setIsOpen(true);
            } else if (query.length === 0) {
              const recent = getRecentSearches();
              setRecentSearches(recent);
              setShowRecent(recent.length > 0);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-colors"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `typeahead-item-${activeIndex}` : undefined
          }
        />
        {/* Clear / Loading indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2
              className="w-4 h-4 animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          ) : query.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults(null);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-0.5 rounded-md hover:opacity-80 transition-opacity"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Recent searches dropdown */}
      <AnimatePresence>
        {showRecent && !isOpen && recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={spring}
            className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border overflow-hidden shadow-lg"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Recent
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearRecentSearches();
                    setRecentSearches([]);
                    setShowRecent(false);
                  }}
                  className="text-xs px-2 py-0.5 rounded-md transition-opacity hover:opacity-80"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer hover:bg-[var(--surface-2)]"
                  onClick={() => handleSelectRecent(item)}
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--surface-2)" }}
                  >
                    {item.type === "beer" ? (
                      <BeerIcon
                        className="w-4 h-4"
                        style={{ color: "var(--accent-gold)" }}
                      />
                    ) : (
                      <MapPin
                        className="w-4 h-4"
                        style={{ color: "var(--accent-gold)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-medium truncate block"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.name}
                    </span>
                    {item.subtitle && (
                      <span
                        className="text-xs mt-0.5 truncate block"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  <Clock
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (hasResults || showEmpty) && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={spring}
            className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border overflow-hidden shadow-lg"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto"
              role="listbox"
            >
              {/* Empty state */}
              {showEmpty && (
                <div
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  No results for "{query}"
                </div>
              )}

              {/* Beer results */}
              {results && results.beers.length > 0 && (
                <div>
                  <div
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Beers
                  </div>
                  {results.beers.map((beer) => {
                    const idx = flatItems.findIndex(
                      (f) => f.type === "beer" && f.item.id === beer.id
                    );
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={`beer-${beer.id}`}
                        id={`typeahead-item-${idx}`}
                        data-typeahead-item
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isActive
                            ? "var(--surface-2)"
                            : "transparent",
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => handleSelect(flatItems[idx])}
                      >
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: "var(--surface-2)",
                          }}
                        >
                          <BeerIcon
                            className="w-4 h-4"
                            style={{ color: "var(--accent-gold)" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {beer.name}
                            </span>
                            {beer.style && (
                              <span
                                className="flex-shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: "var(--surface-2)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {beer.style}
                              </span>
                            )}
                          </div>
                          <div
                            className="flex items-center gap-2 text-xs mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {beer.brewery && (
                              <span className="truncate">
                                {beer.brewery.name}
                              </span>
                            )}
                            {beer.abv != null && (
                              <span className="flex-shrink-0">
                                {beer.abv}% ABV
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Brewery results */}
              {results && results.breweries.length > 0 && (
                <div>
                  {results.beers.length > 0 && (
                    <div
                      className="mx-3 border-t"
                      style={{ borderColor: "var(--border)" }}
                    />
                  )}
                  <div
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Breweries
                  </div>
                  {results.breweries.map((brewery) => {
                    const idx = flatItems.findIndex(
                      (f) =>
                        f.type === "brewery" && f.item.id === brewery.id
                    );
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={`brewery-${brewery.id}`}
                        id={`typeahead-item-${idx}`}
                        data-typeahead-item
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isActive
                            ? "var(--surface-2)"
                            : "transparent",
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => handleSelect(flatItems[idx])}
                      >
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: "var(--surface-2)",
                          }}
                        >
                          <MapPin
                            className="w-4 h-4"
                            style={{ color: "var(--accent-gold)" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-medium truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {brewery.name}
                            </span>
                            {brewery.brewery_type && (
                              <span
                                className="flex-shrink-0 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: "var(--surface-2)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {brewery.brewery_type}
                              </span>
                            )}
                          </div>
                          {(brewery.city || brewery.state) && (
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {[brewery.city, brewery.state]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
