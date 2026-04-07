"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { spring, variants } from "@/lib/animation";
import { MapPin, Beer, Star, Home, Users, Clock } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SessionComments } from "@/components/social/SessionComments";
import { ReactionBar } from "@/components/social/ReactionBar";
import { ParticipantAvatars } from "@/components/session/ParticipantAvatars";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { getStyleFamily, getStyleVars } from "@/lib/beerStyleColors";
import type { Session, BeerLog, SessionParticipant } from "@/types/database";

// ── Photo strip for feed cards ───────────────────────────────────────────────

interface SessionPhotoStripProps {
  photos: { id: string; url: string; created_at: string }[];
}

function SessionPhotoStrip({ photos }: SessionPhotoStripProps) {
  const MAX_VISIBLE = 3;
  const visible = photos.slice(0, MAX_VISIBLE);
  const overflow = photos.length - MAX_VISIBLE;

  return (
    <div
      className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {visible.map((photo, idx) => {
        const isLast = idx === MAX_VISIBLE - 1 && overflow > 0;
        return (
          <div
            key={photo.id}
            className="relative flex-shrink-0 rounded-xl overflow-hidden"
            style={{ width: 128, height: 128 }}
          >
            <Image
              src={photo.url}
              alt="Session photo"
              fill
              className="object-cover"
              sizes="128px"
            />
            {isLast && (
              <div
                className="absolute inset-0 flex items-center justify-center text-sm font-semibold"
                style={{
                  background: "color-mix(in srgb, var(--bg) 60%, transparent)",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(4px)",
                }}
              >
                +{overflow} more
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main card ────────────────────────────────────────────────────────────────

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
      city: string | null;
      state: string | null;
    };
    beer_logs?: BeerLog[];
  };
  currentUserId?: string;
  className?: string;
  reactionCounts?: Record<string, number>;
  userReactions?: string[];
  commentCount?: number;
  participants?: SessionParticipant[];
}

export function SessionCard({ session, currentUserId, className, reactionCounts, userReactions, commentCount, participants }: SessionCardProps) {
  const { profile, brewery, beer_logs } = session;
  // Total pours (sum of quantity, not just log count)
  const totalPours = (beer_logs ?? []).reduce((sum, l) => sum + ((l as any).quantity ?? 1), 0);
  const ratedLogs = (beer_logs ?? []).filter((l) => l.rating != null);
  const avgRating =
    ratedLogs.length > 0
      ? ratedLogs.reduce((sum, l) => sum + (l.rating ?? 0), 0) / ratedLogs.length
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

  // Group beer logs by beer name for pour counts
  const groupedLogs = (() => {
    const logs = beer_logs ?? [];
    const groups: { beer: any; quantity: number; rating: number | null; style: string | null; logs: typeof logs }[] = [];
    const seen = new Map<string, number>();
    for (const log of logs) {
      const key = log.beer?.name ?? log.id;
      const idx = seen.get(key);
      if (idx !== undefined) {
        groups[idx].quantity += (log as any).quantity ?? 1;
        // Keep highest rating
        if (log.rating != null && (groups[idx].rating == null || log.rating > groups[idx].rating)) {
          groups[idx].rating = log.rating;
        }
      } else {
        seen.set(key, groups.length);
        groups.push({
          beer: log.beer,
          quantity: (log as any).quantity ?? 1,
          rating: log.rating ?? null,
          style: (log.beer as any)?.style ?? null,
          logs: [log],
        });
      }
    }
    return groups;
  })();

  const isAtHome = session.context === "home" || !brewery;

  // Group session helpers
  const acceptedParticipants = (participants ?? []).filter((p) => p.status === "accepted");
  const isGroupSession = acceptedParticipants.length > 0;
  const groupLabel = (() => {
    if (!isGroupSession) return null;
    const names = acceptedParticipants.slice(0, 2).map((p) => p.profile?.display_name ?? p.profile?.username ?? "Someone");
    const overflow = acceptedParticipants.length - 2;
    const nameStr = names.join(", ") + (overflow > 0 ? ` and ${overflow} other${overflow > 1 ? "s" : ""}` : "");
    const location = isAtHome ? "at home" : brewery ? `at ${brewery.name}` : "";
    return `${nameStr} ${location}`.trim();
  })();

  // Show 4 grouped beers, expand if more
  const [expanded, setExpanded] = useState(false);
  const visibleGroups = expanded ? groupedLogs : groupedLogs.slice(0, 4);
  const hiddenCount = groupedLogs.length - 4;

  // Find first photo from beer logs
  const firstPhoto = (beer_logs ?? []).find((l) => l.photo_url)?.photo_url;

  // Session note
  const note = session.note;

  // DS v2: Dominant beer style for card tinting
  const dominantStyle = (() => {
    const styles = (beer_logs ?? []).map(l => (l.beer as { style?: string | null } | undefined)?.style).filter(Boolean) as string[];
    if (styles.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const s of styles) { counts[s] = (counts[s] ?? 0) + 1; }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  })();
  const styleVars = dominantStyle ? getStyleVars(dominantStyle) : null;

  if (!profile) return null;

  const cardLabel = isAtHome
    ? `Session by ${profile.display_name ?? profile.username} at home`
    : `${brewery?.name ?? "brewery"} session by ${profile.display_name ?? profile.username}`;

  return (
    <motion.div
      initial={variants.slideUpSmall.initial}
      whileInView={variants.slideUpSmall.animate}
      viewport={{ once: true, margin: "-50px" }}
      transition={spring.default}
      role="article"
      aria-label={cardLabel}
      className={cn(
        "rounded-[14px] border border-[var(--border)] overflow-hidden relative",
        className
      )}
      style={{
        background: styleVars
          ? `linear-gradient(135deg, color-mix(in srgb, ${styleVars.primary} 8%, var(--card-bg)) 0%, var(--card-bg) 40%)`
          : "var(--card-bg)",
      }}
    >
      {/* DS v2: Left accent bar in session's dominant beer style color */}
      {styleVars && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[14px]"
          style={{ background: styleVars.primary }}
        />
      )}
      {/* Header — avatar, name, time, brewery */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <Link href={`/profile/${profile.username}`}>
            <UserAvatar profile={{ ...profile, display_name: profile.display_name ?? profile.username }} size="md" showLevel />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/profile/${profile.username}`}>
                <span
                  className="font-sans font-semibold text-sm hover:underline underline-offset-2 transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  {profile.display_name ?? profile.username}
                </span>
              </Link>
              <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                {formatRelativeTime(session.started_at)}
              </span>
            </div>

            {/* Context line */}
            {isAtHome ? (
              <p className="text-sm mt-0.5 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Home size={12} />
                Drinking at home
              </p>
            ) : brewery && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {brewery.name}
              </p>
            )}
          </div>
        </div>

        {/* Brewery location sub-card */}
        {!isAtHome && brewery && (
          <Link
            href={`/brewery/${brewery.id}`}
            className="mt-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors hover:opacity-80"
            style={{ background: "var(--surface-2)" }}
          >
            <MapPin size={14} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <div className="min-w-0">
              <span className="font-sans font-bold text-sm block" style={{ color: "var(--text-primary)" }}>
                {brewery.name}
              </span>
              {(brewery.city || brewery.state) && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Session note */}
        {note && (
          <div className="mt-3 pl-1" style={{ borderLeft: "2px solid var(--accent-gold)" }}>
            <p
              className="text-sm italic pl-3 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              &ldquo;{note}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Photo — first beer log photo */}
      {firstPhoto && (
        <div className="mx-4 mt-3 rounded-xl overflow-hidden relative h-48">
          <Image
            src={firstPhoto}
            alt="Session photo"
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 640px"
          />
        </div>
      )}

      {/* Beer list — grouped with pour counts */}
      {groupedLogs.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <div className="space-y-1">
            {visibleGroups.map((group, i) => (
              <div key={group.beer?.name ?? i} className="flex items-center gap-2 py-1.5">
                {/* Pour count badge */}
                <span
                  className="font-mono text-[11px] font-semibold flex-shrink-0 w-6 text-center rounded"
                  style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}
                >
                  &times;{group.quantity}
                </span>
                {/* Style badge */}
                {group.style && (
                  <BeerStyleBadge style={group.style} size="xs" />
                )}
                {/* Beer name */}
                <span
                  className="text-sm font-sans flex-1 min-w-0 truncate"
                  style={{ color: "var(--text-primary)" }}
                  title={group.beer?.name}
                >
                  {group.beer?.name ?? "Unknown beer"}
                </span>
              </div>
            ))}
          </div>
          {hiddenCount > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs font-medium mt-1 mb-1 transition-colors hover:underline underline-offset-2"
              style={{ color: "var(--accent-gold)" }}
            >
              Show {hiddenCount} more
            </button>
          )}

          {/* Stats strip */}
          <div
            className="flex items-center gap-3 pt-2 mt-2 flex-wrap"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>🍺</span>
              <span className="font-mono font-semibold">{totalPours}</span>
              <span>beer{totalPours !== 1 ? "s" : ""}</span>
            </span>
            {duration && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Clock size={11} />
                <span className="font-mono font-semibold">{duration}</span>
              </span>
            )}
            {avgRating != null && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Star size={11} style={{ fill: "var(--text-muted)" }} />
                <span className="font-mono font-semibold">avg {avgRating.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Session photos strip */}
      {(session.session_photos ?? []).length > 0 && (
        <SessionPhotoStrip photos={session.session_photos!} />
      )}

      {/* Group session participants */}
      {isGroupSession && (
        <div className="px-4 pt-2 pb-1 flex items-center gap-2">
          <Users size={12} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
          <ParticipantAvatars participants={acceptedParticipants} size="xs" maxShow={3} />
          {groupLabel && (
            <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {groupLabel}
            </span>
          )}
        </div>
      )}

      {/* Reaction footer */}
      <ReactionBar
        sessionId={session.id}
        reactionCounts={reactionCounts}
        userReactions={userReactions}
        commentCount={commentCount}
      />

      {/* Comments — always visible */}
      {currentUserId && (
        <SessionComments
          sessionId={session.id}
          currentUserId={currentUserId}
          sessionOwnerId={session.user_id}
        />
      )}
    </motion.div>
  );
}
