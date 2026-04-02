"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side hook for notification badge count.
 * Fetches on mount, polls every 60s, and exposes a refresh function.
 */
export function useUnreadNotifications(initialCount = 0) {
  const [count, setCount] = useState(initialCount);
  const mountedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient();
      const { count: c } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      setCount(c ?? 0);
    } catch {
      // Silently fail — badge isn't critical
    }
  }, []);

  useEffect(() => {
    // Skip the initial render to avoid synchronous setState lint warning;
    // the initialCount from the server is good enough for first paint.
    if (!mountedRef.current) {
      mountedRef.current = true;
      // Schedule first refresh slightly after mount
      const t = setTimeout(refresh, 2000);
      const interval = setInterval(refresh, 60_000);
      return () => { clearTimeout(t); clearInterval(interval); };
    }
  }, [refresh]);

  return { count, refresh };
}
