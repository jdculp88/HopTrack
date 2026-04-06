"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UsePullToRefreshOptions {
  threshold?: number; // px to pull before triggering, default 60
  onRefresh?: () => void;
}

/**
 * Pull-to-refresh for the home feed.
 * Attach `containerRef` to the scrollable container.
 * `isPulling` is true while the user is dragging past the threshold.
 * `pullDistance` is the raw drag distance (capped at threshold * 1.5).
 */
export function usePullToRefresh({
  threshold = 60,
  onRefresh,
}: UsePullToRefreshOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const thresholdHapticFired = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      // Only activate when scrolled to top
      if (window.scrollY > 0) return;
      startY.current = e.touches[0].clientY;
      thresholdHapticFired.current = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) { setPullDistance(0); setIsPulling(false); return; }
      // Prevent native scroll while pulling
      if (window.scrollY === 0 && dy > 0) e.preventDefault();
      const capped = Math.min(dy, threshold * 1.5);
      setPullDistance(capped);
      const pastThreshold = capped >= threshold;
      setIsPulling(pastThreshold);
      // Haptic feedback when crossing threshold (Sprint 169)
      if (pastThreshold && !thresholdHapticFired.current) {
        thresholdHapticFired.current = true;
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
          if (!mq.matches) navigator.vibrate(5);
        }
      }
    }

    function onTouchEnd() {
      if (isPulling && pullDistance >= threshold) {
        setIsRefreshing(true);
        if (onRefresh) {
          onRefresh();
        } else {
          window.location.reload();
        }
      }
      startY.current = null;
      setPullDistance(0);
      setIsPulling(false);
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [threshold, onRefresh, isPulling, pullDistance]);

  return { containerRef, pullDistance, isPulling, isRefreshing };
}
