"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Beer, Star, Zap, Clock, Home } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { generateGradientFromString } from "@/lib/utils";
import type { Session, BeerLog } from "@/types/database";

interface SessionCardProps {
  session: Session & {
    profile?: {
      id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
    };
    brewery?: {
      id: string;
      name: string;
      city: string;
      state: string;
    };
    beer_logs?: BeerLog[];
  };
  className?: string;
}

export function SessionCard({ session, className }: SessionCardProps) {
  const { profile, brewery, beer_logs } = session;
  const beerCount = beer_logs?.length ?? 0;
  const avgRating =
    beerCount > 0
      ? (beer_logs!.reduce((sum, l) => sum + (l.rating ?? 0), 0) /
          beer_logs!.filter((l) => l.rating != null).length) || null
      : null;

  // Session duration
  const duration = session.ended_at
    ? (() => {
        const ms = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
        const mins = Math.round(ms / 60000);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
      })()
    : null;

  const isAtHome = (session as any).context === "home" || !brewery;

  // Show up to 3 beer log pills
  const visibleLogs = (beer_logs ?? []).slice(0, 3);
  const extraCount = beerCount - visibleLogs.length;

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <Link href={`/profile/${profile.username}`}>
          <UserAvatar profile={profile as any} size="md" showLevel />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link href={`/profile/${profile.username}`}>
              <span className="font-sans font-semibold text-[var(--text-primary)] hover:text-[#D4A843] transition-colors text-sm">
                {profile.display_name ?? profile.username}
              </span>
            </Link>
            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
              {formatRelativeTime(session.started_at)}
            </span>
          </div>

          {/* Visited brewery line */}
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {isAtHome ? (
              <span className="flex items-center gap-1">
                <Home size={11} />
                drinking at home
              </span>
            ) : (
              <>
                visited{" "}
                <Link
                  href={`/brewery/${brewery!.id}`}
                  className="text-[#D4A843] hover:underline font-medium"
                >
                  {brewery!.name}
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Brewery banner */}
      {brewery && !isAtHome && (
        <Link href={`/brewery/${brewery.id}`}>
          <div
            className="mx-4 rounded-xl p-3 flex items-center gap-3 hover:border-[#D4A843]/30 transition-colors"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0"
              style={{ background: generateGradientFromString(brewery.name) }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm text-[var(--text-primary)] truncate">
                {brewery.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <MapPin size={11} />
              <span>Brewery</span>
            </div>
          </div>
        </Link>
      )}

      {/* Beer log pills */}
      {beerCount > 0 && (
        <div className="px-4 pt-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2">
            {beerCount} beer{beerCount !== 1 ? "s" : ""} logged
          </p>
          <div className="flex flex-wrap gap-1.5">
            {visibleLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <Beer size={10} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {(log as any).beer?.name ?? (log.beer_id ? `Beer #${log.beer_id.slice(0, 4)}` : "Unnamed")}
                </span>
                {log.rating != null && (
                  <span style={{ color: 'var(--accent-gold)' }}>
                    {log.rating.toFixed(1)}★
                  </span>
                )}
              </div>
            ))}
            {extraCount > 0 && (
              <div
                className="flex items-center px-2.5 py-1 rounded-lg text-xs"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                +{extraCount} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-4 px-4 py-3 mt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <Beer size={12} />
          <span>{beerCount} beer{beerCount !== 1 ? "s" : ""}</span>
        </div>
        {avgRating != null && (
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Star size={12} />
            <span>{avgRating.toFixed(1)} avg</span>
          </div>
        )}
        {duration && (
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Clock size={12} />
            <span>{duration}</span>
          </div>
        )}
        {session.xp_awarded > 0 && (
          <div className="flex items-center gap-1 text-xs ml-auto" style={{ color: 'var(--accent-gold)' }}>
            <Zap size={12} />
            <span>+{session.xp_awarded} XP</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
