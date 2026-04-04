"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useBreweryPresence } from "@/hooks/useBreweryPresence";
import { stagger, spring } from "@/lib/animation";

interface DrinkingNowStripProps {
  breweryId: string;
  initialCount?: number;
}

interface FallbackUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string;
}

const MAX_VISIBLE = 5;

export function DrinkingNowStrip({ breweryId, initialCount }: DrinkingNowStripProps) {
  const { presentUsers } = useBreweryPresence({ breweryId });
  const [fallbackUsers, setFallbackUsers] = useState<FallbackUser[]>([]);
  const [fallbackCount, setFallbackCount] = useState(initialCount ?? 0);
  const [loaded, setLoaded] = useState(false);

  // Fetch fallback data from API when Realtime has no users
  useEffect(() => {
    if (presentUsers.length > 0) {
      setLoaded(true);
      return;
    }

    let cancelled = false;
    async function fetchPresence() {
      try {
        const res = await fetch(`/api/brewery/${breweryId}/presence`);
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setFallbackUsers(json.data?.users ?? []);
        setFallbackCount(json.data?.count ?? 0);
      } catch {
        // Silent fail — presence is best-effort
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    fetchPresence();
    return () => { cancelled = true; };
  }, [breweryId, presentUsers.length]);

  // Merge sources: prefer Realtime, fall back to API
  const users = presentUsers.length > 0 ? presentUsers : fallbackUsers;
  const totalCount = presentUsers.length > 0 ? presentUsers.length : fallbackCount;

  // Render nothing when no one is present
  if (loaded && totalCount === 0) return null;
  if (!loaded && !initialCount) return null;

  const visibleUsers = users.slice(0, MAX_VISIBLE);
  const overflow = totalCount - MAX_VISIBLE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.default}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex">
        {/* Gold accent bar */}
        <div
          className="w-[2px] flex-shrink-0"
          style={{ background: "var(--accent-gold)" }}
        />

        <div className="flex-1 p-3 sm:p-4">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{ background: "#22c55e" }}
            />
            <Users size={14} style={{ color: "var(--accent-gold)" }} />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {totalCount} {totalCount === 1 ? "person" : "people"} here now
            </span>
          </div>

          {/* Avatar row */}
          {visibleUsers.length > 0 && (
            <motion.div
              className="flex items-center gap-2"
              {...stagger.container(0.06)}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="popLayout">
                {visibleUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={spring.snappy}
                  >
                    <UserAvatar
                      profile={{
                        display_name: user.display_name,
                        avatar_url: user.avatar_url,
                        username: user.username,
                      }}
                      size="sm"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {overflow > 0 && (
                <span
                  className="text-xs font-mono flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                >
                  +{overflow} more
                </span>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
