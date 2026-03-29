"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Beer, Home, MessageCircle } from "lucide-react";
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
          <span className="relative flex-shrink-0">
            <span
              className="w-2.5 h-2.5 rounded-full block"
              style={{ background: "var(--accent-gold)" }}
            />
            <span
              className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ background: "var(--accent-gold)", opacity: 0.5 }}
            />
          </span>
          <h2 className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            Live Now
          </h2>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
          >
            {friends.length}
          </span>
        </div>

        {/* Horizontal scroll strip — wider cards */}
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
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all flex-shrink-0 w-[140px]"
                    style={{
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {/* Avatar with subtle pulse ring */}
                    <div className="relative">
                      <div
                        className="absolute -inset-1 rounded-full animate-pulse"
                        style={{
                          background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                          animationDuration: "3s",
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
                          background: "var(--accent-gold)",
                          borderColor: "var(--surface)",
                        }}
                      />
                    </div>

                    {/* Name */}
                    <p
                      className="text-xs font-semibold text-center truncate w-full"
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
                    <div className="flex items-center gap-1.5">
                      <Beer size={10} style={{ color: "var(--accent-gold)" }} />
                      <span className="text-[10px] font-mono font-semibold" style={{ color: "var(--accent-gold)" }}>
                        {f.beerCount}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        · {elapsedLabel(f.startedAt)}
                      </span>
                    </div>

                    {/* Send cheers */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Fire-and-forget cheers notification
                        fetch('/api/notifications', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            recipient_id: f.userId,
                            type: 'session_cheers',
                            title: 'Cheers! 🍻',
                            body: 'A friend sent you cheers!',
                            data: { sessionId: f.sessionId },
                          }),
                        }).catch(() => {});
                      }}
                      className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                      style={{
                        color: "var(--accent-gold)",
                        background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                      }}
                    >
                      <MessageCircle size={9} />
                      Cheers
                    </button>
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
