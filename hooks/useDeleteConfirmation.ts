"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

/**
 * Delete confirmation hook — Sprint 134 (The Tidy)
 *
 * Replaces 3+ identical delete confirmation patterns in admin pages
 * (LoyaltyClient, EventsClient, etc.) that all manage:
 * - confirmingId state (show confirmation UI)
 * - deletingId state (loading spinner)
 * - confirm → delete → remove from list → toast
 *
 * @example
 * const del = useDeleteConfirmation("promotions", items, setItems);
 * <button onClick={() => del.requestDelete(id)}>Delete</button>
 * {del.confirmingId === id && (
 *   <div>
 *     <button onClick={del.cancelDelete}>Cancel</button>
 *     <button onClick={() => del.confirmDelete(id)}>Confirm</button>
 *   </div>
 * )}
 */
export function useDeleteConfirmation<T extends { id: string }>(
  tableName: string,
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>,
  messages?: { success?: string; error?: string }
) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { success, error: showError } = useToast();
  const supabase = createClient();

  function requestDelete(id: string) {
    setConfirmingId(id);
  }

  function cancelDelete() {
    setConfirmingId(null);
  }

  async function confirmDelete(id: string) {
    setDeletingId(id);
    setConfirmingId(null);

    const { error } = await supabase.from(tableName).delete().eq("id", id);
    if (error) {
      showError(messages?.error ?? "Failed to delete");
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      success(messages?.success ?? "Deleted");
    }
    setDeletingId(null);
  }

  return {
    confirmingId,
    deletingId,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
