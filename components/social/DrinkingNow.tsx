"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Beer, Home } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface ActiveFriend {
  sessionId: string;
  userId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  brewery: { id: string; name: string; city: string | null; state: string | null } | null;
  isHome: boolean;
  beerCount: number;
  startedAt: string;
}

function elapsedLabel(startedAt: string): string {
  const diffMs = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function DrinkingNow() {
  const [friends, setFriends] = useState<ActiveFriend[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchActive = useCallback(async () => {
    try {
      const res = await fetch("/api/friends/active");
      if (!res.ok) return;
      const { activeFriends } = await res.json();
      setFriends(activeFriends ?? []);
    } catch {
      // silently ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 60_000);
    return () => clearInterval(interval);
  }, [fetchActive]);

  if (!loaded || friends.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
            style={{ background: "#3D7A52" }}
          />
          <h2 className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Drinking Now
          </h2>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {friends.length} friend{friends.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Horizontal scroll strip */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {friends.map((f, i) => {
            const href = f.isHome
              ? `/profile/${f.username}`
              : f.brewery
              ? `/brewery/${f.brewery.id}`
              : `/profile/${f.username}`;

            return (
              <motion.div
                key={f.sessionId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={href}>
                  <div
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all hover:border-[#D4A843]/40 flex-shrink-0 w-[110px]"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {/* Avatar with live pulse ring */}
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-full animate-ping"
                        style={{
                          background: "rgba(61,122,82,0.25)",
                          animationDuration: "2.5s",
                        }}
                      />
                      <UserAvatar
                        profile={{
                          id: f.userId,
                          username: f.username ?? "",
                          display_name: f.displayName,
                          avatar_url: f.avatarUrl,
                        } as any}
                        size="md"
                      />
                      {/* Live dot */}
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{
                          background: "#3D7A52",
                          borderColor: "var(--surface)",
                        }}
                      />
                    </div>

                    {/* Name */}
                    <p
                      className="text-xs font-medium text-center truncate w-full"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {f.displayName.split(" ")[0]}
                    </p>

                    {/* Location */}
                    <p
                      className="text-[10px] text-center leading-tight truncate w-full"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {f.isHome ? (
                        <span className="flex items-center justify-center gap-1">
                          <Home size={9} />
                          Home
                        </span>
                      ) : (
                        f.brewery?.name ?? "Unknown"
                      )}
                    </p>

                    {/* Beer count + elapsed */}
                    <div className="flex items-center gap-1">
                      <Beer size={9} style={{ color: "#D4A843" }} />
                      <span className="text-[10px] font-mono" style={{ color: "#D4A843" }}>
                        {f.beerCount}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        · {elapsedLabel(f.startedAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
