"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, ChevronRight, X, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface Challenge {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  challenge_type: string;
  target_value: number;
  reward_description: string | null;
  reward_xp: number;
  ends_at: string | null;
}

interface Participation {
  id: string;
  current_progress: number;
  completed_at: string | null;
  challenge: Challenge;
}

interface Props {
  challenges: Challenge[];
  myParticipations: Participation[];
  isAuthenticated?: boolean;
  returnPath?: string;
}

export function BreweryChallenges({ challenges, myParticipations, isAuthenticated = true, returnPath }: Props) {
  const [participations, setParticipations] = useState<Participation[]>(myParticipations);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [joining, setJoining] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  if (challenges.length === 0) return null;

  const participationMap = new Map(participations.map(p => [p.challenge.id, p]));

  async function handleJoin(challenge: Challenge) {
    setJoining(true);
    try {
      const res = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challenge.id, source: "brewery_page" }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to join");
      }

      const participant = await res.json();
      setParticipations(prev => [...prev, { ...participant, challenge }]);
      toastSuccess(`Joined "${challenge.name}"! Start a session here to make progress.`);
      setSelected(null);
    } catch (e: any) {
      toastError(e.message);
    } finally {
      setJoining(false);
    }
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Challenges
          </h2>
          <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
            {challenges.length} active
          </span>
        </div>

        <div className="space-y-3">
          {challenges.map((challenge) => {
            const participation = participationMap.get(challenge.id);
            const progress = participation?.current_progress ?? 0;
            const isCompleted = !!participation?.completed_at;
            const pct = Math.min(100, Math.round((progress / challenge.target_value) * 100));
            const isExpired = challenge.ends_at && new Date(challenge.ends_at) < new Date();

            return (
              <button
                key={challenge.id}
                onClick={() => !isExpired && setSelected(challenge)}
                className="w-full text-left rounded-2xl border p-4 transition-all"
                style={{
                  background: isCompleted
                    ? "color-mix(in srgb, var(--accent-gold) 6%, var(--surface))"
                    : "var(--surface)",
                  borderColor: isCompleted
                    ? "var(--accent-gold)"
                    : "var(--border)",
                  opacity: isExpired ? 0.6 : 1,
                  cursor: isExpired ? "default" : "pointer",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{challenge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {challenge.name}
                      </p>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
                          <Check size={10} /> Done
                        </span>
                      )}
                      {isExpired && !isCompleted && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                          Ended
                        </span>
                      )}
                    </div>
                    {challenge.description && (
                      <p className="text-sm truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {challenge.description}
                      </p>
                    )}

                    {/* Progress bar — only if joined */}
                    {participation && (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                          <span>{progress} / {challenge.target_value}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: isCompleted ? "var(--accent-gold)" : "var(--accent-gold)", opacity: isCompleted ? 1 : 0.7 }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Reward pill + ends_at */}
                    <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      {challenge.reward_description && (
                        <span>🎁 {challenge.reward_description}</span>
                      )}
                      {!challenge.reward_description && challenge.reward_xp > 0 && (
                        <span>⭐ {challenge.reward_xp} XP</span>
                      )}
                      {challenge.ends_at && (
                        <span>Ends {new Date(challenge.ends_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {!isCompleted && !isExpired && (
                    <ChevronRight size={16} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Challenge detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.6)" }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl p-6 space-y-5 max-w-lg mx-auto"
              style={{ background: "var(--surface)" }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full mx-auto" style={{ background: "var(--border)" }} />

              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full"
                style={{ background: "var(--surface-2)" }}
              >
                <X size={16} style={{ color: "var(--text-muted)" }} />
              </button>

              {/* Icon + title */}
              <div className="text-center space-y-2">
                <span className="text-5xl block">{selected.icon}</span>
                <h3 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {selected.name}
                </h3>
                {selected.description && (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {selected.description}
                  </p>
                )}
              </div>

              {/* Goal */}
              <div className="rounded-2xl p-4 space-y-1" style={{ background: "var(--surface-2)" }}>
                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Goal</p>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {selected.challenge_type === "beer_count" && `Try ${selected.target_value} different beers`}
                  {selected.challenge_type === "specific_beers" && `Try all ${selected.target_value} selected beers`}
                  {selected.challenge_type === "visit_streak" && `Visit ${selected.target_value} times`}
                  {selected.challenge_type === "style_variety" && `Try ${selected.target_value} different styles`}
                </p>
              </div>

              {/* Reward */}
              {(selected.reward_description || selected.reward_xp > 0) && (
                <div className="rounded-2xl p-4 space-y-1"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)" }}>
                  <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>Reward</p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {selected.reward_description ?? `${selected.reward_xp} XP`}
                  </p>
                  {selected.reward_description && selected.reward_xp > 0 && (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>+ {selected.reward_xp} XP</p>
                  )}
                </div>
              )}

              {selected.ends_at && (
                <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  Ends {new Date(selected.ends_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}

              {/* CTA */}
              {!isAuthenticated ? (
                <a
                  href={`/signup?next=${encodeURIComponent(returnPath ?? "/")}`}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  <Trophy size={16} /> Sign Up to Accept Challenge
                </a>
              ) : !participationMap.has(selected.id) ? (
                <button
                  onClick={() => handleJoin(selected)}
                  disabled={joining}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  {joining ? (
                    <><Loader2 size={16} className="animate-spin" /> Joining...</>
                  ) : (
                    <><Trophy size={16} /> Accept Challenge</>
                  )}
                </button>
              ) : (
                <div className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  {participationMap.get(selected.id)?.completed_at
                    ? "🏆 Challenge complete!"
                    : "✅ You're in — visit and start a session to make progress."}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
