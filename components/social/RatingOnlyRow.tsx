"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { spring } from "@/lib/animation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/dates";
import { getFirstName } from "@/lib/first-name";
import { EmojiPulse } from "@/components/social/EmojiPulse";
import type { FriendRating } from "./RatingCard";

/**
 * RatingOnlyRow — compact row for ratings without a review comment
 *
 * Avatar | "Name rated Beer Name" + date · brewery | stars
 * No card wrapper — divider lines only. Used in feeds, beer Activity, profile Beer Journal.
 */
export function RatingOnlyRow({
  rating: review,
  index = 0,
}: {
  rating: FriendRating;
  index?: number;
}) {
  if (!review.profile || !review.beer) return null;

  const firstName = getFirstName(
    review.profile.display_name,
    review.profile.username
  );
  const brewery = review.beer.brewery;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.02, ...spring.default }}
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <Link href={`/profile/${review.profile.username}`} className="flex-shrink-0">
        <UserAvatar
          profile={{
            id: review.profile.id,
            username: review.profile.username,
            display_name: review.profile.display_name,
            avatar_url: review.profile.avatar_url,
          }}
          size="sm"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
          <Link
            href={`/profile/${review.profile.username}`}
            className="font-semibold hover:underline underline-offset-2"
          >
            {firstName}
          </Link>
          <span style={{ color: "var(--text-muted)" }}> rated </span>
          <span className="font-bold">{review.beer.name}</span>
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {formatRelativeTime(review.created_at)}
          {brewery ? ` · ${brewery.name}` : ""}
        </p>
      </div>

      {/* Small star display */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            style={{
              color: "var(--accent-gold)",
              fill:
                i < Math.round(review.rating)
                  ? "var(--accent-gold)"
                  : "transparent",
            }}
          />
        ))}
      </div>

      <EmojiPulse itemKey={`rating-${review.id}`} />
    </motion.div>
  );
}
