"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { EmojiPulse } from "@/components/social/EmojiPulse";
import { formatRelativeTime } from "@/lib/dates";

export interface FriendBreweryReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  } | null;
}

const LARGE_BUBBLE_POS = [
  "absolute -top-3 -right-3",
  "absolute top-1 -right-4",
  "absolute -top-4 right-6",
  "absolute top-2 -right-2",
] as const;

const SMALL_BUBBLE_POS = [
  "absolute bottom-2 right-9",
  "absolute bottom-1 right-3",
  "absolute bottom-3 right-14",
  "absolute bottom-2 right-6",
] as const;

export function BreweryRatingFeedCard({
  review,
  index = 0,
}: {
  review: FriendBreweryReview;
  index?: number;
}) {
  const bubbleIdx = index % 4;
  const firstName = (
    review.profile?.display_name || review.profile?.username || "Someone"
  ).split(" ")[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      role="article"
      aria-label={`${review.profile?.display_name || review.profile?.username} visited ${review.brewery?.name}`}
      className="rounded-2xl overflow-hidden flex relative"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 7%, var(--surface)), var(--surface))",
        border:
          "1px solid color-mix(in srgb, var(--accent-gold) 18%, var(--border))",
      }}
    >
      {/* Bubble decorations */}
      <div
        className={`${LARGE_BUBBLE_POS[bubbleIdx]} w-16 h-16 rounded-full pointer-events-none`}
        style={{ background: "var(--accent-gold)", opacity: 0.06 }}
      />
      <div
        className={`${SMALL_BUBBLE_POS[bubbleIdx]} w-5 h-5 rounded-full pointer-events-none`}
        style={{ background: "var(--accent-gold)", opacity: 0.07 }}
      />

      {/* Gold accent bar */}
      <div
        className="w-1 flex-shrink-0"
        style={{ background: "var(--accent-gold)", opacity: 0.7 }}
      />

      {/* Icon column */}
      <div
        className="w-14 flex-shrink-0 flex items-center justify-center"
        style={{
          background:
            "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
        }}
      >
        <MapPin
          size={22}
          strokeWidth={1.75}
          style={{ color: "var(--accent-gold)" }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 px-4 py-3">
        {/* Line 1: Name + brewery */}
        <p className="text-sm leading-snug" style={{ color: "var(--text-primary)" }}>
          {review.profile ? (
            <Link
              href={`/profile/${review.profile.username}`}
              className="font-semibold hover:underline underline-offset-2"
            >
              {firstName}
            </Link>
          ) : (
            <span className="font-semibold">{firstName}</span>
          )}
          <span style={{ color: "var(--text-muted)" }}> visited </span>
          {review.brewery ? (
            <Link
              href={`/brewery/${review.brewery.id}`}
              className="font-display font-bold hover:underline underline-offset-2"
              style={{ color: "var(--text-primary)" }}
            >
              {review.brewery.name}
            </Link>
          ) : (
            <span className="font-display font-bold">a brewery</span>
          )}
        </p>

        {/* Line 2: Stars + timestamp */}
        <div className="flex items-center gap-2 mt-1.5">
          <StarRating value={review.rating} readonly size="sm" />
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {formatRelativeTime(review.created_at)}
          </span>
        </div>

        {/* Line 3: Comment (if present) */}
        {review.comment && (
          <p
            className="text-[11px] italic mt-1 line-clamp-2"
            style={{ color: "var(--text-muted)" }}
          >
            &ldquo;{review.comment}&rdquo;
          </p>
        )}

        {/* Line 4: EmojiPulse */}
        <EmojiPulse itemKey={`brewery-review-${review.id}`} />
      </div>
    </motion.div>
  );
}
