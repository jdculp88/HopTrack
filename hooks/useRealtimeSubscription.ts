"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type PostgresEvent = "INSERT" | "UPDATE" | "DELETE";

interface UseRealtimeSubscriptionOptions {
  /** Supabase table name */
  table: string;
  /** Column to filter on (e.g., "brewery_id") */
  filterColumn?: string;
  /** Value to filter by (e.g., the brewery's UUID) */
  filterValue?: string;
  /** Which events to listen for */
  events?: PostgresEvent[];
  /** Callback when an event fires */
  onEvent: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  /** Whether the subscription is active (default: true) */
  enabled?: boolean;
}

/**
 * Generic Supabase Realtime subscription hook.
 * Subscribes to postgres_changes on a table, optionally filtered.
 * Cleans up channel on unmount or when deps change.
 *
 * Sprint 156 — The Triple Shot
 */
export function useRealtimeSubscription({
  table,
  filterColumn,
  filterValue,
  events = ["INSERT", "UPDATE", "DELETE"],
  onEvent,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channelName = `realtime-${table}-${filterColumn ?? "all"}-${filterValue ?? "all"}`;

    const filter = filterColumn && filterValue
      ? `${filterColumn}=eq.${filterValue}`
      : undefined;

    const channel = supabase.channel(channelName);

    for (const event of events) {
      channel.on(
        "postgres_changes" as "system",
        {
          event,
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        } as Record<string, unknown>,
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          onEvent(payload);
        },
      );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filterColumn, filterValue, enabled]);

  return channelRef;
}
