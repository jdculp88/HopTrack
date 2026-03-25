"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, MessageCircle, ThumbsUp, Flame, Beer } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StarRating } from "@/components/ui/StarRating";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import type { CheckinWithDetails, ReactionType } from "@/types/database";

const REACTIONS: { type: ReactionType; icon: React.ReactNode; label: string }[] = [
  { type: "thumbs_up", icon: <ThumbsUp size={14} />, label: "👍" },
  { type: "flame",     icon: <Flame size={14} />,     label: "🔥" },
  { type: "beer",      icon: <Beer size={14} />,      label: "🍺" },
];

interface CheckinCardProps {
  checkin: CheckinWithDetails;
  onReact?: (checkinId: string, type: ReactionType) => void;
  className?: string;
}

export function CheckinCard({ checkin, onReact, className }: CheckinCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { profile, brewery, beer } = checkin as any;

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
          <UserAvatar profile={profile} size="md" showLevel />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link href={`/profile/${profile.username}`}>
              <span className="font-sans font-semibold text-[var(--text-primary)] hover:text-[#D4A843] transition-colors text-sm">
                {profile.display_name}
              </span>
            </Link>
            <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
              {formatRelativeTime(checkin.created_at)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
            <span>checked in at</span>
            <Link href={`/brewery/${brewery.id}`}>
              <span className="text-[var(--text-secondary)] hover:text-[#D4A843] transition-colors font-medium">
                {brewery.name}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Beer info */}
      {beer ? (
        <div className="px-4 pb-3">
          <Link href={`/beer/${beer.id}`}>
            <div className="bg-[var(--surface-2)] rounded-xl p-3 hover:bg-[#2a2720] transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-[var(--text-primary)] group-hover:text-[#D4A843] transition-colors leading-tight">
                    {beer.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <BeerStyleBadge style={beer.style} size="xs" />
                    {beer.abv && (
                      <span className="text-xs font-mono text-[var(--text-muted)]">{beer.abv}% ABV</span>
                    )}
                    {checkin.serving_style && (
                      <span className="text-xs text-[var(--text-muted)] capitalize">{checkin.serving_style}</span>
                    )}
                  </div>
                </div>
                {checkin.rating && (
                  <div className="flex-shrink-0">
                    <StarRating value={checkin.rating} readonly size="sm" />
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      ) : checkin.rating ? (
        <div className="px-4 pb-3">
          <div className="bg-[var(--surface-2)] rounded-xl p-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-muted)]">Brewery visit</span>
              <StarRating value={checkin.rating} readonly size="sm" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Comment */}
      {checkin.comment && (
        <div className="px-4 pb-3">
          <p
            className={cn(
              "text-sm text-[var(--text-secondary)] leading-relaxed",
              !expanded && "line-clamp-2"
            )}
          >
            "{checkin.comment}"
          </p>
          {checkin.comment.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-[var(--text-muted)] hover:text-[#D4A843] mt-1 transition-colors"
            >
              {expanded ? "Less" : "More"}
            </button>
          )}
        </div>
      )}

      {/* Flavor tags */}
      {checkin.flavor_tags && checkin.flavor_tags.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {checkin.flavor_tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[var(--surface-2)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full border border-[var(--border)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Photo */}
      {checkin.photo_url && (
        <div className="px-4 pb-3">
          <div className="relative h-48 rounded-xl overflow-hidden">
            <Image src={checkin.photo_url} alt="Check-in photo" fill className="object-cover" />
          </div>
        </div>
      )}

      {/* First time badge */}
      {checkin.is_first_time && (
        <div className="px-4 pb-3">
          <div className="inline-flex items-center gap-1.5 bg-[#D4A843]/10 border border-[#D4A843]/30 text-[#D4A843] text-xs px-3 py-1 rounded-full">
            <span>✨</span>
            <span>First time trying this beer!</span>
          </div>
        </div>
      )}

      {/* Footer: reactions */}
      <div className="px-4 py-3 border-t border-[var(--border)] flex items-center gap-3">
        {onReact && REACTIONS.map((r) => {
          const count = checkin.reactions?.filter((rx) => rx.type === r.type).length ?? 0;
          return (
            <motion.button
              key={r.type}
              whileTap={{ scale: 0.85 }}
              onClick={() => onReact(checkin.id, r.type)}
              className={cn(
                "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl transition-all",
                "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
                count > 0 && "text-[#D4A843] bg-[#D4A843]/10"
              )}
            >
              <span>{r.label}</span>
              {count > 0 && <span className="font-mono">{count}</span>}
            </motion.button>
          );
        })}
        <div className="ml-auto flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <MapPin size={11} />
          <span>{brewery.city}</span>
        </div>
      </div>
    </motion.div>
  );
}
