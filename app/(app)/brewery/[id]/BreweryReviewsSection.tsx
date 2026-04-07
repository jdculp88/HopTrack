"use client";

import { Trophy } from "lucide-react";
import { BreweryReview } from "@/components/brewery/BreweryReview";
import { LeaderboardRow } from "@/components/social/LeaderboardRow";
import type { Profile, BreweryVisit } from "@/types/database";

interface TopVisitor extends BreweryVisit {
  profile: Profile;
}

interface BreweryReviewsSectionProps {
  breweryId: string;
  currentUserId: string | null;
  topVisitors: TopVisitor[];
  isAuthenticated?: boolean;
  returnPath?: string;
}

export function BreweryReviewsSection({
  breweryId,
  currentUserId,
  topVisitors,
  isAuthenticated = true,
  returnPath,
}: BreweryReviewsSectionProps) {
  return (
    <>
      {/* Top Visitors Leaderboard — audit #20: moved ABOVE reviews for social proof */}
      {isAuthenticated && (
        <div>
          <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] mb-4">
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
                  currentUserId={currentUserId ?? ""}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--surface)] rounded-[14px] border border-[var(--border)]">
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3"
                   style={{ background: "var(--warm-bg, var(--surface-2))" }}>
                <Trophy size={24} style={{ color: "var(--text-muted)" }} />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                No visitors yet — be the first to start a session here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Brewery Reviews — below leaderboard per audit #20 */}
      <div>
        <BreweryReview
          breweryId={breweryId}
          currentUserId={currentUserId}
          isAuthenticated={isAuthenticated}
          returnPath={returnPath}
        />
      </div>
    </>
  );
}
