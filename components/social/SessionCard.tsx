"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { spring, variants } from "@/lib/animation";
import { Home, Users } from "lucide-react";
import { getStyleVars } from "@/lib/beerStyleColors";
import { cn, formatRelativeTime } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SessionComments } from "@/components/social/SessionComments";
import { SessionSocialFooter } from "@/components/social/SessionSocialFooter";
import { ParticipantAvatars } from "@/components/session/ParticipantAvatars";
import { FeedCardMeta } from "@/components/social/FeedCardMeta";
import { BrewerySubCard } from "@/components/social/BrewerySubCard";
import { BeerEntryRow } from "@/components/social/BeerEntryRow";
import { SessionStatsStrip } from "@/components/social/SessionStatsStrip";
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

export function SessionCard({
  session,
  currentUserId,
  className,
  reactionCounts,
  userReactions,
  commentCount,
  participants,
}: SessionCardProps) {
  const { profile, brewery, beer_logs } = session;

  // Total pours (sum of quantity, not just log count)
  const totalPours = (beer_logs ?? []).reduce(
    (sum, l) => sum + ((l as any).quantity ?? 1),
    0
  );
  const ratedLogs = (beer_logs ?? []).filter((l) => l.rating != null);
  const avgRating =
    ratedLogs.length > 0
      ? ratedLogs.reduce((sum, l) => sum + (l.rating ?? 0), 0) / ratedLogs.length
      : null;

  // Session duration
  const duration = session.ended_at
    ? (() => {
        const ms =
          new Date(session.ended_at).getTime() -
          new Date(session.started_at).getTime();
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
    const groups: {
      beer: any;
      quantity: number;
      rating: number | null;
      style: string | null;
      logs: typeof logs;
    }[] = [];
    const seen = new Map<string, number>();
    for (const log of logs) {
      const key = log.beer?.name ?? log.id;
      const idx = seen.get(key);
      if (idx !== undefined) {
        groups[idx].quantity += (log as any).quantity ?? 1;
        if (
          log.rating != null &&
          (groups[idx].rating == null || log.rating > groups[idx].rating)
        ) {
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
  const acceptedParticipants = (participants ?? []).filter(
    (p) => p.status === "accepted"
  );
  const isGroupSession = acceptedParticipants.length > 0;
  const groupLabel = (() => {
    if (!isGroupSession) return null;
    const names = acceptedParticipants
      .slice(0, 2)
      .map(
        (p) =>
          p.profile?.display_name ?? p.profile?.username ?? "Someone"
      );
    const overflow = acceptedParticipants.length - 2;
    const nameStr =
      names.join(", ") +
      (overflow > 0
        ? ` and ${overflow} other${overflow > 1 ? "s" : ""}`
        : "");
    const location = isAtHome
      ? "at home"
      : brewery
        ? `at ${brewery.name}`
        : "";
    return `${nameStr} ${location}`.trim();
  })();

  // Show 4 grouped beers, expand if more
  const [expanded, setExpanded] = useState(false);
  // Comments only shown when user taps Comment
  const [commentsOpen, setCommentsOpen] = useState(false);
  const visibleGroups = expanded ? groupedLogs : groupedLogs.slice(0, 4);
  const hiddenCount = groupedLogs.length - 4;

  // Find first photo from beer logs
  const firstPhoto = (beer_logs ?? []).find((l) => l.photo_url)?.photo_url;

  // Session note
  const note = session.note;


  // Dominant beer style for left accent bar
  const dominantStyle = (() => {
    const styles = (beer_logs ?? [])
      .map((l) => (l.beer as { style?: string | null } | undefined)?.style)
      .filter(Boolean) as string[];
    if (styles.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const s of styles) { counts[s] = (counts[s] ?? 0) + 1; }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  })();

  if (!profile) return null;

  // Header meta context
  const metaContext = isAtHome
    ? "At home"
    : brewery?.name ?? null;

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
        "rounded-[16px] border border-[var(--border)] overflow-hidden relative",
        className
      )}
      style={{ background: "var(--card-bg)" }}
    >
      {/* Left accent bar — 4px, dominant beer style color, wraps corners */}
      {dominantStyle && (() => {
        const sv = getStyleVars(dominantStyle);
        return sv ? (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[16px]"
            style={{ background: sv.primary }}
          />
        ) : null;
      })()}

      {/* ── Header: avatar + meta ── */}
      <div className="p-4 pb-0">
        <div className="flex items-center" style={{ gap: "10px", marginBottom: "12px" }}>
          <Link href={`/profile/${profile.username}`}>
            <UserAvatar
              profile={{
                ...profile,
                display_name: profile.display_name ?? profile.username,
              }}
              size="md"
            />
          </Link>

          <FeedCardMeta
            username={profile.username}
            displayName={profile.display_name ?? profile.username}
            timestamp={formatRelativeTime(session.started_at)}
            contextText={metaContext}
          />
        </div>

        {/* At-home indicator (replaces brewery sub-card) */}
        {isAtHome && (
          <div
            className="flex items-center rounded-[10px]"
            style={{
              gap: "6px",
              padding: "8px 12px",
              background: "var(--warm-bg)",
              marginBottom: "12px",
            }}
          >
            <Home size={14} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <span
              className="font-sans font-semibold"
              style={{ fontSize: "13px", color: "var(--text-primary)" }}
            >
              Drinking at home
            </span>
          </div>
        )}

        {/* Brewery sub-card */}
        {!isAtHome && brewery && (
          <div style={{ marginBottom: "12px" }}>
            <BrewerySubCard
              breweryId={brewery.id}
              breweryName={brewery.name}
              city={brewery.city}
              state={brewery.state}
            />
          </div>
        )}

        {/* Session note */}
        {note && (
          <div className="pl-1" style={{ borderLeft: "2px solid var(--accent-gold)", marginBottom: "12px" }}>
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
        <div className="mx-4 mt-0 mb-3 rounded-xl overflow-hidden relative h-48">
          <Image
            src={firstPhoto}
            alt="Session photo"
            fill
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 640px"
          />
        </div>
      )}

      {/* ── Beer list ── */}
      {groupedLogs.length > 0 && (
        <div className="px-4" style={{ paddingBottom: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {visibleGroups.map((group, i) => (
              <BeerEntryRow
                key={group.beer?.name ?? i}
                quantity={group.quantity}
                style={group.style}
                beerName={group.beer?.name ?? "Unknown beer"}
                beerId={group.beer?.id}
              />
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
          <SessionStatsStrip
            beerCount={totalPours}
            duration={duration}
            avgRating={avgRating}
          />
        </div>
      )}

      {/* Session photos strip */}
      {(session.session_photos ?? []).length > 0 && (
        <SessionPhotoStrip photos={session.session_photos!} />
      )}

      {/* Group session participants */}
      {isGroupSession && (
        <div className="px-4 pt-2 pb-1 flex items-center gap-2">
          <Users
            size={12}
            style={{ color: "var(--text-muted)" }}
            className="flex-shrink-0"
          />
          <ParticipantAvatars
            participants={acceptedParticipants}
            size="xs"
            maxShow={3}
          />
          {groupLabel && (
            <span
              className="text-xs truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {groupLabel}
            </span>
          )}
        </div>
      )}

      {/* Social footer — 👍 Cheers + 💬 Comment (design spec) */}
      <SessionSocialFooter
        sessionId={session.id}
        reactionCounts={reactionCounts}
        userReactions={userReactions}
        commentCount={commentCount}
        onToggleComments={() => setCommentsOpen((prev) => !prev)}
      />

      {/* Comments — only visible when user taps Comment */}
      {commentsOpen && currentUserId && (
        <SessionComments
          sessionId={session.id}
          currentUserId={currentUserId}
          sessionOwnerId={session.user_id}
        />
      )}
    </motion.div>
  );
}
