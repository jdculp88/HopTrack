// useTabUrlSync — Sprint 160 (The Flow)
// Owner: Dakota
//
// Syncs tab state with URL query params. Default tab is omitted from URL to
// keep clean URLs for default views. Uses shallow router.replace (no scroll).

"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export interface UseTabUrlSyncOptions<K extends string> {
  /** URL query param name, e.g. "tab" or "mode" */
  param: string;
  /** Fallback tab if URL param is missing or invalid */
  defaultTab: K;
  /** Valid tab keys — used for validation */
  tabs: readonly K[];
}

export function useTabUrlSync<K extends string>({
  param,
  defaultTab,
  tabs,
}: UseTabUrlSyncOptions<K>): [K, (key: K) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo<K>(() => {
    const raw = searchParams.get(param);
    if (raw && (tabs as readonly string[]).includes(raw)) {
      return raw as K;
    }
    return defaultTab;
  }, [searchParams, param, defaultTab, tabs]);

  const setValue = useCallback(
    (key: K) => {
      const params = new URLSearchParams(searchParams.toString());
      if (key === defaultTab) {
        // Omit default from URL for clean URLs
        params.delete(param);
      } else {
        params.set(param, key);
      }
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(url, { scroll: false });
    },
    [searchParams, router, pathname, param, defaultTab]
  );

  return [value, setValue];
}
