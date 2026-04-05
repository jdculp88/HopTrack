// useScrollMemory — Sprint 160 (The Flow)
// Owner: Dakota
//
// Saves window.scrollY per-key and restores on key change. Used by tabbed
// surfaces to preserve scroll position when user switches between tabs.
// Based on HomeFeed's existing per-tab scroll memory pattern.

"use client";

import { useEffect, useRef } from "react";

/**
 * Track scroll position per-key. When `key` changes, saves the current
 * scroll position under the previous key, then restores the scroll position
 * for the new key (or scrolls to 0 if no saved position exists).
 */
export function useScrollMemory<K extends string>(key: K, enabled: boolean = true): void {
  const scrollMap = useRef<Map<K, number>>(new Map());
  const prevKey = useRef<K>(key);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    // On key change: save previous scroll, restore new scroll
    if (prevKey.current !== key) {
      scrollMap.current.set(prevKey.current, window.scrollY);
      const saved = scrollMap.current.get(key) ?? 0;
      // Restore on next frame so new content has mounted
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: "instant" as ScrollBehavior });
      });
      prevKey.current = key;
    }
  }, [key, enabled]);
}
