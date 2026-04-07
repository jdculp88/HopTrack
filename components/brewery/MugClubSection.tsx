"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Crown, Check, Users, Loader2, Gift } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import type { MugClub, MugClubMember } from "@/types/database";

interface MugClubWithCount extends MugClub {
  member_count: { count: number }[];
}

interface Props {
  clubs: MugClubWithCount[];
  myMemberships: MugClubMember[];
  breweryId?: string;
  isAuthenticated?: boolean;
  returnPath?: string;
}

export function MugClubSection({ clubs, myMemberships, breweryId, isAuthenticated = true, returnPath }: Props) {
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
        <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)]">
          Mug Clubs
        </h2>
      </div>
      <div className="space-y-4">
        {clubs.map((club) => {
          const membership = membershipMap.get(club.id);
          const perks = Array.isArray(club.perks)
            ? (club.perks as Array<string | { title: string; description?: string }>)
            : [];
          const count =
            club.member_count && club.member_count.length > 0
              ? club.member_count[0].count
              : 0;

          return (
            <div
              key={club.id}
              className="border rounded-[14px] p-5 space-y-3 relative overflow-hidden"
              style={{
                background: "repeating-linear-gradient(135deg, var(--card-bg, #FFFFFF), var(--card-bg, #FFFFFF) 6px, var(--warm-bg, var(--surface-2)) 6px, var(--warm-bg, var(--surface-2)) 7px)",
                borderColor: "var(--accent-gold)",
                borderWidth: "2px",
              }}
            >
              {/* Premium golden top bar — Card Type 13 */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: "linear-gradient(90deg, #D4A830, var(--amber, var(--accent-gold)), #D4A830)" }}
              />
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">
                    👑 {club.name}
                  </h3>
                  {club.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {club.description}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>
                    ${club.annual_fee}
                  </p>
                  <p className="text-xs font-mono text-[var(--text-muted)]">/ year</p>
                </div>
              </div>

              {/* Perks — with claim buttons for members */}
              {perks.length > 0 && (
                <ul className="space-y-1.5">
                  {perks.map((perk, i) => (
                    <PerkRow
                      key={i}
                      perk={perk}
                      perkIndex={i}
                      isMember={!!membership}
                      breweryId={breweryId}
                      mugClubId={club.id}
                    />
                  ))}
                </ul>
              )}

              {/* CTA + member count */}
              <div className="space-y-2.5 pt-1">
                {membership ? (
                  <div className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
                    style={{
                      background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                      color: "var(--accent-gold)",
                    }}
                  >
                    <Crown size={14} />
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
                ) : isAuthenticated ? (
                  <button
                    onClick={() => {
                      success(
                        "Contact the brewery to join \u2014 membership payments coming soon!"
                      );
                    }}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-colors text-center"
                    style={{
                      background: "var(--accent-gold)",
                      color: "var(--bg)",
                    }}
                  >
                    Join {club.name}
                  </button>
                ) : (
                  <a
                    href={`/signup?next=${encodeURIComponent(returnPath ?? "/")}`}
                    className="block w-full py-3 rounded-xl text-sm font-bold transition-colors text-center"
                    style={{
                      background: "var(--accent-gold)",
                      color: "var(--bg)",
                    }}
                  >
                    Sign Up to Join
                  </a>
                )}

                <p className="flex items-center justify-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
                  <Users size={12} />
                  {count} member{count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Perk Row with Claim Button ─────────────────────────────────────────────

function PerkRow({
  perk,
  perkIndex,
  isMember,
  breweryId,
  mugClubId,
}: {
  perk: string | { title: string; description?: string };
  perkIndex: number;
  isMember: boolean;
  breweryId?: string;
  mugClubId: string;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const generateCode = useCallback(async () => {
    if (!breweryId) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/redemptions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "mug_club_perk",
          brewery_id: breweryId,
          mug_club_id: mugClubId,
          perk_index: perkIndex,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCode(data.code);
        setExpiresAt(data.expires_at);
      }
    } finally {
      setGenerating(false);
    }
  }, [breweryId, mugClubId, perkIndex]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;
    function tick() {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt!).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setCode(null);
        setExpiresAt(null);
      }
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <li className="text-sm text-[var(--text-secondary)]">
      <div className="flex items-start gap-2.5">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 18%, transparent)" }}
        >
          <Check size={12} style={{ color: "var(--accent-gold)" }} />
        </div>
        <span className="flex-1">
          {typeof perk === "string" ? perk : perk.title}
          {typeof perk === "object" && perk.description && (
            <span className="block text-xs text-[var(--text-muted)]">{perk.description}</span>
          )}
        </span>
        {isMember && !code && (
          <button
            onClick={generateCode}
            disabled={generating}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors flex-shrink-0 disabled:opacity-60"
            style={{
              background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
              color: "var(--accent-gold)",
            }}
          >
            {generating ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <><Gift size={10} /> Claim</>
            )}
          </button>
        )}
      </div>
      <AnimatePresence>
        {code && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="ml-5 mt-1.5 px-3 py-2 rounded-lg" style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}>
              <div className="flex items-center gap-1">
                {code.split("").map((char, i) => (
                  <span
                    key={i}
                    className="w-6 h-7 rounded flex items-center justify-center font-mono text-sm font-bold"
                    style={{ background: "var(--card-bg)", border: "1px solid var(--accent-gold)", color: "var(--accent-gold)" }}
                  >
                    {char}
                  </span>
                ))}
                <span className="ml-2 text-xs font-mono" style={{ color: timeLeft <= 60 ? "var(--danger)" : "var(--text-muted)" }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                Show this code to your bartender
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
