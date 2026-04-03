"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { EmojiPulse } from "@/components/social/EmojiPulse";
import { FeedCardWrapper } from "@/components/social/FeedCardWrapper";
import { getFirstName } from "@/lib/first-name";
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

export function BreweryRatingFeedCard({
  review,
  index: _index = 0,
}: {
  review: FriendBreweryReview;
  index?: number;
}) {
  const firstName = getFirstName(review.profile?.display_name, review.profile?.username);

  return (
    <FeedCardWrapper
      accentColor="var(--accent-gold)"
      icon={<MapPin size={22} strokeWidth={1.75} />}
      ariaLabel={`${review.profile?.display_name || review.profile?.username} visited ${review.brewery?.name}`}
    >
      <div className="px-4 py-3">
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
    </FeedCardWrapper>
  );
}
