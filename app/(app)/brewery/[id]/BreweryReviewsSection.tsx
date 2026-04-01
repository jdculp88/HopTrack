"use client";

import { BreweryReview } from "@/components/brewery/BreweryReview";
import { LeaderboardRow } from "@/components/social/LeaderboardRow";
import type { Profile, BreweryVisit } from "@/types/database";

interface TopVisitor extends BreweryVisit {
  profile: Profile;
}

interface BreweryReviewsSectionProps {
  breweryId: string;
  currentUserId: string;
  topVisitors: TopVisitor[];
}

export function BreweryReviewsSection({
  breweryId,
  currentUserId,
  topVisitors,
}: BreweryReviewsSectionProps) {
  return (
    <>
      {/* Brewery Reviews */}
      <div>
        <BreweryReview breweryId={breweryId} currentUserId={currentUserId} />
      </div>

      {/* Top Visitors Leaderboard */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mb-4">
          Top Visitors
        </h2>
        {topVisitors.length > 0 ? (
          <div className="space-y-1">
            {topVisitors.map((visit, i) => (
              <LeaderboardRow
                key={visit.id}
                entry={{
                  rank: i + 1,
                  profile: visit.profile,
                  value: visit.total_visits,
                }}
                label="visits"
                currentUserId={currentUserId}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm text-[var(--text-secondary)]">
              No visitors yet — be the first to start a session here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
