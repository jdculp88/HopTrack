"use client";

import { useState } from "react";
import type { FlavorTag, ServingStyle, Brewery, Beer } from "@/types/database";

export interface CheckinPayload {
  brewery_id: string;
  beer_id?: string;
  rating?: number;
  comment?: string;
  flavor_tags?: FlavorTag[];
  serving_style?: ServingStyle;
  photo_url?: string;
  checked_in_with?: string[];
  share_to_feed?: boolean;
}

export function useCheckin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitCheckin(payload: CheckinPayload) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to log check-in");
      return data; // { checkin, xpGained, newAchievements }
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { submitCheckin, loading, error };
}
