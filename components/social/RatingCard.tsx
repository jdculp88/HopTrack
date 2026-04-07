"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Star, MessageCircle } from "lucide-react";
import { spring, variants } from "@/lib/animation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { EmojiPulse } from "@/components/social/EmojiPulse";
import { formatRelativeTime } from "@/lib/dates";
import { getFirstName } from "@/lib/first-name";
import { getStyleVars } from "@/lib/beerStyleColors";

export interface FriendRating {
  id: string;
  rating: number;
  comment: string | null;
  flavor_tags: string[] | null;
  created_at: string;
  beer: {
    id: string;
    name: string;
    style: string | null;
    brewery?: { id: string; name: string; city: string | null } | null;
  } | null;
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export function RatingCard({
  rating: review,
  index = 0,
}: {
  rating: FriendRating;
  index?: number;
}) {
  if (!review.profile || !review.beer) return null;

  const styleVars = review.beer.style ? getStyleVars(review.beer.style) : null;
  const firstName = getFirstName(
    review.profile.display_name,
    review.profile.username
  );
  const brewery = review.beer.brewery;

  return (
    <motion.div
      initial={variants.slideUpSmall.initial}
      whileInView={variants.slideUpSmall.animate}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.03, ...spring.default }}
      role="article"
      aria-label={`${review.profile.display_name || review.profile.username} reviewed ${review.beer.name}`}
      className="rounded-[14px] border border-[var(--border)] overflow-hidden relative"
      style={{
        background: styleVars
          ? `linear-gradient(135deg, color-mix(in srgb, ${styleVars.primary} 6%, var(--card-bg)) 0%, var(--card-bg) 40%)`
          : "var(--card-bg)",
      }}
    >
      {/* Left accent bar */}
      {styleVars && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[14px]"
          style={{ background: styleVars.primary }}
        />
      )}

      <div className="p-4">
        {/* Header: Beer name + big rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3
              className="font-display font-bold text-lg leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {review.beer.name}
            </h3>
            {brewery && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {brewery.name}
                {brewery.city ? ` · ${brewery.city}` : ""}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className="font-mono text-2xl font-bold leading-none"
              style={{ color: "var(--accent-gold)" }}
            >
              {Number(review.rating).toFixed(1)}
            </span>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={9}
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
          </div>
        </div>

        {/* Reviewer row */}
        <div className="flex items-center gap-2 mt-3">
          <Link href={`/profile/${review.profile.username}`}>
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
          <Link
            href={`/profile/${review.profile.username}`}
            className="font-semibold text-sm hover:underline underline-offset-2"
            style={{ color: "var(--text-primary)" }}
          >
            {firstName}
          </Link>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatRelativeTime(review.created_at)}
          </span>
        </div>

        {/* Review text */}
        {review.comment && (
          <p
            className="text-sm leading-relaxed mt-3"
            style={{ color: "var(--text-secondary)" }}
          >
            {review.comment}
          </p>
        )}

        {/* Tags row: style badge + flavor note pills */}
        {(review.beer.style || (review.flavor_tags && review.flavor_tags.length > 0)) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {review.beer.style && (
              <BeerStyleBadge style={review.beer.style} size="sm" />
            )}
            {(review.flavor_tags ?? []).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2.5 py-0.5 rounded-full"
                style={{
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Social footer */}
        <div
          className="flex items-center gap-4 mt-3 pt-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <EmojiPulse itemKey={`review-${review.id}`} />
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <MessageCircle size={13} />
            Reply
          </span>
        </div>
      </div>
    </motion.div>
  );
}
