"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { spring } from "@/lib/animation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/dates";
import { getFirstName } from "@/lib/first-name";
import { EmojiPulse } from "@/components/social/EmojiPulse";
import type { Session } from "@/types/database";

/**
 * CheckinCard — minimal single-line feed item (Strava kudos style)
 *
 * Used when a friend checks in at a brewery but doesn't log any beers.
 * No card border — just a divider line. Lightest visual weight in the feed.
 */
export function CheckinCard({
  session,
  index = 0,
}: {
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
  };
  index?: number;
}) {
  const { profile, brewery } = session;
  if (!profile) return null;

  const firstName = getFirstName(profile.display_name, profile.username);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.02, ...spring.default }}
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <Link href={`/profile/${profile.username}`} className="flex-shrink-0">
        <UserAvatar
          profile={{
            id: profile.id,
            username: profile.username,
            display_name: profile.display_name ?? profile.username,
            avatar_url: profile.avatar_url,
          }}
          size="sm"
        />
      </Link>

      <p className="text-sm flex-1 min-w-0 truncate" style={{ color: "var(--text-primary)" }}>
        <Link
          href={`/profile/${profile.username}`}
          className="font-semibold hover:underline underline-offset-2"
        >
          {firstName}
        </Link>
        <span style={{ color: "var(--text-muted)" }}> checked in at </span>
        {brewery ? (
          <Link
            href={`/brewery/${brewery.id}`}
            className="font-bold hover:underline underline-offset-2"
          >
            {brewery.name}
          </Link>
        ) : (
          <span className="font-bold">home</span>
        )}
      </p>

      <span
        className="text-xs font-mono flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {formatRelativeTime(session.started_at)}
      </span>

      <EmojiPulse itemKey={`checkin-${session.id}`} />
    </motion.div>
  );
}
