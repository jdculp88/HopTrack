"use client";

import { useState, useEffect } from "react";

/**
 * Returns true when the browser has an active network connection.
 * Updates reactively as connection state changes.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Sync with actual browser state after hydration
    // Use queueMicrotask to avoid synchronous setState in effect (React compiler)
    const currentStatus = navigator.onLine;
    queueMicrotask(() => setIsOnline(currentStatus));

    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
