"use client";

import { useEffect } from "react";

/**
 * Auto-scroll effect for Board formats.
 * Scrolls at 0.12px/frame with a 5-second pause at the top after each loop.
 */
export function useAutoScroll(
  ref: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let id: number, pos = 0, pause = 300;
    const tick = () => {
      if (!el || el.scrollHeight <= el.clientHeight) { id = requestAnimationFrame(tick); return; }
      if (pause > 0) { pause--; id = requestAnimationFrame(tick); return; }
      pos += 0.12;
      if (pos >= el.scrollHeight - el.clientHeight) { pos = 0; pause = 300; }
      el.scrollTop = pos;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}
