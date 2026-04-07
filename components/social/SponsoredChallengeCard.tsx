"use client";

import { motion } from "motion/react";
import { Trophy, MapPin, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface SponsoredChallenge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  challenge_type: string;
  target_value: number;
  reward_description: string | null;
  reward_xp: number;
  ends_at: string | null;
  cover_image_url: string | null;
  participant_count: number;
  brewery: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    cover_image_url: string | null;
  };
  distance_km: number | null;
  my_participation: {
    current_progress: number;
    completed_at: string | null;
  } | null;
}

interface Props {
  challenge: SponsoredChallenge;
}

export function SponsoredChallengeCard({ challenge }: Props) {
  const hasTracked = useRef(false);

  // Track impression once on mount
  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;
    fetch(`/api/challenges/${challenge.id}/impression`, { method: "POST" }).catch(() => {});
  }, [challenge.id]);

  const isJoined = !!challenge.my_participation;
  const isCompleted = !!challenge.my_participation?.completed_at;
  const progressPct = isJoined
    ? Math.min(100, Math.round((challenge.my_participation!.current_progress / challenge.target_value) * 100))
    : 0;

  const daysLeft = challenge.ends_at
    // eslint-disable-next-line react-hooks/purity
    ? Math.max(0, Math.ceil((new Date(challenge.ends_at).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <Link href={`/brewery/${challenge.brewery.id}?challenge=${challenge.id}`}>
      <motion.div
        className="relative flex-shrink-0 w-[280px] rounded-[14px] overflow-hidden"
        style={{ backgroundColor: "var(--surface)" }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Cover image or gradient */}
        <div className="relative h-28 overflow-hidden">
          {challenge.cover_image_url ? (
            <img
              src={challenge.cover_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(135deg, var(--surface-2), var(--surface))",
              }}
            />
          )}
          {/* Sponsored badge */}
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-medium"
            style={{
              backgroundColor: "var(--accent-gold)",
              color: "#0F0E0C",
            }}
          >
            Sponsored
          </div>
          {/* Icon overlay */}
          <div className="absolute bottom-2 right-2 text-2xl">{challenge.icon}</div>
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <div>
            <p className="font-display text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {challenge.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} style={{ color: "var(--text-muted)" }} />
              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                {challenge.brewery.name}
                {challenge.distance_km != null && ` · ${challenge.distance_km} km`}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-secondary)" }}>
            <span className="flex items-center gap-1">
              <Users size={10} />
              {challenge.participant_count}
            </span>
            <span className="flex items-center gap-1">
              <Trophy size={10} style={{ color: "var(--accent-gold)" }} />
              {challenge.reward_xp} XP
            </span>
            {daysLeft != null && (
              <span>{daysLeft}d left</span>
            )}
          </div>

          {/* Progress bar (if joined) */}
          {isJoined && (
            <div className="space-y-1">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: isCompleted ? "#22c55e" : "var(--accent-gold)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                {isCompleted ? "Completed!" : `${challenge.my_participation!.current_progress}/${challenge.target_value}`}
              </p>
            </div>
          )}

          {/* CTA */}
          {!isJoined && (
            <div
              className="flex items-center justify-between text-[11px] font-medium pt-1"
              style={{ color: "var(--accent-gold)" }}
            >
              <span>View Challenge</span>
              <ChevronRight size={12} />
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
