"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { spring, variants } from "@/lib/animation";
import { MapPin, Beer, Star, Home, Users } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SessionComments } from "@/components/social/SessionComments";
import { ReactionBar } from "@/components/social/ReactionBar";
import { ParticipantAvatars } from "@/components/session/ParticipantAvatars";
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
  const beerCount = beer_logs?.length ?? 0;
  const ratedLogs = (beer_logs ?? []).filter((l) => l.rating != null);
  const _avgRating =
    ratedLogs.length > 0
      ? ratedLogs.reduce((sum, l) => sum + (l.rating ?? 0), 0) / ratedLogs.length
      : null;

  // Session duration
  const _duration = session.ended_at
    ? (() => {
        const ms = new Date(session.ended_at).getTime() - new Date(session.started_at).getTime();
        const mins = Math.round(ms / 60000);
        if (mins < 60) return `${mins}m`;
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
      })()
    : null;

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

  // Show 4 beers, expand if more
  const [expanded, setExpanded] = useState(false);
  const visibleLogs = expanded ? (beer_logs ?? []) : (beer_logs ?? []).slice(0, 4);
  const hiddenCount = beerCount - 4;

  // Find first photo from beer logs
  const firstPhoto = (beer_logs ?? []).find((l) => l.photo_url)?.photo_url;

  // Session note
  const note = session.note;

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
        "bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] overflow-hidden",
        className
      )}
    >
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

            {/* Brewery name — large, prominent */}
            {isAtHome ? (
              <p className="text-sm mt-0.5 flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                <Home size={12} />
                Drinking at home
              </p>
            ) : (
              <div className="mt-0.5">
                <Link
                  href={`/brewery/${brewery!.id}`}
                  className="font-display font-bold text-base hover:underline underline-offset-2 transition-colors leading-tight"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {brewery!.name}
                </Link>
                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                  <MapPin size={10} />
                  {brewery!.city}{brewery!.state ? `, ${brewery!.state}` : ""}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Session note */}
        {note && (
          <div className="mt-3 pl-1" style={{ borderLeft: "2px solid var(--accent-gold)" }}>
            <p
              className="text-sm italic pl-3 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              "{note}"
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

      {/* Beer list — readable rows, one per line */}
      {beerCount > 0 && (
        <div className="px-4 pt-3 pb-1">
          <div className="space-y-1">
            {visibleLogs.map((log) => {
              const beer = log.beer;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-2 py-1.5"
                >
                  <Beer size={12} className="flex-shrink-0" style={{ color: "var(--accent-gold)" }} />
                  <span
                    className="font-display text-sm font-semibold flex-1 min-w-0 truncate"
                    style={{ color: "var(--text-primary)" }}
                    title={beer?.name}
                  >
                    {beer?.name ?? "Unknown beer"}
                  </span>
                  {beer?.style && (
                    <span
                      className="text-[10px] font-mono uppercase tracking-wide flex-shrink-0 px-1.5 py-0.5 rounded"
                      style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}
                    >
                      {beer.style}
                    </span>
                  )}
                  {log.rating != null && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <Star size={11} style={{ color: "var(--accent-gold)", fill: "var(--accent-gold)" }} />
                      <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
                        {Number(log.rating).toFixed(1)}
                      </span>
                    </div>
                  )}
                  {log.rating == null && (
                    <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      —
                    </span>
                  )}
                </div>
              );
            })}
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
