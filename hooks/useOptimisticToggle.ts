"use client";

import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

/**
 * Optimistic toggle hook — Sprint 134 (The Tidy)
 *
 * Replaces 5+ identical toggle patterns in admin pages (LoyaltyClient,
 * TapListClient, EventsClient, etc.) that all do:
 * 1. Flip local state optimistically
 * 2. Send update to Supabase
 * 3. Revert on error
 *
 * @example
 * const toggle = useOptimisticToggle(programs, setPrograms, "loyalty_programs");
 * <button onClick={() => toggle(prog.id, "is_active", prog.is_active)}>Toggle</button>
 */
export function useOptimisticToggle<T extends { id: string }>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  tableName: string
) {
  const { success, error: showError } = useToast();
  const supabase = createClient();

  async function toggle(
    id: string,
    field: keyof T & string,
    currentValue: boolean,
    messages?: { on?: string; off?: string; error?: string }
  ) {
    const newVal = !currentValue;

    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: newVal } : item
      )
    );

    const { error } = await supabase
      .from(tableName)
      .update({ [field]: newVal })
      .eq("id", id);

    if (error) {
      // Revert
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: currentValue } : item
        )
      );
      showError(messages?.error ?? "Failed to update");
    } else {
      success(
        newVal
          ? (messages?.on ?? "Activated")
          : (messages?.off ?? "Deactivated")
      );
    }
  }

  return toggle;
}
