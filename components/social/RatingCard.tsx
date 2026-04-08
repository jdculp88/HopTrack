"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { spring, variants } from "@/lib/animation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { FlavorTag } from "@/components/ui/FlavorTag";
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
          <div
            className="flex flex-col items-center flex-shrink-0 rounded-[10px]"
            style={{
              background: "var(--warm-bg)",
              padding: "8px 12px",
            }}
          >
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
          <span
            className="font-mono"
            style={{ fontSize: "10.5px", color: "var(--text-muted)" }}
          >
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
              <FlavorTag key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Social footer — inset separator, same visual as SessionCard */}
        <div
          className="flex items-center mt-3 pt-3 border-t"
          style={{ borderColor: "var(--border)", gap: "16px" }}
        >
          <button
            className="flex items-center transition-colors"
            style={{ gap: "6px", color: "var(--text-muted)" }}
            aria-label="Cheers"
          >
            <ThumbsUp size={16} />
          </button>
          <span
            className="flex items-center font-mono"
            style={{ gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}
          >
            🍻 Cheers 0
          </span>
          <button
            className="flex items-center font-mono transition-colors"
            style={{ gap: "4px", fontSize: "12px", color: "var(--text-muted)" }}
            aria-label="Reply"
          >
            <MessageCircle size={14} /> Reply
          </button>
        </div>
      </div>
    </motion.div>
  );
}
