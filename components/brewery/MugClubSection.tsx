"use client";

import { Crown, Check, Users } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { MugClub, MugClubMember } from "@/types/database";

interface MugClubWithCount extends MugClub {
  member_count: { count: number }[];
}

interface Props {
  clubs: MugClubWithCount[];
  myMemberships: MugClubMember[];
}

export function MugClubSection({ clubs, myMemberships }: Props) {
  const { success } = useToast();

  if (clubs.length === 0) return null;

  const membershipMap = new Map(
    myMemberships
      .filter((m) => m.status === "active")
      .map((m) => [m.mug_club_id, m])
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Crown size={20} style={{ color: "var(--accent-gold)" }} />
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
          Mug Clubs
        </h2>
      </div>
      <div className="space-y-4">
        {clubs.map((club) => {
          const membership = membershipMap.get(club.id);
          const perks = Array.isArray(club.perks) ? (club.perks as string[]) : [];
          const count =
            club.member_count && club.member_count.length > 0
              ? club.member_count[0].count
              : 0;

          return (
            <div
              key={club.id}
              className="card-bg-stats border rounded-2xl p-5 space-y-3"
              style={{ borderColor: membership ? "var(--accent-gold)" : "var(--border)" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    {club.name}
                  </h3>
                  {club.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {club.description}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-xl font-bold text-[var(--accent-gold)]">
                    ${club.annual_fee}
                  </p>
                  <p className="text-xs font-mono text-[var(--text-muted)]">/ year</p>
                </div>
              </div>

              {/* Perks */}
              {perks.length > 0 && (
                <ul className="space-y-1.5">
                  {perks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <Check
                        size={14}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: "var(--accent-gold)" }}
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
              )}

              {/* Footer: member count + action */}
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
                  <Users size={12} />
                  {count} member{count !== 1 ? "s" : ""}
                </span>

                {membership ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                      color: "var(--accent-gold)",
                    }}
                  >
                    <Crown size={12} />
                    You&apos;re a member
                    {membership.expires_at && (
                      <span className="font-mono font-normal text-[var(--text-muted)] ml-1">
                        exp {new Date(membership.expires_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      success(
                        "Contact the brewery to join \u2014 membership payments coming soon!"
                      );
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      background: "var(--accent-gold)",
                      color: "var(--bg)",
                    }}
                  >
                    Join Club
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
