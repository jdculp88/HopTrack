"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface PresentUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string;
}

interface UseBreweryPresenceOptions {
  breweryId: string;
  enabled?: boolean;
}

export function useBreweryPresence({ breweryId, enabled = true }: UseBreweryPresenceOptions) {
  const [presentUsers, setPresentUsers] = useState<PresentUser[]>([]);

  useEffect(() => {
    if (!enabled || !breweryId) return;

    const supabase = createClient();
    const channel = supabase.channel(`brewery-presence:${breweryId}`, {
      config: { presence: { key: breweryId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: PresentUser[] = [];
        for (const key in state) {
          for (const presence of state[key]) {
            const p = presence as unknown as PresentUser & { presence_ref: string };
            if (p.id && !users.find((u) => u.id === p.id)) {
              users.push({
                id: p.id,
                display_name: p.display_name,
                avatar_url: p.avatar_url,
                username: p.username,
              });
            }
          }
        }
        setPresentUsers(users);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [breweryId, enabled]);

  const joinPresence = async (user: PresentUser) => {
    const supabase = createClient();
    const channel = supabase.channel(`brewery-presence:${breweryId}`);
    await channel.track(user);
  };

  return { presentUsers, joinPresence };
}
